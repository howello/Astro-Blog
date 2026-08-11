---
title: vfox 管理 Java/Node.js/Maven 版本｜环境配置
categories: 环境配置
tags:
  - AlmaLinux
  - vfox
  - Java
  - Node.js
  - Maven
id: notes-vfox-installation-almalinux
date: 2026-08-11 12:13:55
---

## 背景

在 AlmaLinux 9.5 服务器上开发时，经常需要在不同版本的 Java、Node.js 和 Maven 之间切换。传统的手动下载、配置 `JAVA_HOME` 和 `PATH` 方式繁琐且容易出错。`vfox`（VersionFox）是一个跨平台的版本管理工具，支持通过插件管理多种 SDK，可以很好地解决这个问题。

本文记录在 AlmaLinux 9.5 上使用 `dnf` 安装 vfox，并配置 Oracle JDK、Node.js 和 Maven 版本管理的完整过程，以及踩到的 Shell 集成问题及解决。

## 安装 vfox

AlmaLinux 9.5 默认包管理器为 `dnf`，vfox 官方提供了 YUM 仓库，可以直接安装。

添加官方仓库并安装：

```bash
echo '[vfox]
name=VersionFox Repo
baseurl=https://yum.fury.io/versionfox/
enabled=1
gpgcheck=0' | sudo tee /etc/yum.repos.d/versionfox.repo

sudo dnf install vfox
```

> 注：AlmaLinux 9 中 `yum` 命令实际是 `dnf` 的软链接，使用 `dnf` 更规范，输出信息也更清晰。

## 挂载 vfox 到 Shell

为了让 `vfox` 命令在任意终端生效，需要将激活脚本挂载到 Bash。执行：

```bash
echo 'eval "$(vfox activate bash)"' >> ~/.bashrc
source ~/.bashrc
```

验证安装：

```bash
vfox --version
```

## 常见问题：`vfox requires hook support` 报错

在执行 `vfox use` 切换版本时，如果遇到：

```
vfox requires hook support. Please ensure vfox is properly initialized with 'vfox activate'
```

这表示当前 Shell 没有加载 vfox 的激活脚本。可能原因及解决：

- **原因**：刚修改 `~/.bashrc` 后未执行 `source ~/.bashrc`，或当前终端是新开启的但未自动加载（如通过 `su` 切换的用户可能不会执行 `.bashrc`）。
- **临时解决**：手动执行 `eval "$(vfox activate bash)"` 使当前会话生效。
- **永久解决**：确认 `~/.bashrc` 中包含上述 `eval` 行，并执行 `source ~/.bashrc`。若为 `root` 用户，确保修改的是 `/root/.bashrc`。

执行激活后，再使用 `vfox use` 即可正常切换。

## 管理 Java（Oracle JDK）版本

### 添加 Java 插件
```bash
vfox add java
```

### 搜索可用的 Oracle JDK 版本
```bash
vfox search java oracle
```

### 安装指定版本并设为全局
例如安装 `21.0.12-oracle`：

```bash
vfox install java@21.0.12-oracle
vfox use -g java@21.0.12-oracle
```

`-g` 参数使其成为所有新终端的默认版本。验证：

```bash
java -version
```

## 管理 Node.js 版本

### 添加 Node.js 插件
```bash
vfox add nodejs
```

### 安装并全局使用 LTS 版本
```bash
vfox install nodejs@lts
vfox use -g nodejs@lts
```

也可安装具体版本，如 `21.5.0`。验证：

```bash
node -v
```

## 管理 Maven 版本

### 添加 Maven 插件
```bash
vfox add maven
```

### 安装指定版本并全局使用
```bash
vfox install maven@3.9.8
vfox use -g maven@3.9.8
```

### 重要依赖关系
Maven 运行依赖 Java 环境，必须保证 `JAVA_HOME` 指向正确的 JDK。**务必先设置好 Java 的全局版本，再设置 Maven**，否则 `mvn -version` 会报 `JAVA_HOME` 错误。

正确的流程：
```bash
# 先设置 Java
vfox use -g java@21.0.12-oracle
# 再设置 Maven
vfox use -g maven@3.9.8
```

验证：
```bash
mvn -version
```

## 常用管理命令

| 命令 | 说明 |
| :--- | :--- |
| `vfox add <插件名>` | 添加 SDK 插件 |
| `vfox search <插件名>` | 查看可安装的版本 |
| `vfox install <插件名>@<版本>` | 安装指定版本 |
| `vfox use <插件名>@<版本>` | 当前会话切换版本 |
| `vfox use -g <插件名>@<版本>` | 全局切换默认版本 |
| `vfox list <插件名>` | 列出已安装版本 |
| `vfox remove <插件名>` | 移除插件 |

## 总结

通过 vfox 配合 dnf 安装，可以在 AlmaLinux 9.5 上轻松管理多语言运行时版本。关键点：

- 使用 dnf 安装官方仓库，简单可靠。
- 务必正确挂载 Shell 激活脚本，否则切换命令无效。
- 设置全局版本时使用 `-g`，避免每次手动切换。
- 注意依赖顺序：Java 是 Maven 的前提，需先配置。

这套方案同样适用于 RHEL 9 和 CentOS Stream 9 等衍生发行版。
