---
title: bool 组合查询｜Elasticsearch 七日笔记 08
categories: Elasticsearch
tags:
  - Elasticsearch
  - 查询DSL
  - bool查询
  - filter
id: elasticsearch-bool-query
date: 2025-02-24 11:00:00
---

本文沿用[上一篇](/article/elasticsearch-match-and-term)准备的 `users` 数据（Alice Smith 25、Bob Jones 30、Charlie Brown 28、Alice Lee 22）。

## 定义与作用

组合查询通过 `bool` 查询实现多条件搜索，支持逻辑运算，提升查询的精确性和复杂性。

- **作用**：
  - 组合多个查询条件（如“名字含 Alice 且年龄为 25”）。
- **REST API**：
  - 在 `_search` 中使用 `bool`。

## `bool` 查询结构

- **子句**：
  - `must`：必须满足（逻辑与，AND）。
  - `should`：至少满足一个（逻辑或，OR）。
  - `filter`：必须满足但不计算得分。
  - `must_not`：必须不满足（逻辑非，NOT）。
- **示例**：
  ```json
  GET /users/_search
  {
    "query": {
      "bool": {
        "must": [
          {"match": {"name": "Alice"}}
        ],
        "filter": [
          {"term": {"age": 25}}
        ]
      }
    }
  }
  ```
  - 返回：`name` 含“Alice”且 `age` 为 25 的文档。

## 子句详解

- **`must`**：
  - 所有条件必须匹配，影响相关性得分。
  - 示例：`name` 含“Alice”且“Smith”。
- **`should`**：
  - 至少满足一个条件，可设置 `minimum_should_match`。
  - 示例：
    ```json
    "should": [
      {"match": {"name": "Bob"}},
      {"match": {"name": "Charlie"}}
    ],
    "minimum_should_match": 1
    ```
- **`filter`**：
  - 必须匹配但不计算得分，性能更高。
  - 示例：筛选 `age` 为 25。
- **`must_not`**：
  - 排除符合条件的文档。
  - 示例：排除 `age` 为 30。

## `filter` 的优势

- **不计算得分**：
  - 减少计算开销，查询更快。
- **缓存**：
  - 结果可被 ES 缓存，提升重复查询性能。
- **适用场景**：
  - 结构化筛选（如年龄范围、状态）。

## 动手实践：组合查询

### 目标

- 使用 `bool` 查询实现多条件搜索。

### 步骤

1. **搜索“Alice”且年龄 25**：
   - 运行：
     ```json
     GET /users/_search
     {
       "query": {
         "bool": {
           "must": [
             {"match": {"name": "Alice"}}
           ],
           "filter": [
             {"term": {"age": 25}}
           ]
         }
       }
     }
     ```
   - 预期：返回 ID 为 1 的文档（Alice Smith）。
2. **搜索年龄大于 20 的 Bob 或 Charlie**：
   - 运行：
     ```json
     GET /users/_search
     {
       "query": {
         "bool": {
           "should": [
             {"match": {"name": "Bob"}},
             {"match": {"name": "Charlie"}}
           ],
           "filter": [
             {"range": {"age": {"gt": 20}}}
           ]
         }
       }
     }
     ```
   - 预期：返回 ID 为 2 和 3 的文档（Bob Jones 和 Charlie Brown）。
3. **验证**：
   - 检查返回结果，理解 `must` 和 `should` 的逻辑。

### 注意事项

- `filter` 不影响 `_score`，适合性能优化。
- `should` 默认无需全匹配，可加 `minimum_should_match`。

## 关键点

- **`bool` 查询**：
  - `must`（与）、`should`（或）、`filter`（性能优化）、`must_not`（非）。

## 学习建议

- **动手实践**：
  - 尝试不同查询组合（如 `must` + `must_not`）。
  - 用 `match_all` 查询所有数据，观察结果结构。
- **笔记记录**：
  - 画出 `bool` 查询的逻辑关系图。

:::note
本文是《Elasticsearch 七日笔记》系列的第 8 篇，对应第 3 天的学习内容。
:::
