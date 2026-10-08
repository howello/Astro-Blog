---
title: Docker 容器日志撑满根分区：排查、清理与日志轮转配置｜AlmaLinux 实战
categories: Docker
tags:
  - Docker
  - 磁盘空间
  - 容器日志
  - 日志轮转
  - 故障排查
id: notes-docker-container-logs-disk-full
date: 2026-10-08 10:14:17
---

## 背景

一台 AlmaLinux 服务器根分区告警。`df -h` 显示 `/dev/vda3` 共 49G、已用 49G、仅剩 43M，`Use%` 100%。同一份输出里还出现了十几条 `overlay` 挂载，挂载点是 `/var/lib/docker/rootfs/overlayfs/<容器ID>`，全部显示 100%。

这类 overlay 不是独立块设备，底层仍然落在根分区上。它们显示 100% 只是「跟随」了根分区的状态，并不代表各自占了一份独立空间。真正要查的还是根分区里哪个目录把空间吃掉了。

## 第一步：确认是空间满还是 inode 满

先看两件事：

```bash
df -h
df -i
```

`df -h` 看块空间，`df -i` 看 inode。inode 用尽时应用同样会报「No space left on device」，但 `df -h` 的空间可能还有富余。本机是空间满，`/dev/vda3` 100%。

## 第二步：逐层定位大目录

从根分区往下逐层下钻，`-x` 保证不跨文件系统：

```bash
sudo du -xh --max-depth=1 / 2>/dev/null | sort -h
```

找到最大的目录后继续往里查，例如 `/var`：

```bash
sudo du -xh --max-depth=1 /var 2>/dev/null | sort -h
sudo du -xh --max-depth=1 /var/lib 2>/dev/null | sort -h
```

也可以装 `ncdu` 交互式查看，比 `du` 直观：

```bash
sudo dnf install -y ncdu
sudo ncdu -x /
```

这一步很容易走偏：一开始怀疑的是业务目录 `/opt/compose`，但 `df -h /opt/compose` 只是复述了根分区的状态（它并不是独立挂载点），真正的大头在别处。判断某个目录是不是独立分区，看 `df` 的 `Mounted on` 列即可。

## 第三步：定位到 Docker

对 `/var/lib/docker` 逐层统计：

```bash
sudo du -h --max-depth=1 /var/lib/docker 2>/dev/null | sort -h
```

输出：

```text
0       /var/lib/docker/plugins
0       /var/lib/docker/runtimes
0       /var/lib/docker/swarm
0       /var/lib/docker/tmp
24K     /var/lib/docker/volumes
56K     /var/lib/docker/image
204K    /var/lib/docker/network
3.7M    /var/lib/docker/buildkit
3.2G    /var/lib/docker/rootfs
30G     /var/lib/docker/containers
33G     /var/lib/docker
```

`containers` 一个目录就占了 30G，占整个 Docker 数据目录的九成。这个目录里体积最大的通常是每个容器的标准输出日志文件 `*-json.log`。

## 第四步：找出是哪个容器在写

直接按大小列出所有容器的日志文件：

```bash
du -sh /var/lib/docker/containers/*/*-json.log 2>/dev/null | sort -h | tail -20
```

想同时看到容器名：

```bash
for f in /var/lib/docker/containers/*/*-json.log; do
  id=$(basename $(dirname "$f"))
  name=$(docker inspect --format '{{.Name}}' "$id" 2>/dev/null)
  size=$(du -h "$f" | cut -f1)
  echo "$size  $name  ($id)"
done | sort -h
```

到此就能确定是哪个（或哪几个）容器的日志失控。

## 为什么会涨到 30G

Docker 默认使用 `json-file` 日志驱动，写标准输出和标准错误的每一条内容都会落到 `/var/lib/docker/containers/<ID>/<ID>-json.log`。**默认不做任何轮转**——没有 `max-size`、没有 `max-file`，文件就只会一直追加。一个持续输出日志的服务，几周就能把根分区写满。

## 第五步：查看当前日志限制

确认 Docker 当前配置：

```bash
docker info | grep -iE 'log|storage'
```

典型输出：

```text
 Storage Driver: overlayfs
 Logging Driver: json-file
  Log: awslogs fluentd gcplogs gelf journald json-file local splunk syslog
```

这里 `Logging Driver: json-file` 是当前默认驱动；最后那行是 Docker 支持的全部驱动清单，不是当前配置。`docker info` 不会直接显示 `max-size`。

要精确看每个容器的日志配置：

```bash
docker inspect --format '{{.Name}} -> {{.HostConfig.LogConfig}}' $(docker ps -aq)
```

如果输出是 `map[]`，就是没有任何限制：

```text
/<container-a> -> {json-file map[]}
/<container-b> -> {json-file map[]}
```

如果已经有 `max-file` / `max-size`，则形如：

```text
/<container-a> -> {json-file map[max-file:3 max-size:10m]}
/<container-b> -> {json-file map[max-file:10 max-size:5m]}
```

Docker 的日志限制有三个可能的来源，优先级从低到高：

1. `daemon.json` 里的全局 `log-opts`；
2. 命令行启动参数 `dockerd --log-opt ...`（可被 `daemon.json` 覆盖）；
3. `docker-compose.yml` 里单个 service 的 `logging.options`——**这一层会覆盖前两层**。

所以如果容器已经有 `max-size` 但 `daemon.json` 不存在，很可能是 compose 文件里配的。

## 第六步：清理历史日志

先清掉已经写满的日志文件，立刻释放空间。`truncate -s 0` 只清空内容、不删文件，Docker 仍在正常写同一个 fd，不会影响运行中的容器：

```bash
for f in /var/lib/docker/containers/*/*-json.log; do
  truncate -s 0 "$f"
done

# 确认
df -h /
du -sh /var/lib/docker/containers
```

**不要用 `rm` 删日志文件**——文件被删除后 Docker 进程仍持有 fd，空间不会释放，`df` 看着还是满，只有重启容器才能回收。

## 第七步：配置日志轮转（如果还没有）

先确认 `/etc/docker/daemon.json` 是否存在：

```bash
ls -l /etc/docker/daemon.json
cat /etc/docker/daemon.json 2>/dev/null
```

不存在就新建，全局限制单容器日志最多 3 个文件、每个 100M：

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF

# 让配置生效
sudo systemctl restart docker
```

如果容器已经在 compose 里单独配了 `logging`，也可以把限制写到 compose 文件里，更直观：

```yaml
services:
  your-service:
    logging:
      driver: json-file
      options:
        max-size: "100m"
        max-file: "3"
```

## 关键点：`daemon.json` 只对新容器生效

`daemon.json` 里的 `log-opts` **不会修改已经存在的容器的配置**。已有容器要继续用 `truncate` 清，或者重建才能吃到新限制。

用 compose 重建：

```bash
cd /path/to/compose/project
docker compose down
docker compose up -d
```

顺序很重要：**先改 `daemon.json` → 重启 Docker → 再 `down/up`**，否则新容器读到的还是旧配置。

两个注意点：

- **不要加 `-v`**。`docker compose down` 默认保留 volumes，`docker compose down -v` 会删数据卷，可能直接丢库。
- 如果 compose 文件里已经写了 `logging`，会覆盖 `daemon.json`，以 compose 为准。

重建后再验证：

```bash
docker inspect --format '{{.Name}} -> {{.HostConfig.LogConfig}}' $(docker ps -aq)
```

## 一个容易困惑的点：配置已生效，但空间没释放

实际排查中会出现这种情况——检查发现所有容器早就带上了 `max-file:3 max-size:10m`，说明限制已经生效（可能来自 compose 的 `logging` 段），但 `df -h /` 依然 100%，`/var/lib/docker/containers` 还是 30G。

原因是：**轮转只约束新增日志**。在限制生效之前已经写下的那个大文件，Docker 不会主动截断；只有当新日志达到 `max-size`、触发轮转时，旧文件才会被逐步挤掉。但一个已经 30G 的文件，可能永远等不到那一天。

此时唯一要做的就是 `truncate -s 0`，把那批历史文件清空，立刻回收空间。之后再让轮转机制接管，不会再涨回去。

## 可复用的排查清单

整条链路走完，可以固化成下面这组命令，下次直接按顺序跑：

```bash
# 1. 是空间满还是 inode 满
df -h
df -i

# 2. 逐层定位大目录
sudo du -xh --max-depth=1 / 2>/dev/null | sort -h

# 3. 如果是 Docker 宿主机，直接看 Docker 各子目录
sudo du -h --max-depth=1 /var/lib/docker 2>/dev/null | sort -h

# 4. 定位到具体容器日志
du -sh /var/lib/docker/containers/*/*-json.log 2>/dev/null | sort -h | tail

# 5. 看当前日志限制
docker inspect --format '{{.Name}} -> {{.HostConfig.LogConfig}}' $(docker ps -aq)

# 6. 清理（不要 rm）
for f in /var/lib/docker/containers/*/*-json.log; do truncate -s 0 "$f"; done
df -h /

# 7. 兜底：查有没有「已删除但仍被占用」的文件
sudo lsof +L1 | head
```

最后一步针对的是另一类经典陷阱：文件已经被删，但仍有进程持有 fd，`df` 显示满而 `du` 找不到。这种要重启对应进程才能释放，`truncate` 解决不了。

## 结论

- `df` 里大量 `overlay` 条目跟随底层分区的状态，不是独立占用，别被条目数量误导。
- Docker 默认 `json-file` 驱动不轮转，容器日志是根分区被撑满的高频原因。
- 日志限制可以来自 `daemon.json`、`dockerd` 启动参数或 compose 的 `logging`，后者优先级最高。
- `daemon.json` 只对新容器生效，已有容器要么重建、要么继续用 `truncate` 清。
- 日志轮转约束的是新增日志，历史巨型日志文件必须手动 `truncate` 才能回收空间；绝不能用 `rm`。
- 如果 `df` 满、`du` 找不到对应大文件，用 `lsof +L1` 查是否有进程持有已删除文件的 fd。
