---
title: 创建索引｜Elasticsearch 七日笔记 04
categories: Elasticsearch
tags:
  - Elasticsearch
  - CRUD
  - 索引
  - REST API
id: elasticsearch-create-index
date: 2025-02-23 09:00:00
---

## 学习目标

- 掌握 Elasticsearch 的基本数据操作，包括创建索引、插入文档、查询文档、更新文档和删除文档（统称为 CRUD 操作）。
- 通过 REST API 在 Kibana 中熟练执行这些操作，理解其语法和返回结果。
- 为后续的搜索和聚合功能打下数据操作基础，确保能够灵活管理 Elasticsearch 中的数据。

## 定义与作用

在 Elasticsearch（ES）中，索引（Index）是文档的逻辑容器，类似于数据库中的表。创建索引是数据操作的第一步，它定义了数据的存储结构和规则。

- **作用**：
  - 组织文档数据。
  - 指定分片和副本配置以优化性能。
  - 定义字段类型（映射）以控制数据的索引和搜索行为。
- **REST API**：
  - 使用 `PUT` 请求创建索引。
  - 语法：`PUT /<index_name>`

## 配置参数

- **Settings**：
  - `number_of_shards`：主分片数，默认 5，单机测试建议设为 1。
  - `number_of_replicas`：副本分片数，默认 1，单机测试建议设为 0。
- **Mappings**：
  - 定义字段的类型和属性，例如：
    - `text`：分词字段，适合搜索。
    - `integer`：数值字段，适合排序。
- **示例**：
  ```json
  PUT /users
  {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "name": {"type": "text"},
        "age": {"type": "integer"}
      }
    }
  }
  ```
  - 结果：创建一个名为 `users` 的索引，包含 `name` 和 `age` 两个字段。

## 注意事项

- **索引名**：必须小写，不能含特殊字符。
- **动态映射**：如果不指定 `mappings`，ES 会根据首次插入的数据自动推断类型。
- **不可修改**：索引创建后，分片数无法更改，需重建索引。

## 动手实践：创建 users 索引

### 目标

- 创建一个名为 `users` 的索引，配置单分片无副本，并定义字段。

### 步骤

1. **启动 Kibana**：
   - 确保 ES 和 Kibana 运行（参考[安装 Elasticsearch 与 Kibana](/article/elasticsearch-install)）。
   - 访问 `http://localhost:5601`，登录（用户：`elastic`，密码：启动时生成）。
2. **打开 Dev Tools**：
   - 点击左侧“Dev Tools”。
3. **执行命令**：
   ```json
   PUT /users
   {
     "settings": {
       "number_of_shards": 1,
       "number_of_replicas": 0
     },
     "mappings": {
       "properties": {
         "name": {"type": "text"},
         "age": {"type": "integer"}
       }
     }
   }
   ```
4. **验证**：
   - 运行：
     ```json
     GET /users
     ```
   - 返回：
     ```json
     {
       "users": {
         "settings": {
           "index": {
             "number_of_shards": "1",
             "number_of_replicas": "0"
           }
         },
         "mappings": {
           "properties": {
             "name": {"type": "text"},
             "age": {"type": "integer"}
           }
         }
       }
     }
     ```

### 注意事项

- 检查 JSON 语法，确保逗号和括号正确。
- 如果索引已存在，需先删除：`DELETE /users`。

## 常见问题及解决方法

1. **问题**：索引创建失败，返回 400 错误。
   - **原因**：JSON 语法错误。
   - **解决**：
     - 检查逗号、括号是否匹配。
     - 用在线 JSON 校验工具验证。

:::note
本文是《Elasticsearch 七日笔记》系列的第 4 篇，对应第 2 天的学习内容。
:::
