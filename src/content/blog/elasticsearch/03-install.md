---
title: 安装 Elasticsearch 与 Kibana｜Elasticsearch 七日笔记 03
categories: Elasticsearch
tags:
  - Elasticsearch
  - Kibana
  - 环境搭建
  - 入门
id: elasticsearch-install
date: 2025-02-22 14:00:00
---

## 学习目标

- 完成 Elasticsearch 和 Kibana 的安装配置，并在本地环境验证其运行状态，为后续学习奠定基础。

## 安装准备

### 环境要求

- **操作系统**：
  - Windows 10/11、Linux（如 Ubuntu）、MacOS。
- **Java 环境**：
  - JDK 11 或 17（ES 8.x 自带 OpenJDK，可无需单独安装）。
  - 检查：`java -version`，确保版本兼容。
- **硬件要求**：
  - **内存**：至少 2GB，建议 4GB 以上（ES 默认分配 1GB 堆内存）。
  - **磁盘**：至少 1GB 可用空间，更多数据需更大空间。
  - **CPU**：双核即可，推荐多核提升性能。

### 下载资源

- **Elasticsearch**：
  - 官网：`https://www.elastic.co/downloads/elasticsearch`
  - 版本：8.17.2（zip 或 tar.gz 包，大约 300MB）。
  - 下载地址示例：`https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.17.2-windows-x86_64.zip`
- **Kibana**：
  - 官网：`https://www.elastic.co/downloads/kibana`
  - 版本：8.17.2（与 ES 版本匹配）。
  - 下载地址示例：`https://artifacts.elastic.co/downloads/kibana/kibana-8.17.2-windows-x86_64.zip`

### 文件结构

- **ES 目录**：
  - `bin/`：启动脚本（如 `elasticsearch.bat`、`elasticsearch`）。
  - `config/`：配置文件（如 `elasticsearch.yml`、`jvm.options`）。
  - `logs/`：日志文件（启动失败时查看）。
  - `data/`：数据存储目录，默认存储索引数据。
  - `lib/`：依赖库。
- **Kibana 目录**：
  - `bin/`：启动脚本（如 `kibana.bat`、`kibana`）。
  - `config/`：配置文件（如 `kibana.yml`）。
  - `data/`：Kibana 数据目录。

### 配置预览

- **ES 默认配置**（`elasticsearch.yml`）：
  ```yaml
  cluster.name: elasticsearch
  node.name: node-1
  network.host: 127.0.0.1
  http.port: 9200
  ```
- **Kibana 默认配置**（`kibana.yml`）：
  ```yaml
  server.port: 5601
  elasticsearch.hosts: ["http://localhost:9200"]
  ```

## 安装 Elasticsearch 和 Kibana

### 下载与解压

- **步骤**：
  1. 从官网下载 ES 和 Kibana 8.17.2 的 zip 包。
  2. 解压到本地目录：
     - ES：`D:\elasticsearch-8.17.2`
     - Kibana：`D:\kibana-8.17.2`
  3. 确保路径无中文或特殊字符，避免启动问题。

### 启动 Elasticsearch

- **步骤**：
  1. 打开命令行（Windows 用 CMD 或 PowerShell，Linux/Mac 用 Terminal）。
  2. 进入 ES 目录：
     ```
     cd D:\elasticsearch-8.17.2
     ```
  3. 运行启动命令：
     - Windows：`bin\elasticsearch.bat`
     - Linux/Mac：`./bin/elasticsearch`
  4. 等待启动完成：
     - 终端会输出日志，关注 `[INFO] [o.e.n.Node] [node-1] started`。
     - 启动时间约 10-30 秒，取决于硬件性能。
- **验证**：
  - 浏览器访问 `http://localhost:9200`，返回：
    ```json
    {
      "name": "node-1",
      "cluster_name": "elasticsearch",
      "version": {
        "number": "8.17.2"
      },
      "tagline": "You Know, for Search"
    }
    ```
  - 如果无响应，检查端口是否被占用（`netstat -aon | findstr 9200`）。

### 启动 Kibana

- **步骤**：
  1. 打开另一个命令行窗口。
  2. 进入 Kibana 目录：
     ```
     cd D:\kibana-8.17.2
     ```
  3. 运行启动命令：
     - Windows：`bin\kibana.bat`
     - Linux/Mac：`./bin/kibana`
  4. 等待启动完成：
     - 终端显示 `Server running at http://localhost:5601`。
- **验证**：
  - 浏览器访问 `http://localhost:5601`，进入 Kibana 登录页面。
  - 默认用户：`elastic`，密码在 ES 启动日志中生成。

### 配置密码（若需要）

- **背景**：
  - ES 8.x 默认启用安全特性（`xpack.security.enabled: true`），需密码登录。
- **步骤**：
  1. 检查 ES 启动日志，找到 `elastic` 用户的密码，例如：
     ```
     Generated password for user [elastic] is [X7kP9mN2qL5vR8tJ]
     ```
  2. 如果丢失，重置密码：
     ```
     bin\elasticsearch-reset-password -u elastic
     ```
     - 生成新密码并记录。
  3. 在 Kibana 中使用 `elastic` 和密码登录。

### 开启 Kibana 中文界面

- 编辑 `kibana.yml`，添加：
  ```yaml
  i18n.locale: "zh-CN"
  ```
- 重启 Kibana 生效。

## 初次体验

### 打开 Kibana

- **步骤**：
  1. 访问 `http://localhost:5601`。
  2. 输入用户名 `elastic` 和密码，登录成功后进入主页。
  3. 点击左侧“Dev Tools”（开发工具）。

### 运行健康检查

- **步骤**：
  1. 在 Dev Tools 左侧输入：
     ```
     GET /_cluster/health
     ```
  2. 点击绿色“运行”按钮（三角形）。
  3. 检查返回结果：
     ```json
     {
       "status": "green",
       "number_of_nodes": 1,
       "active_primary_shards": 0,
       "active_shards_percent_as_number": 100.0
     }
     ```
- **说明**：
  - `status: green` 表示集群健康。
  - `number_of_nodes: 1` 表示单节点运行。

### 探索其他命令

- **节点信息**：
  ```
  GET /
  ```
  - 返回与 `localhost:9200` 相同的 JSON。
- **节点状态**：
  ```
  GET _cat/nodes?v
  ```
  - 返回：
    ```
    ip        heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
    127.0.0.1         12          85   5    0.12    0.15     0.18      mdi      *      node-1
    ```
- **任务**：
  - 记录健康检查结果，理解 `status` 的含义。

## 关键点

- **ES 端口**：默认 9200，用于 HTTP 请求。
- **Kibana 端口**：默认 5601，提供可视化界面。
- **单机模式**：
  - 测试时可将分片设为 1，副本设为 0，节省资源。
  - 配置在 `elasticsearch.yml` 中：
    ```yaml
    cluster.initial_master_nodes: ["node-1"]
    number_of_shards: 1
    number_of_replicas: 0
    ```
- **安全特性**：
  - ES 8.x 默认启用 X-Pack，必须登录 Kibana，需配置 `elastic` 用户密码。
  - 重置密码：`bin/elasticsearch-reset-password -u elastic`。
- **日志文件**：
  - 启动失败时查看 `logs/elasticsearch.log`。

## 常见问题及解决方法

1. **问题**：ES 启动失败，提示“port 9200 in use”。
   - **原因**：端口被占用。
   - **解决**：
     - 检查占用进程：`netstat -aon | findstr 9200`（Windows）。
     - 杀死进程：`taskkill /PID <进程ID> /F`。
     - 或修改端口：编辑 `elasticsearch.yml`，设置 `http.port: 9201`。
2. **问题**：Kibana 无法连接 ES。
   - **原因**：配置错误或 ES 未运行。
   - **解决**：
     - 确保 ES 在 `localhost:9200` 运行。
     - 检查 `kibana.yml`：
       ```yaml
       elasticsearch.hosts: ["http://localhost:9200"]
       ```
3. **问题**：内存不足错误。
   - **原因**：默认 JVM 堆内存（1GB）不足。
   - **解决**：
     - 编辑 `config/jvm.options`，调整：
       ```
       -Xms512m
       -Xmx512m
       ```
4. **问题**：Kibana 提示“Missing authentication credentials”。
   - **原因**：未登录或密码错误。
   - **解决**：
     - 检查 `elastic` 用户密码。
     - 重置密码并更新 `kibana.yml`：
       ```yaml
       elasticsearch.username: "elastic"
       elasticsearch.password: "新密码"
       ```

## 学习建议

- **动手实践**：
  - 安装过程中记录每个步骤的输出，便于排查问题。
  - 在命令行运行 `curl http://localhost:9200`，熟悉 REST API。
- **阅读文档**：
  - 浏览官方文档的“Getting Started”部分，熟悉术语。
  - 阅读 `elasticsearch.yml` 和 `kibana.yml` 的注释，了解配置项。
- **工具准备**：
  - 安装 Postman 或 curl，用于测试 REST API。
  - 用 VS Code 记录笔记，整理 JSON 示例。

## 总结

第一天是 Elasticsearch 学习的起点，通过理论学习，你了解了 ES 的基本原理和核心术语；通过实践操作，你成功安装了 ES 和 Kibana，并在本地运行了第一个健康检查命令。这为你后续的 CRUD、搜索和聚合奠定了基础。明天将进入实际操作，学习如何[通过 REST API 管理数据](/article/elasticsearch-create-index)，准备好迎接更具体的挑战吧！

:::note
本文是《Elasticsearch 七日笔记》系列的第 3 篇，对应第 1 天的学习内容。
:::
