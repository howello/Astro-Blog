---
title: 分页与排序｜Elasticsearch 七日笔记 09
categories: Elasticsearch
tags:
  - Elasticsearch
  - 查询DSL
  - 分页
  - 排序
id: elasticsearch-paging-and-sorting
date: 2025-02-24 14:00:00
---

## 学习目标

- 学习如何通过分页和排序控制查询结果，提升数据检索的灵活性。

本文继续沿用[第 7 篇](/article/elasticsearch-match-and-term)准备的 `users` 数据。

## 分页

- **定义**：
  - 控制查询结果的返回范围，类似 SQL 的 `LIMIT`。
- **参数**：
  - `from`：起始位置，从 0 开始。
  - `size`：每页返回数量，默认 10。
- **示例**：
  ```json
  GET /users/_search
  {
    "from": 0,
    "size": 2,
    "query": {
      "match_all": {}
    }
  }
  ```
  - 返回：前 2 条数据。
- **注意**：
  - 深分页（大 `from`）性能较低，建议用 `scroll` API。

## 排序

- **定义**：
  - 按字段值排序结果。
- **参数**：
  - `sort`：数组，指定字段和排序顺序。
  - `order`：`"asc"`（升序）或 `"desc"`（降序）。
- **示例**：
  ```json
  GET /users/_search
  {
    "sort": [
      {"age": {"order": "desc"}}
    ],
    "query": {
      "match_all": {}
    }
  }
  ```
  - 返回：按 `age` 降序排列的文档。
- **注意**：
  - 需字段支持排序（`keyword` 或数值类型）。

## 组合示例

- **分页+排序**：
  ```json
  GET /users/_search
  {
    "from": 0,
    "size": 1,
    "sort": [
      {"age": {"order": "asc"}}
    ],
    "query": {
      "match": {"name": "Alice"}
    }
  }
  ```
  - 返回：`name` 含“Alice”的文档中，`age` 最小的一条。

## 动手实践：分页与排序

### 目标

- 控制查询结果的顺序和数量。

### 步骤

1. **按年龄升序，分页取第 2 条**：
   - 运行：
     ```json
     GET /users/_search
     {
       "from": 1,
       "size": 1,
       "sort": [
         {"age": {"order": "asc"}}
       ],
       "query": {
         "match_all": {}
       }
     }
     ```
   - 预期：返回 ID 为 1 的文档（age 25）。
2. **按年龄降序取前 2 条**：
   - 运行：
     ```json
     GET /users/_search
     {
       "size": 2,
       "sort": [
         {"age": {"order": "desc"}}
       ],
       "query": {
         "match_all": {}
       }
     }
     ```
   - 预期：返回 ID 为 2（age 30）和 3（age 28）。
3. **验证**：
   - 检查返回顺序和数量是否正确。

### 注意事项

- `from` 从 0 开始，`size` 控制总数。
- 确保字段类型支持排序（`age` 为 `integer`）。

## 关键点

- **分页限制**：
  - 默认最大 10,000 条（`from + size`），超限需用 `scroll`。
- **排序字段**：
  - `text` 字段需用 `field.keyword` 排序。

## 常见问题及解决方法

1. **问题**：分页超出范围。
   - **原因**：`from + size` 超过 10,000。
   - **解决**：
     - 检查总数：`GET /users/_count`。
     - 用 `scroll` API 处理大数据。
2. **问题**：排序不生效。
   - **原因**：字段类型不支持。
   - **解决**：
     - 检查映射：`GET /users/_mapping`。
     - 确保 `age` 为 `integer`。

## 学习建议

- **分页测试**：
  - 修改 `from` 和 `size`，观察返回变化。
- **排序实验**：
  - 尝试多字段排序（如 `age` + `name.keyword`）。
- **笔记记录**：
  - 整理每种查询的语法和返回示例。

## 总结

第三天通过理论学习，你掌握了 ES 的简单查询（`match` 和 `term`）、组合查询（`bool`）以及分页和排序功能；通过实践操作，你在 Kibana 中执行了多种搜索命令，验证了结果并理解了搜索机制。这是 ES 核心能力的起点，为后续的聚合和高级查询奠定了基础。明天将进入更复杂的[聚合与高级查询](/article/elasticsearch-aggregations)，准备好探索数据分析和模糊搜索吧！

:::note
本文是《Elasticsearch 七日笔记》系列的第 9 篇，对应第 3 天的学习内容。
:::
