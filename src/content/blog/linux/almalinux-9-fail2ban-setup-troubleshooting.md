---
title: AlmaLinux 9.5 部署 Fail2ban 与封禁失效排查｜系统安全
categories: Fail2ban
tags:
  - Fail2ban
  - AlmaLinux
  - firewalld
  - SSH
  - 故障排查
id: notes-almalinux-9-fail2ban-setup-troubleshooting
date: 2026-10-27 09:44:14
---

## 背景

在 AlmaLinux 9.5 上部署 Fail2ban，目标是对 SSH 等服务的暴力破解尝试进行自动封禁。实际部署后出现了一个典型现象：Fail2ban 的 Filter 能匹配到失败登录记录，但 Actions 没有触发封禁，`firewall-cmd --list-rich-rules` 也没有任何封禁规则。本文按安装、配置、动作选择、状态排查的顺序整理可复现的操作记录，并给出分层定位思路。

## 安装与仓库

Fail2ban 位于 EPEL 仓库中，AlmaLinux 9 默认使用 firewalld，因此需要同时安装 firewalld 集成子包：

```bash
sudo dnf update -y
sudo dnf install epel-release -y
sudo dnf install fail2ban fail2ban-firewalld -y
```

`fail2ban-firewalld` 提供 firewalld 相关的 action 定义。如果缺失，即使配置了 firewalld 的 `banaction`，封禁动作也可能执行失败。

## 配置方式

不要直接编辑 `/etc/fail2ban/jail.conf`，因为软件包更新时可能被覆盖。推荐创建 `/etc/fail2ban/jail.local`，并在 `/etc/fail2ban/jail.d/` 下按服务拆分 `.local` 文件。

全局配置示例：

```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
backend = systemd
banaction = firewallcmd-rich-rules
banaction_allports = firewallcmd-rich-rules
ignoreip = 127.0.0.1/8 ::1 192.0.2.0/24 <YOUR_MANAGEMENT_IP>
```

SSH 防护可以单独写入 `/etc/fail2ban/jail.d/sshd.local`：

```ini
[sshd]
enabled = true
port = ssh
backend = systemd
maxretry = 3
bantime = 1d
findtime = 15m
```

上述配置表示：同一 IP 在 15 分钟内 SSH 失败 3 次，封禁 1 天。配置前务必把管理 IP 加入 `ignoreip`，避免把自己锁在服务器外。

## 为什么要把 iptables-multiport 改成 firewalld 动作

在 AlmaLinux 9 上，不建议继续使用：

```ini
banaction = iptables-multiport
banaction_allports = iptables-allports
```

AlmaLinux 9 默认使用 firewalld 管理防火墙，底层为 nftables。Fail2ban 直接操作 iptables 时，封禁规则可能写入 iptables，但 firewalld 并不知情，导致 `firewall-cmd --list-rich-rules` 看不到封禁 IP，集中管理和排查都会变得困难。

推荐改为：

```ini
[DEFAULT]
banaction = firewallcmd-rich-rules
banaction_allports = firewallcmd-rich-rules
```

`firewallcmd-rich-rules` 生成的规则会出现在 `firewall-cmd --list-rich-rules` 输出中，可见性和可排查性更好。`firewallcmd-ipset` 效率高，但封禁条目不会直接显示在 rich-rules 列表中。将 `banaction_allports` 也统一为 `firewallcmd-rich-rules`，可以避免不同动作行为不一致。

修改后需要确认实际生效的 action：

```bash
sudo fail2ban-client get sshd actions
```

如果仍显示 `iptables-multiport`，应检查 `fail2ban-firewalld` 是否安装、配置是否被更高优先级文件覆盖。安装子包后建议重启而非 reload：

```bash
sudo systemctl restart fail2ban
```

## 启动与基础验证

```bash
sudo systemctl enable --now fail2ban
sudo systemctl status fail2ban --no-pager
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

一个实际出现过的状态输出如下，主机名和提示符已省略：

```text
Status
|- Number of jail:      1
`- Jail list:   sshd

Status for the jail: sshd
|- Filter
|  |- Currently failed: 3
|  |- Total failed:     4
|  `- Journal matches:  _SYSTEMD_UNIT=sshd.service + _COMM=sshd + _COMM=sshd-session
`- Actions
   |- Currently banned: 0
   |- Total banned:     0
   `- Banned IP list:
```

同时执行：

```bash
sudo firewall-cmd --list-rich-rules
```

输出为空。

这个状态说明 Filter 已经匹配到失败记录，但 Actions 完全没有触发封禁。问题不在“是否识别到攻击”，而在“累积失败到执行封禁”之间的环节。

## 排查一：阈值与时间窗口

`maxretry = 3`、`findtime = 15m` 要求同一个 IP 在 15 分钟窗口内累计失败 3 次才会触发封禁。`Currently failed: 3` 是瞬时全局计数，可能来自多个不同 IP 各失败 1 次，也可能这 3 次失败分布在超过 15 分钟的区间里。这两种情况下都不会触发封禁。

先查看日志中是否出现过封禁记录：

```bash
sudo grep -i "ban" /var/log/fail2ban.log
```

如果完全没有 `Ban` 或 `Found` 记录，说明还没有 IP 满足阈值，可以继续用后面的手动测试验证动作本身是否正常。

## 排查二：确认 banaction 是否真正生效

这是最容易出问题的一环。即使 `jail.local` 中写了 `banaction = firewallcmd-rich-rules`，如果 `fail2ban-firewalld` 没有安装，或者配置没有被正确加载，封禁动作可能静默失败。

检查包和实际 action：

```bash
rpm -qa | grep fail2ban-firewalld
sudo fail2ban-client get sshd actions
```

同时搜索动作执行相关报错：

```bash
sudo grep -iE "error|failed to execute|firewallcmd" /var/log/fail2ban.log
```

如果包缺失，安装后重启 Fail2ban：

```bash
sudo dnf install fail2ban-firewalld -y
sudo systemctl restart fail2ban
```

## 排查三：检查 ignoreip 白名单

`ignoreip` 中的 IP 会被计数但永远不会被封禁。如果攻击恰好来自白名单网段，封禁就不会发生。

```bash
sudo fail2ban-client get sshd ignoreip
```

对照输出，确认触发失败的 IP 不在白名单范围内。白名单范围不宜过大，但必须保留自己的管理 IP。

## 排查四：Filter 与 journalmatch 的兼容性

虽然 Filter 目前能匹配到失败记录，但仍有边缘情况：`sshd.conf` 中的 `journalmatch` 与当前 OpenSSH 版本的 journal 标签不完全吻合。OpenSSH 更新后，journal 单元名或 `_COMM` 字段可能变化，导致 Fail2ban 只能零星匹配，无法按 IP 持续、准确追踪失败频率，从而永远凑不齐阈值。

可以用离线测试工具拿当前 journal 数据跑一遍 filter：

```bash
sudo fail2ban-regex systemd-journal /etc/fail2ban/filter.d/sshd.conf --print-all-matched
```

关注输出中的 `Addresses` 列表。如果 IP 与预期攻击源不一致，或匹配行数极少，说明 `journalmatch` 需要根据当前系统实际 journal 标签微调。

## 排查五：手动封禁测试锁定故障层

绕过日志和阈值，直接手动触发一次封禁，是判断问题在动作层还是计数层最直接的方法：

```bash
sudo fail2ban-client set sshd banip 203.0.113.100
sudo fail2ban-client status sshd
sudo firewall-cmd --list-rich-rules
```

根据结果判断：

- 如果 `Banned IP list` 出现该 IP，且 firewalld 富规则也出现，说明 `banaction` 正常，问题在阈值计算或 filter 匹配，回到排查一和排查四。
- 如果 `Banned IP list` 有但 firewalld 中没有，说明 `banaction` 执行失败，重点检查 `fail2ban-firewalld` 和日志中的 action 报错。
- 如果 `Banned IP list` 本身也没有，说明 `sshd` jail 的 action 配置可能没有正确加载，用 `fail2ban-client get sshd actions` 确认，并考虑重启 Fail2ban。

测试完成后解封：

```bash
sudo fail2ban-client set sshd unbanip 203.0.113.100
```

## 常用管理命令

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
sudo fail2ban-client set sshd banip 203.0.113.100
sudo fail2ban-client set sshd unbanip 203.0.113.100
sudo fail2ban-client reload
sudo tail -f /var/log/fail2ban.log
```

## 结论

当前状态可以概括为 Filter 通、Actions 断：Filter 已匹配到失败记录，但封禁动作没有产生可见结果。在未执行手动封禁测试前，不能断定唯一根因。建议先手动封禁一个测试 IP，锁定问题是在动作层还是计数层；再根据结果检查 `fail2ban-firewalld`、`banaction`、`ignoreip`、阈值与 `journalmatch`。在 AlmaLinux 9.5 上，优先使用 `firewallcmd-rich-rules`，并确保安装 `fail2ban-firewalld`，可以让封禁规则在 firewalld 中可见，便于后续审计和排错。
