---
title: 插入文档｜Elasticsearch 七日笔记 05
categories: Elasticsearch
tags:
  - Elasticsearch
  - CRUD
  - 文档
  - 倒排索引
id: elasticsearch-insert-document
date: 2025-02-23 11:00:00
---

本文接着[创建索引](/article/elasticsearch-create-index)，往刚建好的 `users` 索引里写数据。

## 定义与方式

文档（Document）是 ES 中的最小数据单元，插入文档是将数据写入索引的过程。ES 提供两种插入方式：

- **自动生成 ID**：
  - 使用 `POST /<index_name>/_doc`。
  - ES 会生成一个随机 UUID 作为文档 ID。
- **指定 ID**：
  - 使用 `PUT /<index_name>/_doc/<id>`。
  - 手动指定文档的唯一标识符。

## 示例

- **自动生成 ID**：
  ```json
  POST /users/_doc
  {
    "name": "Alice",
    "age": 25
  }
  ```
  - 返回：
    ```json
    {
      "_index": "users",
      "_id": "abc123xyz789",
      "result": "created"
    }
    ```
- **指定 ID**：
  ```json
  PUT /users/_doc/1
  {
    "name": "Bob",
    "age": 30
  }
  ```
  - 返回：
    ```json
    {
      "_index": "users",
      "_id": "1",
      "result": "created"
    }
    ```

## 插入机制

- **倒排索引**：
  - 插入时，ES 会对 `text` 字段（如 `name`）进行分词，构建倒排索引。
  - 例如，“Alice” 被分词为 `["alice"]`（小写）。
- **近实时性**：
  - 数据写入后，默认 1 秒内可搜索（受 `refresh_interval` 控制）。

## 注意事项

- **`PUT` vs `POST`**：
  - `PUT` 需要指定 ID，若 ID 已存在则覆盖。
  - `POST` 自动生成 ID，适合批量插入。
- **字段动态性**：
  - 可以插入未定义的字段，ES 会自动添加到映射。

## 动手实践：插入 3 条测试数据

### 目标

- 向 `users` 索引插入 3 条测试数据。

### 步骤

1. **插入第一条（指定 ID）**：
   ```json
   PUT /users/_doc/1
   {
     "name": "Alice",
     "age": 25
   }
   ```
   - 检查返回：`"result": "created"`
2. **插入第二条（自动 ID）**：
   ```json
   POST /users/_doc
   {
     "name": "Bob",
     "age": 30
   }
   ```
   - 记录返回的 `_id`（如 `"abc123xyz789"`）。
3. **插入第三条**：
   ```json
   PUT /users/_doc/3
   {
     "name": "Charlie",
     "age": 28
   }
   ```
4. **验证**：
   - 查询：
     ```json
     GET /users/_doc/1
     ```
   - 确认返回 Alice 的数据。

### 注意事项

- 插入后等待 1 秒，确保数据可查（近实时性）。
- 记录自动生成的 ID，以便后续操作。

## 关键点

- **近实时性**：
  - 数据操作后需短暂等待（默认 1 秒）才能查询。

## 常见问题及解决方法

1. **问题**：插入后无法查询到数据。
   - **原因**：近实时延迟。
   - **解决**：
     - 等待 1 秒后查询。
     - 强制刷新：`POST /users/_refresh`。

## 学习建议

- **理解机制**：
  - 思考倒排索引如何加速查询。
  - 画出文档插入到索引的过程图。

:::note
本文是《Elasticsearch 七日笔记》系列的第 5 篇，对应第 2 天的学习内容。
:::
