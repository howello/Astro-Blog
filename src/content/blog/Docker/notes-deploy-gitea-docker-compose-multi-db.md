---
title: 轻量级 Git 服务选型与 Docker Compose 部署实践（含 SQLite/PostgreSQL/MySQL）｜容器化实战
categories: Docker
tags:
  - Docker
  - Gitea
  - 数据库
  - 反向代理
  - 容器化
id: notes-deploy-gitea-docker-compose-multi-db
date: 2026-08-12 14:33:37
---

自建代码托管平台时，资源消耗和运维成本往往是个人开发者与小团队最在意的因素。在众多开源方案中，Gitea 凭借极低的内存占用（~50MB）和接近 GitHub 的使用体验脱颖而出。本文首先梳理轻量级 Git 服务的选型对比，然后详细记录使用 Docker Compose 部署 Gitea 的完整过程，涵盖 SQLite、PostgreSQL 和 MySQL（含外部复用）三种数据库方案，并结合反向代理、时区同步、安全加固等实际需求给出可复用的配置模板。

## 轻量级 Git 服务选型对比

在决定使用 Gitea 之前，值得了解当前主流的轻量级方案：

| 方案 | 内存占用 | 特点 | 适用场景 |
|------|----------|------|----------|
| **Gitea** | ~50MB | 功能完整（Issue、PR、Wiki、Actions），社区活跃，API 丰富 | 个人/小团队首选，功能与资源的平衡点 |
| **Forgejo** | ~50MB | Gitea 社区驱动分支，更注重开源治理和联合（ActivityPub） | 崇尚社区治理、希望紧跟开源前沿的用户 |
| **Gogs** | ~30MB | 极致轻量，功能基础，更新较慢 | 极致资源节省的个人项目或实验环境 |
| **纯 Git + SSH** | 几乎为零 | 无 Web 界面，仅基础版本控制 | 极客用户，无需协作功能 |

综合考量后，Gitea 在功能丰富度和资源占用之间取得最佳平衡，因此本文选用 Gitea 作为部署对象。

## 部署前的准备

- 服务器已安装 **Docker Engine 20.10+** 和 **Docker Compose v2**（新版已弃用 `version` 字段）。
- 根据需要准备数据库：可选择内嵌 SQLite（无需额外容器）、独立 PostgreSQL 容器、或复用已有的外部 MySQL。
- 规划域名（如 `git.example.com`）和反向代理（如 Nginx、Caddy 或 dpanel 面板）。

## 方案一：SQLite（最轻量，适合个人）

SQLite 无需独立数据库容器，所有数据存储在单个文件中，适合测试或个人仓库量不大的场景。

`docker-compose.yml`：

```yaml
services:
  gitea:
    image: docker.gitea.com/gitea:latest
    container_name: gitea
    restart: always
    environment:
      - USER_UID=1000
      - USER_GID=1000
      # SQLite 默认无需额外配置，Gitea 会自动使用 /data/gitea.db
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"   # 可选 SSH
```

启动后访问 `http://IP:3000`，在安装页面选择 SQLite 即可。

## 方案二：PostgreSQL（生产推荐）

使用独立的 PostgreSQL 容器，数据可靠性更高，适合团队协作。

`docker-compose.yml`：

```yaml
services:
  db:
    image: postgres:16
    restart: always
    environment:
      - POSTGRES_USER=gitea
      - POSTGRES_PASSWORD=change_me
      - POSTGRES_DB=gitea
    volumes:
      - ./postgres:/var/lib/postgresql/data
    networks:
      - gitea

  server:
    image: docker.gitea.com/gitea:latest
    container_name: gitea
    restart: always
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=db:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=change_me
      - GITEA__server__DOMAIN=git.example.com
      - GITEA__server__ROOT_URL=https://git.example.com
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
    depends_on:
      - db
    networks:
      - gitea

networks:
  gitea:
```

## 方案三：复用外部 MySQL（节省资源）

若已有 MySQL 服务（版本 5.7+ 或 8.0），可直接复用，无需额外启动数据库容器。

### 手动创建数据库与用户

登录 MySQL 执行：

```sql
CREATE DATABASE gitea CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'gitea'@'%' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON gitea.* TO 'gitea'@'%';
FLUSH PRIVILEGES;
```

也可通过环境变量 `GITEA__database__CREATE_DATABASE=true` 让 Gitea 自动创建（需赋予用户 `CREATE` 权限）。

### 定制化 docker-compose.yml（适配反向代理与安全加固）

以下配置针对实际生产场景做了几项常用定制：

- **禁用 SSH**：仅使用 HTTPS 克隆，不暴露 22 端口。
- **端口本地绑定**：只监听 `127.0.0.1:3001`，由反向代理（如 dpanel）转发外部 HTTPS 请求。
- **时区挂载**：使容器内时间与宿主机同步，避免日志和提交时间显示 UTC。
- **无 `version` 字段**：适配新版 Docker Compose。

最终配置文件 `/opt/gitea/docker-compose.yml`：

```yaml
services:
  gitea:
    image: docker.gitea.com/gitea:latest
    container_name: gitea
    restart: always

    environment:
      - USER_UID=1000
      - USER_GID=1000

      # ---------- 连接外部 MySQL ----------
      - GITEA__database__DB_TYPE=mysql
      - GITEA__database__HOST=你的MySQL地址:3306   # 若 MySQL 在宿主机，Linux 填 172.17.0.1，Mac/Win 填 host.docker.internal
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=你的数据库密码

      # ---------- 站点域名（HTTPS 反向代理） ----------
      - GITEA__server__DOMAIN=gitea.example.com
      - GITEA__server__ROOT_URL=https://gitea.example.com
      - GITEA__server__HTTP_PORT=3000   # 容器内监听端口，必须与 ports 右侧一致

      # ---------- 禁用内置 SSH ----------
      - GITEA__server__DISABLE_SSH=true

    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro

    ports:
      - "127.0.0.1:3001:3000"   # 宿主机只监听本地，外部由反向代理接入
```

### 关键配置解释

- **时区挂载**：`/etc/timezone` 提供时区名称，`/etc/localtime` 提供具体规则，二者组合确保容器内时间与宿主机一致。
- **`HTTP_PORT` 与 `ports` 映射**：`HTTP_PORT` 必须等于容器内部端口（此处为 3000），而 `ports` 左侧的 `127.0.0.1:3001` 是宿主机监听地址和端口，两者独立。若将 `HTTP_PORT` 误设为 3001，则容器内 Gitea 监听 3001，但 Docker 仍将外部流量转发至 3000，导致连接拒绝。
- **`DISABLE_SSH`**：彻底关闭 SSH 服务，容器不再监听任何 SSH 端口，因此无需映射 22 端口。

## 反向代理配置（以 dpanel 为例）

在 dpanel 面板中设置：

- 域名：`https://gitea.example.com`
- 代理目标：`http://127.0.0.1:3001`
- 开启“转发 Host 头”和“转发 X-Forwarded-Proto”选项，后者告知 Gitea 客户端使用 HTTPS。

由于 `ROOT_URL` 已设为 `https://`，Gitea 生成的克隆地址和邮件链接均会正确使用 HTTPS。

## 启动与初始化

```bash
cd /opt/gitea
docker compose up -d
```

通过 `docker compose logs -f` 查看日志，确认数据库连接无误（常见错误：MySQL 地址写 `localhost` 导致容器内无法解析，应改用宿主机网关 IP）。

首次访问 `https://gitea.example.com`，安装页面会自动读取环境变量中的数据库配置，只需在页面底部创建管理员账号即可完成安装。

## 日常维护与备份

| 操作 | 命令 |
|------|------|
| 停止容器（保留数据） | `docker compose down` |
| 重启服务 | `docker compose restart gitea` |
| 升级 Gitea | `docker compose pull gitea && docker compose up -d` |
| 进入容器调试 | `docker exec -it gitea bash` |

数据备份：定期备份 `./gitea` 目录及数据库（SQLite 则为该目录下的 `.db` 文件，PostgreSQL/MySQL 则使用相应导出工具）。

## 常见问题与避坑

- **外部 MySQL 连接失败**：检查 `HOST` 是否填写正确。若 MySQL 与 Gitea 在同一宿主机，容器内不能使用 `localhost`，应使用 `172.17.0.1`（Linux 默认网关）或 `host.docker.internal`（macOS/Windows）。
- **端口映射后网页无法访问**：确认 `HTTP_PORT` 与容器内部端口匹配，且防火墙/安全组已允许反向代理服务器访问宿主机 3001 端口。
- **克隆地址显示 HTTP 而非 HTTPS**：检查 `ROOT_URL` 是否以 `https://` 开头，并确认反向代理正确传递了 `X-Forwarded-Proto` 头。
- **时区不正确**：确保挂载了 `/etc/timezone` 和 `/etc/localtime`，若宿主机时区非预期，可先通过 `timedatectl` 调整。

通过以上步骤，你可以在数分钟内拥有一个轻量、安全、且符合实际运维习惯的 Gitea 服务，无论是个人使用还是团队协作，都能获得良好的代码托管体验。
