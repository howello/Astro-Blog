---
title: 服务器内存耗尽与容器网络故障排查实战｜性能优化
categories: Docker
tags:
  - Docker
  - Java
  - MySQL
  - Redis
  - 性能优化
id: notes-docker-server-memory-optimization
date: 2026-08-13 11:45:26
---

服务器频繁假死、服务无法响应，`top` 显示负载高达 70、I/O 等待超过 60%，而 CPU 却几乎空闲——这是一次典型的内存耗尽导致的系统崩溃。本文记录了一次完整的 Docker 化服务器优化过程，涵盖内存分析、Swap 配置、容器资源限制、JVM 参数调优以及跨容器网络通信的修复，最终将服务器从崩溃边缘拉回稳定运行状态。

## 症状与诊断

查看 `top` 输出，发现以下关键指标异常：

- 物理内存几乎耗尽：总 3649 MiB，可用仅 121 MiB
- Swap 为 0，无后备内存
- I/O 等待（wa）高达 65.7%，CPU 空闲为 0%
- 大量进程处于不可中断睡眠状态（D），包括 MySQL、Redis、Nginx 等
- `kswapd0` 内核线程 CPU 占用极高，表明系统正在进行频繁的内存回收

根本原因：物理内存不足，且无 Swap 交换空间，导致内核疯狂进行 I/O 换页，拖死整个系统。

## 紧急措施：添加 Swap

AlmaLinux 9.5 系统可以通过创建 Swap 文件快速增加交换空间，避免 OOM 直接杀进程。

```bash
# 创建 2GB 交换文件
dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
# 永久生效
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

调整 swappiness 参数，使系统在内存真正紧张时才使用 Swap：

```bash
sysctl vm.swappiness=10
echo 'vm.swappiness=10' | tee -a /etc/sysctl.conf
```

添加 Swap 后，系统不再立即卡死，但性能依然不佳，因为频繁的换页会拖慢响应。必须进一步限制各应用的资源占用。

## 容器资源限制：MySQL 与 Redis

原 `docker-compose.yml` 中未对任何容器设置资源上限，导致 MySQL（占用 568MB）和 Redis（占用 42MB）等默认配置会尽可能抢占内存。

### MySQL 优化

在服务定义中加入启动参数，限制 `innodb_buffer_pool_size` 并关闭非必要的性能监控：

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --innodb-buffer-pool-size=256M
      - --innodb-log-buffer-size=16M
      - --performance-schema=OFF
      - --tmp-table-size=32M
      - --max-heap-table-size=32M
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

> 若 Compose 版本不支持 `deploy.resources`，可改用 `mem_limit: 512m` 等旧语法。

### Redis 优化

限制 Redis 最大内存并启用 LRU 淘汰策略：

```yaml
services:
  redis:
    image: redis:7.2
    container_name: redis
    command: redis-server --appendonly yes --maxmemory 128mb --maxmemory-policy allkeys-lru
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
```

调整后，MySQL 内存降至 205MB，Redis 稳定在 40MB 左右。

## Java 应用 JVM 内存调优

Java 应用默认根据宿主机总内存分配堆大小，在容器环境中必须显式限制。通过 `JAVA_OPTS` 环境变量传递参数：

```yaml
environment:
  JAVA_OPTS: "-Xms256m -Xmx512m -XX:MaxMetaspaceSize=128m -XX:+UseG1GC"
```

- `-Xmx512m`：最大堆内存 512MB（关键限制）
- `-Xms256m`：初始堆内存，避免启动时扩容抖动
- `-XX:MaxMetaspaceSize=128m`：限制元空间，防止类加载泄漏
- `-XX:+UseG1GC`：在内存有限时更稳定的垃圾回收器

> 若使用 `-XX:MaxRAMPercentage=75.0` 替代固定 `-Xmx`，需同时为容器设置 `deploy.resources.limits.memory`，否则 JVM 会按宿主机总内存计算，反而更危险。

## 容器网络统一与 DNS 解析问题

多个独立 `docker-compose.yml` 分别管理不同服务（MySQL、App、Web 等）。默认情况下，每个 Compose 项目会创建独立的默认网络，导致服务间无法通过容器名互相访问，出现 `dial tcp: lookup mysql on 127.0.0.11:53: no such host` 错误。

解决方案是使用**外部共享网络**：

1. 手动创建共享网络（只需一次）：
   ```bash
   docker network create shared_net
   ```

2. 在每个 `docker-compose.yml` 中声明使用该外部网络：
   ```yaml
   services:
     mysql:
       networks:
         - shared_net
     app:
       networks:
         - shared_net
     web:
       networks:
         - shared_net

   networks:
     shared_net:
       external: true
   ```

所有容器加入同一网络后，即可通过容器名（如 `mysql`、`app`）互相访问，且**调用时必须使用容器内部端口**，而非映射到宿主机的端口。

> 重启后该网络默认持久化（AlmaLinux 下），但建议将 Docker 设为开机自启：`systemctl enable docker`。

## 优化效果对比

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 负载平均值 | 70.03 | 0.79 |
| CPU 空闲 | 0% | 48.6% |
| I/O 等待 | 65.7% | 0.8% |
| 物理内存空闲 | 121 MB | 293 MB |
| Swap 使用 | 0 MB | 286 MB |
| MySQL 内存 | 568 MB | 205 MB |
| Redis 内存 | 42 MB | 40 MB |
| Java 内存 | 769 MB | 428 MB |

服务器从濒临崩溃恢复到稳定运行，各服务响应正常，`no such host` 错误彻底消失。

## 总结与可复用经验

1. **内存监控先行**：定期检查 `free -m` 和 `top`，设置内存使用率告警阈值（如 85%）。
2. **永远要有 Swap**：即使性能不如物理内存，也能避免 OOM 导致完全假死。
3. **容器化应用必须设置资源限制**：使用 `deploy.resources` 或 `mem_limit`，防止单个容器耗尽宿主机内存。
4. **JVM 必须显式设置 `-Xmx`**：容器环境默认按宿主机总内存计算，极易引发 OOM。
5. **跨 Compose 项目通信必须使用同一外部网络**：确保 DNS 解析有效，并注意使用容器内部端口。
6. **持久化网络**：大部分 Linux 发行版重启后自定义网络依然存在，但建议编写启动脚本检查网络存在性，以防不测。

本次优化不仅解决了眼前的问题，也建立了一套可持续的容器资源管理规范。
