---
title: 从1308次暴力破解到SSH密钥加固｜AlmaLinux实战
categories: Linux运维
tags:
  - Linux运维
  - SSH
  - 密钥认证
  - SELinux
  - 安全加固
id: notes-ssh-security-hardening
date: 2026-08-03 17:59:00
---

## 背景

登录 VPS 时，终端弹出这样一条警告：

```
Last failed login: Tue Jul 21 22:43:22 EDT 2026 from 120.26.174.61 on ssh:notty
There were 1308 failed login attempts since the last successful login.
```

1308 次失败登录尝试，且最近一次发生在一小时前——这意味着 SSH 暴力破解攻击正在进行中。攻击者通过自动化脚本不断试探 root 密码，虽然尚未成功，但必须立即加固系统。

本文记录了在 **AlmaLinux 9.5** 环境下，将 SSH 从密码认证迁移至 **ED25519 密钥认证** 的完整过程，包括防火墙、SELinux 配置，以及一个容易被忽略的配置覆盖问题及其排查方法。

## 威胁评估与应对策略

`1308 次 failed` 说明攻击者尚未得手，但 `notty` 表明这是脚本在批量爆破，而非人工操作。攻击源 IP `120.26.174.61` 归属于云服务商网段，大概率是被控制的跳板机。

应对此类攻击，单纯封禁一个 IP 没有意义（攻击者随时换 IP）。根本方案是 **禁用密码登录，仅允许密钥认证**——这样无论攻击者尝试多少次，都没有任何机会。

## 第一步：生成 ED25519 密钥对

ED25519 是目前 OpenSSH 推荐的非对称加密算法，相比 RSA 2048 位，它密钥更短、速度更快、安全性更高。

在本地机器（Windows 使用 Xshell）操作：

1. 打开 Xshell → 工具 → **用户密钥生成向导**
2. 密钥类型选 **ED25519**（旧版本无此选项则选 RSA 2048）
3. 生成过程中随意晃动鼠标增加随机熵
4. 设置密钥名称（如 `MyVPS_Key`）和密码短语（**强烈建议设置**，即使私钥泄露也无法直接使用）
5. 点击完成，**保存私钥**到本地安全目录（如 `C:\Keys\`）
6. 点击 **导出公钥**，格式选 SSH2（兼容 OpenSSH），保存为 `id_ed25519.pub`

## 第二步：上传公钥到 VPS

使用 Xftp 连接 VPS（协议选 SFTP，端口先用 22）：

1. 进入远程目录 `/root/`
2. 检查是否存在 `.ssh` 文件夹，若没有则新建
3. 进入 `.ssh` 目录，将本地 `id_ed25519.pub` 拖入
4. **重命名** 为 `authorized_keys`（**无后缀名**，不是 `authorized_keys.pub`）
5. 若该文件已存在，双击打开，将公钥内容**追加**到新一行，切勿覆盖

上传完成后，回到 Xshell 执行权限修正：

```bash
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys
restorecon -Rv /root/.ssh
```

`restorecon` 用于恢复 SELinux 上下文，确保 SSH 进程有权限读取该文件。

## 第三步：放行新端口（防火墙 + SELinux）

AlmaLinux 9.5 默认启用 SELinux，SSH 端口变更时必须显式告知 SELinux，否则重启服务后会被拦截。

```bash
# 安装 SELinux 管理工具
dnf install -y policycoreutils-python-utils

# 将 22222 端口加入 SSH 的 SELinux 白名单
semanage port -a -t ssh_port_t -p tcp 22222

# firewalld 放行新端口
firewall-cmd --add-port=22222/tcp --permanent
firewall-cmd --reload

# 验证是否生效
semanage port -l | grep ssh
```

## 第四步：修改 SSH 服务端配置

编辑 `/etc/ssh/sshd_config`：

```ini
# 更换端口
Port 22222

# 禁止 root 使用密码登录（密钥登录不受影响）
PermitRootLogin prohibit-password

# 关闭密码认证——这是对抗暴力破解的核心
PasswordAuthentication no

# 关闭空密码
PermitEmptyPasswords no

# 明确启用公钥认证
PubkeyAuthentication yes
```

保存后重载 SSH 服务：

```bash
systemctl reload sshd
```

> `reload` 比 `restart` 更安全，不会中断已有连接，只需新会话加载新配置。

## 第五步：测试新配置

**不要关闭当前 Xshell 连接**，新建一个会话测试：

- 主机：VPS IP
- 端口：22222
- 认证方式：Public Key（公钥），选择刚生成的私钥，输入密码短语

如果新会话成功连接，说明密钥认证已生效，可以关闭旧会话。

## 踩坑实录：密码登录为何仍然有效？

配置完成后发现，使用密码认证方式依然可以登录。排查过程如下：

首先查看当前生效的配置：

```bash
sshd -T | grep -E "passwordauthentication|permitrootlogin|pubkeyauthentication"
```

输出中 `passwordauthentication yes` 表明配置并未真正关闭。

接着搜索所有相关配置：

```bash
grep -r "PasswordAuthentication" /etc/ssh/sshd_config /etc/ssh/sshd_config.d/
```

结果如下：

```
/etc/ssh/sshd_config:PasswordAuthentication no
/etc/ssh/sshd_config.d/allow_root.conf:PasswordAuthentication yes
/etc/ssh/sshd_config.d/50-cloud-init.conf:PasswordAuthentication yes
```

**根因找到了**：主配置文件确实写的是 `no`，但 `/etc/ssh/sshd_config.d/` 目录下的两个配置文件在后加载，**覆盖**了主配置的 `no`。

其中 `50-cloud-init.conf` 是云厂商（阿里/腾讯/华为等）默认写入的，目的是让用户能通过云控制台重置密码登录；`allow_root.conf` 推测是用户自己或某工具生成的。

### 修复方法

直接删除这两个覆盖文件（它们已无保留价值）：

```bash
rm -f /etc/ssh/sshd_config.d/50-cloud-init.conf
rm -f /etc/ssh/sshd_config.d/allow_root.conf
systemctl reload sshd
```

再次尝试密码登录，终端返回：

```
Permission denied (publickey,gssapi-keyex,gssapi-with-mic)
```

**至此，密码登录彻底失效，密钥认证才是唯一入口。**

## 第六步：清理登录日志

完成加固后，顺手清理被污染的历史登录日志，便于后续监控异常登录：

```bash
# 清空失败登录记录（/var/log/btmp）
truncate -s 0 /var/log/btmp

# 清空成功登录历史（/var/log/wtmp）
truncate -s 0 /var/log/wtmp

# 清空 SSH 认证详细日志（/var/log/secure）
truncate -s 0 /var/log/secure
```

验证：

```bash
last   # 应显示空白或 wtmp begins ...
lastb  # 应无记录
```

## 后续监控建议

可开一个窗口持续监控实时登录尝试：

```bash
tail -f /var/log/secure
```

有异常 IP 出现时会实时显示。若再收到暴力破解骚扰，可安装 Fail2ban 做自动化封禁：

```bash
dnf install -y epel-release
sudo dnf install -y fail2ban
sudo systemctl enable --now fail2ban
```

## 总结

| 关键步骤 | 要点 |
|---|---|
| 密钥生成 | 优先选 ED25519，私钥务必加密保存 |
| 公钥上传 | `/root/.ssh/authorized_keys`，权限 600 |
| 端口变更 | 防火墙 + SELinux 双双放行 |
| 密码关闭 | 不仅要改主配置，还要检查 `sshd_config.d/` 是否有覆盖项 |
| 配置验证 | `sshd -T` 查看真实生效参数 |
| 日志清理 | `truncate -s 0 /var/log/{btmp,wtmp,secure}` |

**一句话经验**：云服务器默认的 `50-cloud-init.conf` 会覆盖 SSH 主配置，关闭密码登录时务必检查 `/etc/ssh/sshd_config.d/` 目录下的所有文件。

## 参考命令速查

```bash
# 查看当前 SSH 实际生效配置
sshd -T | grep -E "passwordauthentication|permitrootlogin|pubkeyauthentication"

# 搜索所有 PasswordAuthentication 配置
grep -r "PasswordAuthentication" /etc/ssh/sshd_config /etc/ssh/sshd_config.d/

# SELinux 放行端口
semanage port -a -t ssh_port_t -p tcp <端口号>

# 防火墙放行端口
firewall-cmd --add-port=<端口号>/tcp --permanent && firewall-cmd --reload

# 重载 SSH（不中断现有连接）
systemctl reload sshd
```
