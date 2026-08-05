---
title: AlmaLinux 9.5 安装 Docker 最新版与 Compose 插件｜环境搭建
categories: Docker
tags:
  - Docker
  - Linux
  - AlmaLinux
  - Docker Compose
  - 环境搭建
id: notes-almalinux-docker-install
date: 2026-08-05 09:52:24
---

## 背景

AlmaLinux 9.5 作为 RHEL 9 的兼容发行版，在安装 Docker 时需使用官方为 CentOS 9 提供的软件源。本文记录了从零开始安装 Docker 引擎（`docker-ce`）及官方 Compose 插件（`docker-compose-plugin`）的完整步骤，并涵盖启动、免 `sudo` 配置、防火墙开放以及常见内核模块缺失问题的解决方案。

## 安装前准备

### 1. 更新系统并移除旧组件

确保系统包索引最新，并卸载可能冲突的旧版 Docker 或 Podman：

```bash
sudo dnf --refresh update
sudo dnf upgrade -y
sudo dnf remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine podman runc
```

### 2. 安装核心工具并添加 Docker 官方源

```bash
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

> 对于 AlmaLinux 9.5，使用 CentOS 9 的仓库地址是官方推荐且经过广泛验证的做法。

## 安装 Docker 引擎与 Compose 插件

执行一条命令安装所有必要组件：

```bash
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

安装内容说明：
- `docker-ce`：Docker 守护进程（引擎）
- `docker-ce-cli`：命令行客户端
- `containerd.io`：容器运行时
- `docker-buildx-plugin`：多平台构建插件
- `docker-compose-plugin`：**官方 Compose V2 插件**（使用 `docker compose` 命令）

## 启动服务并验证安装

### 启动 Docker 并设置开机自启

```bash
sudo systemctl enable --now docker
```

### 检查服务状态与版本

```bash
sudo systemctl status docker
# 查看 Docker 引擎版本
docker --version
# 查看 Compose 插件版本（注意中间有空格）
docker compose version
```

### 运行 Hello-World 测试

```bash
sudo docker run hello-world
```

若输出欢迎信息并显示“Hello from Docker!”，则说明安装成功。

## 非 root 用户使用 Docker（免 sudo）

将当前用户加入 `docker` 用户组，之后执行 `docker` 命令无需再添加 `sudo`：

```bash
sudo usermod -aG docker $USER
newgrp docker
# 重新测试
docker run hello-world
```

## 防火墙配置（可选）

如果系统启用了 `firewalld`，需开放容器需要对外暴露的端口。例如开放 80 和 443：

```bash
sudo firewall-cmd --permanent --add-port=80/tcp --add-port=443/tcp
sudo firewall-cmd --reload
```

## 常见问题排查

### 内核模块缺失（`xt_addrtype` 错误）

AlmaLinux 9.5 的某些最小化或云镜像可能缺少 `xt_addrtype` 内核模块，导致容器启动时出现类似 `iptables failed: ... xt_addrtype` 的错误。解决方法：

```bash
sudo dnf install -y kernel-modules-extra
sudo reboot
```

重启后 Docker 服务能正常操作网络规则。

### 无法连接 Docker 守护进程

若提示“Cannot connect to the Docker daemon”，请检查服务是否运行：

```bash
sudo systemctl start docker
```

或查看日志定位具体原因：

```bash
sudo journalctl -u docker -f
```

## 总结

通过上述步骤，可在 AlmaLinux 9.5 上快速部署最新版本的 Docker 及 Compose 插件。关键点在于：
- 使用正确的 CentOS 9 软件源；
- 安装 `docker-compose-plugin` 而非独立的 Compose 二进制；
- 如遇网络相关报错，优先检查内核模块完整性。

完成安装后，即可正常拉取镜像、运行容器及使用 `docker compose` 编排多服务应用。
