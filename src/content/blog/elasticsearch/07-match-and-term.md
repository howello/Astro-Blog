---
title: match 与 term 查询｜Elasticsearch 七日笔记 07
categories: Elasticsearch
tags:
  - Elasticsearch
  - 查询DSL
  - 全文搜索
  - 精确匹配
id: elasticsearch-match-and-term
date: 2025-02-24 09:00:00
---

## 学习目标

- 掌握 Elasticsearch 的基本搜索功能，包括简单查询（`match` 和 `term`）和组合查询（`bool`），理解其原理和应用场景。
- 通过实践操作，在 Kibana 中执行多种搜索命令，验证结果并理解搜索的核心机制，为后续高级查询和聚合打下基础。

## 定义与作用

搜索是 Elasticsearch 的核心功能，简单查询是检索数据的基础方式。ES 提供两种主要查询类型：`match` 和 `term`，分别适用于不同的场景。

- **作用**：
  - 从索引中检索符合条件的文档。
  - 支持全文搜索和精确匹配。
- **REST API**：
  - 使用 `GET /<index_name>/_search`。

## `match` 查询

- **定义**：
  - `match` 查询用于全文搜索，适合模糊匹配场景。
- **特点**：
  - 对查询词和文档字段进行分词，匹配分词后的词元。
  - 默认使用 `OR` 逻辑，匹配任一词元即可。
- **示例**：
  ```json
  GET /users/_search
  {
    "query": {
      "match": {
        "name": "Alice"
      }
    }
  }
  ```
  - 返回：所有 `name` 字段包含“Alice”的文档。
- **机制**：
  - 查询词“Alice”被分词为 `["alice"]`（小写）。
  - 文档字段分词后，若包含 `alice`，则匹配。
- **参数**：
  - `operator`: `"and"`（必须全匹配）或 `"or"`（默认）。
    ```json
    "match": {
      "name": {
        "query": "Alice Smith",
        "operator": "and"
      }
    }
    ```
  - `minimum_should_match`: 控制匹配词的最小数量。

## `term` 查询

- **定义**：
  - `term` 查询用于精确匹配，适合结构化数据。
- **特点**：
  - 不对查询词分词，直接匹配字段的原始值。
  - 常用于数值、日期或 `keyword` 类型字段。
- **示例**：
  ```json
  GET /users/_search
  {
    "query": {
      "term": {
        "age": 25
      }
    }
  }
  ```
  - 返回：`age` 精确为 25 的文档。
- **机制**：
  - 查询值 25 与文档的 `age` 字段直接比较。
- **注意**：
  - 对 `text` 字段无效（因分词），需用 `field.keyword`。

## `match` vs `term`

**区别**：

| **特性**     | **`match`** | **`term`**           |
| ------------ | ----------- | -------------------- |
| **分词**     | 是          | 否                   |
| **适用字段** | `text`      | `keyword`、`integer` |
| **匹配方式** | 模糊匹配    | 精确匹配             |
| **场景**     | 全文搜索    | 结构化查询           |

- **示例**：
  - `match`：搜索“alice smith”匹配“Alice”或“Smith”。
  - `term`：搜索 25 只匹配 `age` 为 25。

## 动手实践：准备数据

本系列第 3、4 天的搜索与聚合实践都使用这批数据，后续文章会直接引用它。

### 目标

- 确保 `users` 索引有足够数据用于搜索测试。

### 步骤

1. **检查现有数据**：
   - 运行：
     ```json
     GET /users/_search
     ```
   - 确认是否有[第 2 天](/article/elasticsearch-insert-document)的数据（Alice、Bob 等）。
2. **插入数据**（若不足）：
   ```json
   PUT /users/_doc/1
   {"name": "Alice Smith", "age": 25}
   PUT /users/_doc/2
   {"name": "Bob Jones", "age": 30}
   PUT /users/_doc/3
   {"name": "Charlie Brown", "age": 28}
   PUT /users/_doc/4
   {"name": "Alice Lee", "age": 22}
   ```
3. **验证**：
   - 运行：
     ```json
     GET /users/_search
     ```
   - 确认返回 4 条数据。

### 注意事项

- 确保索引 `users` 存在（参考[创建索引](/article/elasticsearch-create-index)）。
- 数据插入后等待 1 秒，确保可查。

## 动手实践：简单查询

### 目标

- 使用 `match` 和 `term` 执行搜索，验证结果。

### 步骤

1. **`match` 查询**：
   - 运行：
     ```json
     GET /users/_search
     {
       "query": {
         "match": {
           "name": "Alice"
         }
       }
     }
     ```
   - 预期：返回 ID 为 1 和 4 的文档（Alice Smith 和 Alice Lee）。
2. **`term` 查询**：
   - 运行：
     ```json
     GET /users/_search
     {
       "query": {
         "term": {
           "age": 30
         }
       }
     }
     ```
   - 预期：返回 ID 为 2 的文档（Bob Jones）。
3. **验证**：
   - 检查返回的 `hits.hits` 数组，确认文档内容。

### 注意事项

- `match` 对大小写不敏感（默认分词小写）。
- `term` 需精确匹配，确保字段类型正确。

## 关键点

- **`match` vs `term`**：
  - `match` 分词，适合搜索；`term` 不分词，适合精确筛选。
- **相关性得分**：
  - `match` 计算 `_score`，`filter` 不计算。

## 常见问题及解决方法

1. **问题**：查询无结果。
   - **原因**：字段名错误或数据未刷新。
   - **解决**：
     - 检查字段名（`name` vs `Name`）。
     - 强制刷新：`POST /users/_refresh`。
2. **问题**：`term` 查询 `text` 字段无效。
   - **原因**：`term` 不分词，`text` 已分词。
   - **解决**：
     - 用 `name.keyword` 或改用 `match`。

## 学习建议

- **理解得分**：
  - 运行带 `_score` 的查询，分析相关性排序。
  - 加 `explain: true` 查看得分计算：
    ```json
    GET /users/_search
    {
      "explain": true,
      "query": {"match": {"name": "Alice"}}
    }
    ```

:::note
本文是《Elasticsearch 七日笔记》系列的第 7 篇，对应第 3 天的学习内容。
:::
