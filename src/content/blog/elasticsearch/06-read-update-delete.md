---
title: 查询、更新与删除文档｜Elasticsearch 七日笔记 06
categories: Elasticsearch
tags:
  - Elasticsearch
  - CRUD
  - 文档
  - REST API
id: elasticsearch-read-update-delete
date: 2025-02-23 14:00:00
---

本文接着[插入文档](/article/elasticsearch-insert-document)，把 CRUD 的后三个操作补齐。

## 查询文档

- **定义**：
  - 通过文档 ID 获取特定文档。
- **命令**：
  - `GET /<index_name>/_doc/<id>`
- **示例**：
  ```json
  GET /users/_doc/1
  ```
  - 返回：
    ```json
    {
      "_index": "users",
      "_id": "1",
      "_source": {
        "name": "Bob",
        "age": 30
      },
      "found": true
    }
    ```
- **注意**：
  - 如果文档不存在，返回 `"found": false`。

## 更新文档

- **全量更新**：
  - 使用 `PUT`，覆盖整个文档。
  - 示例：
    ```json
    PUT /users/_doc/1
    {
      "name": "Bob Smith",
      "age": 31
    }
    ```
  - 返回：`"result": "updated"`
- **部分更新**：
  - 使用 `POST /_update`，只修改指定字段。
  - 示例：
    ```json
    POST /users/_update/1
    {
      "doc": {
        "age": 32
      }
    }
    ```
  - 返回：`"result": "updated"`
- **机制**：
  - 更新会生成新版本的文档，原文档被标记为删除。
  - 版本号通过 `_version` 返回。

## 删除文档

- **定义**：
  - 删除指定 ID 的文档。
- **命令**：
  - `DELETE /<index_name>/_doc/<id>`
- **示例**：
  ```json
  DELETE /users/_doc/1
  ```
  - 返回：
    ```json
    {
      "_index": "users",
      "_id": "1",
      "result": "deleted"
    }
    ```
- **注意**：
  - 删除后文档不可恢复，但索引仍存在。

## 动手实践：对数据执行 CRUD

### 目标

- 对插入的数据执行 CRUD 操作，验证结果。

### 步骤

1. **查询**：
   - 运行：
     ```json
     GET /users/_doc/1
     ```
     - 预期：返回 Alice 的数据。
   - 运行：
     ```json
     GET /users/_doc/3
     ```
     - 预期：返回 Charlie 的数据。
2. **全量更新**：
   - 运行：
     ```json
     PUT /users/_doc/1
     {
       "name": "Alice Smith",
       "age": 26
     }
     ```
   - 验证：
     ```json
     GET /users/_doc/1
     ```
     - 确认 `age` 变为 26。
3. **部分更新**：
   - 运行：
     ```json
     POST /users/_update/3
     {
       "doc": {
         "age": 29
       }
     }
     ```
   - 验证：
     ```json
     GET /users/_doc/3
     ```
     - 确认 `age` 变为 29。
4. **删除**：
   - 运行：
     ```json
     DELETE /users/_doc/2
     ```
   - 验证：
     ```json
     GET /users/_doc/2
     ```
     - 返回 `"found": false`。

### 注意事项

- 每次操作后用 `GET` 验证，确保结果正确。
- 更新和删除会增加文档版本号（`_version`）。

## 关键点

- **`PUT` vs `POST`**：
  - `PUT` 用于指定 ID 的插入或全量更新。
  - `POST` 用于自动 ID 的插入或部分更新。
- **版本控制**：
  - 每次更新生成新版本，原数据标记为删除但仍占用空间。

## 常见问题及解决方法

1. **问题**：文档更新未生效。
   - **原因**：未使用正确命令。
   - **解决**：
     - 全量更新用 `PUT`，部分更新用 `POST /_update`。

## 学习建议

- **动手实践**：
  - 每次操作后用 `GET` 检查结果，理解返回字段（如 `_id`、`_version`）。
  - 尝试插入不同类型的数据（如字符串、数字），观察动态映射。
- **阅读文档**：
  - 浏览官方文档的“REST API”部分，熟悉 CRUD 语法。
  - 查看 `/_cat` API，如 `GET _cat/indices?v`，了解索引状态。
- **工具使用**：
  - 用 Postman 测试 REST API，熟悉 HTTP 请求。
  - 在 Kibana 中尝试不同命令，记录返回结果。
- **笔记记录**：
  - 整理每条命令的输入和输出，标注用途。

## 总结

第二天通过理论学习，你掌握了 ES 的 CRUD 操作，包括创建索引、插入文档、查询、更新和删除；通过实践操作，你在 Kibana 中成功执行了这些命令，并验证了结果。这为你后续的搜索功能奠定了数据基础。明天将进入[搜索学习](/article/elasticsearch-match-and-term)，探索如何从索引中检索数据，准备好迎接更复杂的挑战吧！

:::note
本文是《Elasticsearch 七日笔记》系列的第 6 篇，对应第 2 天的学习内容。
:::
