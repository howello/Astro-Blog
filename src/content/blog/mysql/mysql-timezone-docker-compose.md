---
title: MySQL 时区设置指南｜Docker Compose 部署踩坑实录
categories: MySQL
tags:
  - MySQL
  - Docker
  - 时区
  - 环境配置
  - docker-compose
id: mysql-timezone-docker-compose
date: 2026-08-18 09:45:09
---

在使用 Docker Compose 部署 MySQL 时，经常会遇到时区不一致的问题：查询 `NOW()` 返回的时间与本地时间相差 8 小时，或者 `system_time_zone` 显示为 `UTC` 但业务需要东八区时间。本文将从查看当前时区开始，逐步分析配置失效的原因，并给出三种稳定可靠的解决方案。

## 查看 MySQL 当前时区

MySQL 提供了三个关键变量用于时区控制：

```sql
SELECT @@global.time_zone, @@session.time_zone, @@system_time_zone;
```

- `@@global.time_zone`：全局默认时区，影响所有新建立的会话
- `@@session.time_zone`：当前会话时区，可通过 `SET time_zone = ...` 临时修改
- `@@system_time_zone`：MySQL 启动时从操作系统读取的时区，只读

另外也可以使用 `SHOW VARIABLES LIKE 'time_zone';` 查看当前会话时区。如果返回 `SYSTEM`，则表示实际时区跟随 `system_time_zone`。

## Docker Compose 部署中的典型配置方式

通常我们会在 `docker-compose.yml` 中通过环境变量和启动参数来设定时区，常见做法有以下几种：

### 1. 设置容器系统时区（`TZ` 环境变量）
```yaml
environment:
  TZ: Asia/Shanghai
```
此方式理论上会修改容器内操作系统的时区，从而影响 `system_time_zone`。但在某些 MySQL 镜像版本或自定义启动命令下，该变量可能被忽略。

### 2. 通过 MySQL 启动参数指定默认时区
```yaml
command:
  - --default-time-zone=+08:00
```
直接在容器启动时传递给 mysqld，应直接改变 `global.time_zone`。

### 3. 挂载宿主机时区文件
```yaml
volumes:
  - /etc/localtime:/etc/localtime:ro
  - /etc/timezone:/etc/timezone:ro
```
此方法在 Linux 宿主机上有效，但 macOS 和 Windows 下不适用。

## 配置未生效的典型现象

一位开发者按照上述组合方式部署后，查询结果依然显示：

```sql
+--------------------+---------------------+--------------------+
| @@global.time_zone | @@session.time_zone | @@system_time_zone |
+--------------------+---------------------+--------------------+
| SYSTEM             | SYSTEM              | UTC                |
+--------------------+---------------------+--------------------+
```

尽管在 `docker-compose.yml` 中同时设置了 `TZ: Asia/Shanghai` 和 `--default-time-zone=+08:00`，但 MySQL 仍然使用了 UTC。

### 原因分析

- `TZ` 环境变量未能正确生效，可能由于镜像的 entrypoint 脚本未按预期处理，或者被自定义 `command` 覆盖了部分初始化逻辑。
- 命令行传递的 `--default-time-zone` 参数在某些 MySQL 8.0 版本中可能被 `my.cnf` 中的默认值覆盖，或者由于格式问题被忽略（例如缺少引号或与其他参数顺序冲突）。
- 更稳定的做法是使用配置文件，因为 MySQL 启动时会按顺序读取多个配置，`/etc/mysql/conf.d/` 下的 `.cnf` 文件优先级较高，可以确保设置被采纳。

## 推荐解决方案

### 方案一：通过挂载自定义配置文件 `my.cnf`（最稳定）

在宿主机 `./mysql/conf/` 目录下创建 `timezone.cnf` 文件，内容如下：

```ini
[mysqld]
default-time-zone = '+08:00'
```

然后在 `docker-compose.yml` 中挂载该目录，并**移除**命令行中的 `--default-time-zone` 参数，避免冲突：

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    networks:
      - shared_net
    restart: always
    environment:
      TZ: Asia/Shanghai   # 保留作为辅助
    ports:
      - "3306:3306"
    volumes:
      - ./mysql/data:/var/lib/mysql
      - ./mysql/conf:/etc/mysql/conf.d   # 自定义配置目录
    command: 
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --innodb-buffer-pool-size=256M
      - --innodb-log-buffer-size=16M
      - --performance-schema=OFF
      - --tmp-table-size=32M
      - --max-heap-table-size=32M
      # --default-time-zone 已移至配置文件
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

配置文件方式不受容器系统时区影响，直接作用于 MySQL 服务层，是最可靠的途径。

### 方案二：同时修改容器系统时区（可选）

若希望 `system_time_zone` 也显示为 `Asia/Shanghai`，可以挂载宿主机的时区文件（仅限 Linux 宿主机）：

```yaml
volumes:
  - /etc/localtime:/etc/localtime:ro
  - /etc/timezone:/etc/timezone:ro
```

这样容器内执行 `date` 命令也会输出东八区时间，与 MySQL 内部时区保持一致。

### 方案三：命令行加引号尝试（不推荐）

如果坚持用命令行，可尝试将参数改为 `--default-time-zone='+08:00'`，但经验表明此方法依然可能被忽略，不推荐作为生产环境的配置。

## 验证生效

重启容器后，进入 MySQL 执行验证：

```bash
docker-compose down
docker-compose up -d
docker exec -it mysql mysql -p -e "SELECT @@global.time_zone, @@session.time_zone, @@system_time_zone;"
```

预期输出：

```
+--------------------+---------------------+--------------------+
| @@global.time_zone | @@session.time_zone | @@system_time_zone |
+--------------------+---------------------+--------------------+
| +08:00             | +08:00              | Asia/Shanghai      |
+--------------------+---------------------+--------------------+
```

如果挂载了宿主机时区文件，`system_time_zone` 也会变为 `Asia/Shanghai`；若仅通过配置文件设置，则 `system_time_zone` 可能仍为 `UTC`，但 `global.time_zone` 为 `+08:00`，这已经满足大多数业务需求（`NOW()` 等函数将返回 +8 区时间）。

## 注意事项

- 修改时区**不会**影响已存储的 `DATETIME` 和 `TIMESTAMP` 类型数据的值，但会影响 `NOW()`、`CURDATE()` 等时间函数的返回值。
- 如果宿主机是 macOS 或 Windows，挂载 `/etc/localtime` 无效，此时只能依靠配置文件来保证 MySQL 内部时区正确。
- 在编写配置文件时，请确保文件扩展名为 `.cnf`，且放在 `/etc/mysql/conf.d/` 下，MySQL 会自动加载。
- 若同时存在多个配置文件，注意优先级顺序（通常按字母顺序加载，但最终参数以最后加载的为准），建议只放一个时区配置文件避免混淆。

## 总结

通过查看时区变量定位问题，结合 Docker Compose 的部署特点，我们认识到命令行参数和环境变量在某些场景下并不完全可靠。最稳健的做法是将 `default-time-zone` 写入独立的 `.cnf` 配置文件并挂载进容器。若需要统一容器系统时间，可额外挂载宿主机时区文件（Linux）。经过以上配置，即可确保 MySQL 在任何环境下都稳定输出东八区时间。

这一经验不仅适用于 MySQL，也适用于其他对时区敏感的中间件（如 Redis、Elasticsearch）的容器化部署：优先使用配置文件而非环境变量，往往能获得更可控的结果。
