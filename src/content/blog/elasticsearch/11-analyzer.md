---
title: 分析器与分词器｜Elasticsearch 七日笔记 11
categories: Elasticsearch
tags:
  - Elasticsearch
  - 分词
  - 全文搜索
  - IK分词器
id: elasticsearch-analyzer
date: 2025-02-25 11:00:00
---

## 学习目标

- 学习全文搜索优化的基础知识，了解分析器（Analyzer）和分词器（Tokenizer）的原理及其对搜索的影响。

## 定义与作用

全文搜索是 ES 的核心能力，其效果依赖于分析器（Analyzer）和分词器（Tokenizer）。优化这些组件可以提升搜索的准确性和效率。

- **作用**：
  - 控制文本如何分词和索引。
  - 影响 `match` 查询的结果。

## 分析器（Analyzer）

- **定义**：
  - 分析器将文本分解为词元（tokens），用于索引和搜索。
- **默认分析器**：
  - `standard`：按空格和标点分词，转为小写。
  - 示例：
    ```json
    POST _analyze
    {
      "analyzer": "standard",
      "text": "Hello World"
    }
    ```
    - 返回：`["hello", "world"]`
- **组件**：
  - **分词器（Tokenizer）**：分割文本。
  - **过滤器（Filter）**：转换词元（如小写、去停用词）。
- **作用**：
  - 决定搜索匹配的词元，例如“HELLO”匹配“hello”。

## 分词器（Tokenizer）

- **定义**：
  - 分词器是分析器的核心，决定文本如何分割。
- **类型**：
  - `standard`：按空格和标点分割。
  - `whitespace`：仅按空格分割。
  - `ik_smart`（需插件）：中文智能分词。
- **示例**：
  - 默认分词：
    ```json
    POST _analyze
    {
      "analyzer": "standard",
      "text": "我爱编程"
    }
    ```
    - 返回：`["我爱编程"]`（不分词）。
  - 安装 `ik` 插件后：
    ```json
    POST _analyze
    {
      "analyzer": "ik_smart",
      "text": "我爱编程"
    }
    ```
    - 返回：`["我", "爱", "编程"]`。
- **注意**：
  - 中文搜索需 `ik` 插件，默认分析器不适合。

## 优化意义

- **匹配准确性**：
  - 合适的分析器提升搜索召回率。
- **性能**：
  - 减少无效词元，降低索引体积。

## 动手实践：分词测试

### 目标

- 测试分析器对搜索的影响。

### 步骤

1. **默认分词**：
   - 运行：
     ```json
     POST _analyze
     {
       "analyzer": "standard",
       "text": "Hello World"
     }
     ```
   - 预期：`["hello", "world"]`。
2. **中文分词（可选）**：
   - 若装 `ik` 插件：
     ```json
     POST _analyze
     {
       "analyzer": "ik_smart",
       "text": "我爱编程"
     }
     ```
     - 预期：`["我", "爱", "编程"]`。
   - 未装：
     ```json
     POST _analyze
     {
       "analyzer": "standard",
       "text": "我爱编程"
     }
     ```
     - 预期：`["我爱编程"]`。

### 注意事项

- 记录分词结果，理解对 `match` 的影响。
- 未装 `ik`，中文不分词。

## 关键点

- **分析器**：
  - 默认 `standard`，中文需 `ik`。

## 常见问题及解决方法

1. **问题**：分词未生效。
   - **原因**：字段映射或分析器不符。
   - **解决**：用 `_analyze` 测试。

## 学习建议

- **理解分词**：
  - 用 `_analyze` 分析常见词，观察词元。
- **记录笔记**：
  - 画出分词和匹配流程图。

:::note
本文是《Elasticsearch 七日笔记》系列的第 11 篇，对应第 4 天的学习内容。
:::
