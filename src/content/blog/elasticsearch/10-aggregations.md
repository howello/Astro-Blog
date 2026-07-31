---
title: 聚合：terms 与 avg｜Elasticsearch 七日笔记 10
categories: Elasticsearch
tags:
  - Elasticsearch
  - 聚合
  - 数据分析
  - terms
id: elasticsearch-aggregations
date: 2025-02-25 09:00:00
---

## 学习目标

- 掌握 Elasticsearch 的聚合功能（Aggregations），包括分组统计（`terms`）和数值计算（`avg`），理解其在数据分析中的应用。
- 通过实践操作，在 Kibana 中执行聚合和高级查询，分析结果并优化搜索体验，为后续的实战项目奠定基础。

## 定义与作用

聚合是 Elasticsearch 提供的数据分析工具，类似于 SQL 中的 `GROUP BY` 和聚合函数（如 `COUNT`、`AVG`）。它允许从大量文档中提取统计信息，而不影响查询结果。

- **作用**：
  - 分组统计：按字段值分类并计数。
  - 数值计算：计算字段的平均值、总和等。
- **REST API**：
  - 在 `_search` 中使用 `aggs`（aggregations 的缩写）。

## `terms` 聚合

- **定义**：
  - `terms` 聚合按字段值分组统计，返回每个值的文档数量。
- **特点**：
  - 适用于 `keyword` 或数值类型字段。
  - 返回结果为“桶”（buckets），每个桶包含一个键（key）和文档计数（doc_count）。
- **示例**：
  ```json
  GET /users/_search
  {
    "aggs": {
      "by_age": {
        "terms": {
          "field": "age"
        }
      }
    }
  }
  ```
  - 返回：
    ```json
    {
      "aggregations": {
        "by_age": {
          "buckets": [
            {"key": 25, "doc_count": 1},
            {"key": 30, "doc_count": 1},
            {"key": 28, "doc_count": 1}
          ]
        }
      }
    }
    ```
- **参数**：
  - `size`：返回桶的最大数量，默认 10。
  - `order`：按键或计数排序，如 `{"_count": "desc"}`。
- **机制**：
  - ES 根据字段值创建桶，统计每个桶的文档数。

## `avg` 聚合

- **定义**：
  - `avg` 聚合计算字段的平均值，适用于数值类型。
- **特点**：
  - 返回单个值，通常与 `terms` 嵌套使用。
- **示例**：
  ```json
  GET /users/_search
  {
    "aggs": {
      "avg_age": {
        "avg": {
          "field": "age"
        }
      }
    }
  }
  ```
  - 返回：
    ```json
    {
      "aggregations": {
        "avg_age": {
          "value": 27.5
        }
      }
    }
    ```
- **嵌套示例**：
  ```json
  GET /users/_search
  {
    "aggs": {
      "by_age": {
        "terms": {
          "field": "age"
        },
        "aggs": {
          "avg_age": {
            "avg": {"field": "age"}
          }
        }
      }
    }
  }
  ```
  - 返回每个年龄组及其平均值（此处为示例，实际值相同）。

## 聚合特性

- **与查询分离**：
  - 聚合结果在 `aggregations` 中，不影响 `hits`。
- **性能**：
  - 聚合基于倒排索引，效率高，但大数据量需优化。

## 动手实践：聚合

### 目标

- 对 `users` 索引进行年龄分组统计和平均值计算。

### 步骤

1. **准备数据**（参考[第 7 篇](/article/elasticsearch-match-and-term)）：
   - 确保 `users` 有 4 条数据（Alice 25、Bob 30、Charlie 28、Alice 22）。
2. **按年龄分组**：
   - 运行：
     ```json
     GET /users/_search
     {
       "aggs": {
         "by_age": {
           "terms": {
             "field": "age"
           }
         }
       }
     }
     ```
   - 预期：
     ```json
     "buckets": [
       {"key": 25, "doc_count": 1},
       {"key": 30, "doc_count": 1},
       {"key": 28, "doc_count": 1},
       {"key": 22, "doc_count": 1}
     ]
     ```
3. **计算平均年龄**：
   - 运行：
     ```json
     GET /users/_search
     {
       "aggs": {
         "avg_age": {
           "avg": {"field": "age"}
         }
       }
     }
     ```
   - 预期：`"value": 26.25`。
4. **组合聚合**：
   - 运行：
     ```json
     GET /users/_search
     {
       "aggs": {
         "by_age": {
           "terms": {"field": "age"},
           "aggs": {
             "avg_age": {"avg": {"field": "age"}}
           }
         }
       }
     }
     ```

### 注意事项

- 确保 `age` 是 `integer` 类型。
- 检查返回的 `buckets` 和 `value`。

## 关键点

- **聚合**：
  - `terms` 分组，`avg` 计算。
  - 与查询分离，结果在 `aggregations`。

## 常见问题及解决方法

1. **问题**：聚合无结果。
   - **原因**：字段类型错误。
   - **解决**：检查 `GET /users/_mapping`，确保 `age` 是 `integer`。

## 学习建议

- **动手实践**：
  - 尝试不同聚合组合（如 `terms` + `sum`）。
- **记录笔记**：
  - 整理聚合和查询的返回结构。

:::note
本文是《Elasticsearch 七日笔记》系列的第 10 篇，对应第 4 天的学习内容。
:::
