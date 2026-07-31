---
title: fuzzy 与 wildcard 高级查询｜Elasticsearch 七日笔记 12
categories: Elasticsearch
tags:
  - Elasticsearch
  - 查询DSL
  - 模糊查询
  - 通配符
id: elasticsearch-fuzzy-and-wildcard
date: 2025-02-25 14:00:00
---

## 学习目标

- 掌握高级查询功能，包括模糊查询（`fuzzy`）和通配符查询（`wildcard`），提升搜索的灵活性和容错性。

本文继续沿用[第 7 篇](/article/elasticsearch-match-and-term)准备的 `users` 数据。

## 模糊查询（`fuzzy`）

- **定义**：
  - `fuzzy` 查询容忍拼写错误，基于编辑距离匹配。
- **特点**：
  - 适用于 `text` 字段。
  - 编辑距离（Levenshtein Distance）：插入、删除或替换字符的次数。
- **示例**：
  ```json
  GET /users/_search
  {
    "query": {
      "fuzzy": {
        "name": {
          "value": "Alce",
          "fuzziness": "AUTO"
        }
      }
    }
  }
  ```
  - 返回：匹配“Alice”（编辑距离 1）。
- **参数**：
  - `fuzziness`：
    - `AUTO`：词长 ≤ 2（0），3-5（1），>5（2）。
    - `1` 或 `2`：固定编辑距离。
  - `max_expansions`：最大扩展词，默认 50。
- **机制**：
  - “Alce”扩展为“Alice”等候选词，逐一匹配。

## 通配符查询（`wildcard`）

- **定义**：
  - `wildcard` 查询使用通配符（`*` 和 `?`）匹配模式。
- **特点**：
  - 适用于 `keyword` 字段。
  - `*`：任意字符，`?`：单个字符。
- **示例**：
  ```json
  GET /users/_search
  {
    "query": {
      "wildcard": {
        "name.keyword": "A*"
      }
    }
  }
  ```
  - 返回：匹配“Alice”、“Alex”等。
- **注意**：
  - 对 `text` 字段需用 `.keyword` 子字段。
- **性能**：
  - 比 `fuzzy` 慢，适合小数据集。

## 高级查询特性

- **`fuzzy`**：拼写容错，性能较慢。
- **`wildcard`**：模式匹配，需精确字段。

## 动手实践：高级查询

### 目标

- 测试 `fuzzy` 和 `wildcard` 查询。

### 步骤

1. **`fuzzy` 查询**：
   - 运行：
     ```json
     GET /users/_search
     {
       "query": {
         "fuzzy": {
           "name": {
             "value": "Alce",
             "fuzziness": "AUTO"
           }
         }
       }
     }
     ```
   - 预期：匹配“Alice Smith”和“Alice Lee”。
2. **`wildcard` 查询**：
   - 运行：
     ```json
     GET /users/_search
     {
       "query": {
         "wildcard": {
           "name.keyword": "A*"
         }
       }
     }
     ```
   - 预期：匹配以“A”开头的所有名字。
3. **验证**：
   - 检查返回的 `hits.hits`。

### 注意事项

- `fuzzy` 需 `text` 字段。
- `wildcard` 用 `.keyword`。

## 关键点

- **`fuzzy`**：
  - 容错拼写，`fuzziness` 控制范围。
- **`wildcard`**：
  - 通配符匹配，适用于 `keyword`。
- **性能**：
  - 高级查询较慢，慎用大数据。

## 常见问题及解决方法

1. **问题**：`fuzzy` 匹配过多。
   - **原因**：`fuzziness` 过大。
   - **解决**：设为 `1` 或 `2`。
2. **问题**：`wildcard` 无结果。
   - **原因**：字段类型不匹配。
   - **解决**：用 `.keyword`。

## 学习建议

- **动手实践**：
  - 测试多种 `fuzziness` 值。
- **优化查询**：
  - 结合 `bool` 和高级查询，缩小范围。
- **性能测试**：
  - 比较 `fuzzy` 和 `wildcard` 的响应时间。

## 总结

第四天通过理论学习，你掌握了聚合（`terms` 和 `avg`）、分析器和高级查询（`fuzzy` 和 `wildcard`）；通过实践操作，你在 Kibana 中执行了统计和复杂搜索，理解了数据分析和容错机制。这是 ES 高级功能的起点，为明天的 [Java 集成](/article/elasticsearch-java-setup)铺平道路。准备好用代码操作 ES 吧！

:::note
本文是《Elasticsearch 七日笔记》系列的第 12 篇，对应第 4 天的学习内容。
:::
