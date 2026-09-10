---
title: 使用 Docker + rclone 定时备份 VPS 目录到 Google Drive｜Dpanel 定时任务
categories: Docker
tags:
  - Docker
  - rclone
  - Google Drive
  - 定时备份
  - Dpanel
id: docker-rclone-gdrive-backup
date: 2026-09-10 09:08:42
---

## 背景与需求

在 AlmaLinux VPS 上，需要将 `/opt/compose/` 目录定时压缩并上传到 Google Drive。要求所有 rclone 相关文件统一放在 `/opt/compose/rclone/` 下，使用 Docker Compose 部署官方 rclone 容器，并通过 Dpanel 的定时任务执行备份脚本。

## 目录结构

```
/opt/compose/
├── rclone/
│   ├── docker-compose.yml
│   ├── config/                # rclone 配置目录
│   │   └── rclone.conf
│   ├── scripts/
│   │   └── backup.sh
│   └── logs/
│       └── backup.log
└── (其他服务文件)
```

## Docker Compose 配置

使用官方 `rclone/rclone:latest` 镜像，以 `sleep infinity` 保持容器运行，便于 Dpanel 通过 `docker exec` 执行脚本。

```yaml
version: '3'
services:
  rclone:
    image: rclone/rclone:latest
    container_name: rclone
    restart: unless-stopped
    entrypoint: /bin/sh
    command: ["-c", "sleep infinity"]
    volumes:
      - ./config:/config/rclone        # 挂载目录而非单文件，避免 rename 失败
      - ./scripts:/scripts:ro
      - /opt/compose:/source:ro
      - /tmp/compose-backup:/tmp-backup
      - ./logs:/logs:rw
    environment:
      - TZ=Asia/Shanghai
```

**关键点**：挂载 `./config:/config/rclone` 整个目录，而不是 `./rclone.conf:/config/rclone/rclone.conf`。单文件挂载会导致容器内 `rclone config reconnect` 时重命名配置文件失败，报 `device or resource busy`。

## 备份脚本

脚本位于 `/opt/compose/rclone/scripts/backup.sh`，功能：压缩 `/source`（排除 `rclone` 目录），上传到 Google Drive，使用固定文件名覆盖，清理本地压缩包。

```bash
#!/bin/sh

LOG_FILE="/logs/backup.log"
REMOTE_NAME="gdrive"
REMOTE_PATH="VPS-Backups"
SOURCE_DIR="/source"
TEMP_DIR="/tmp-backup"
ARCHIVE="${TEMP_DIR}/compose-backup-latest.tar.gz"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "$(date) - 备份开始"

echo "$(date) - 正在压缩 ${SOURCE_DIR}（排除 rclone 目录）-> ${ARCHIVE}"
tar -czf "${ARCHIVE}" -C "${SOURCE_DIR}" --exclude="rclone" .
if [ $? -ne 0 ]; then
    echo "$(date) - 压缩失败，退出"
    exit 1
fi

echo "$(date) - 正在上传至 ${REMOTE_NAME}:${REMOTE_PATH}"
rclone copy "${ARCHIVE}" "${REMOTE_NAME}:${REMOTE_PATH}" --log-level INFO
if [ $? -eq 0 ]; then
    echo "$(date) - 上传成功，删除本地压缩包"
    rm -f "${ARCHIVE}"
else
    echo "$(date) - 上传失败，压缩包保留在 ${ARCHIVE}"
    exit 1
fi

echo "$(date) - 备份结束"
```

赋予执行权限：

```bash
chmod +x /opt/compose/rclone/scripts/backup.sh
```

## rclone 配置 Google Drive

### 创建 Google Cloud 项目并启用 API

1. 访问 Google Cloud Console，创建项目。
2. 在 API 库中搜索并启用 **Google Drive API**。
3. 配置 OAuth 同意屏幕（外部），添加测试用户（你的 Google 账号）。
4. 创建 OAuth 客户端 ID（桌面应用），获取 `client_id` 和 `client_secret`。

### 在容器内配置 rclone

进入容器：

```bash
docker exec -it rclone /bin/sh
```

执行配置：

```bash
rclone config
```

- 新建 remote，命名为 `gdrive`。
- 存储类型选 `drive`。
- 输入 `client_id` 和 `client_secret`。
- scope 选 `1`（完全访问）。
- `service_account_file` 留空。
- `Edit advanced config` 选 `n`。
- `Use web browser` 选 `n`（无浏览器模式）。
- 复制终端显示的授权链接，在本地浏览器打开，登录 Google 账号授权。
- 将浏览器返回的验证码粘贴回终端。
- 配置完成后，测试 `rclone lsd gdrive:`。

**注意**：如果遇到 `device or resource busy`，检查挂载方式，确保挂载的是目录而非单文件。

## Dpanel 定时任务配置

在 Dpanel 中创建计划任务：

- 名称：`备份 /opt/compose 到 Google Drive`
- 触发类型：周期，Cron 表达式如 `0 3 * * *`
- 等待本次任务执行完成：勾选
- 脚本执行环境：执行容器
- 执行容器：`rclone`
- 脚本执行超时：`3600` 秒
- 保留日志数量：`30`
- 执行脚本：`/bin/sh /scripts/backup.sh`

保存后手动执行一次，检查日志。

## 踩坑与解决

1. **单文件挂载导致 rename 失败**：`rclone config reconnect` 报 `device or resource busy`。改为挂载整个 `config` 目录解决。
2. **Google Drive API 未启用**：报 `Google Drive API has not been used in project ... or it is disabled`。去 Google Cloud 控制台启用 API。
3. **rclone 参数冲突**：`--verbose` 和 `--log-level` 不能同时使用，保留 `--log-level INFO`。
4. **日志无法在 Dpanel 显示**：脚本内 `echo` 重定向到文件后，Dpanel 捕获不到标准输出。使用 `exec > >(tee -a "$LOG_FILE") 2>&1` 或 `| tee -a` 同时输出到文件和 stdout。
5. **权限问题**：确保配置文件权限正确，目录挂载可读写。

## 总结

通过 Docker Compose 部署官方 rclone 容器，配合 Dpanel 定时任务，实现了 VPS 目录到 Google Drive 的自动备份。关键点：挂载目录而非单文件、正确配置 OAuth、启用 Google Drive API、确保日志输出到标准输出。该方案稳定可靠，适合个人 VPS 备份场景。
