---
title: 七日知识复习｜Elasticsearch 七日笔记 19
categories: Elasticsearch
tags:
  - Elasticsearch
  - 复习
  - 知识体系
  - Java
id: elasticsearch-week-review
date: 2025-02-28 14:00:00
recommend: true
---

## 学习目标

- 全面复习一周的学习内容，包括基础概念、CRUD、搜索、聚合、高级查询和 Java 集成，确保知识体系完整。

## 基础概念（第 1 天）

- **索引**：文档容器，类似数据库表。
- **文档**：JSON 数据单元，类似表行。
- **映射**：字段类型定义。
- **分片**：索引分割单位，主分片和副本分片。
- **副本**：数据冗余，提升高可用。

> 详见[什么是 Elasticsearch](/article/elasticsearch-what-is-es)与[核心术语](/article/elasticsearch-core-terms)。

## CRUD（第 2 天）

- **创建索引**：`PUT /<index_name>`。
- **插入**：`POST /_doc`（自动 ID）、`PUT /_doc/<id>`。
- **查询**：`GET /_doc/<id>`。
- **更新**：`PUT`（全量）、`POST /_update`（部分）。
- **删除**：`DELETE /_doc/<id>`。

> 详见[创建索引](/article/elasticsearch-create-index)、[插入文档](/article/elasticsearch-insert-document)与[查询、更新与删除文档](/article/elasticsearch-read-update-delete)。

## 搜索（第 3 天）

- **`match`**：全文搜索，分词匹配。
- **`term`**：精确匹配，不分词。
- **`bool`**：组合查询（`must`、`should`、`filter`）。
- **分页**：`from` 和 `size`。
- **排序**：`sort`。

> 详见 [match 与 term 查询](/article/elasticsearch-match-and-term)、[bool 组合查询](/article/elasticsearch-bool-query)与[分页与排序](/article/elasticsearch-paging-and-sorting)。

## 聚合与高级查询（第 4 天）

- **`terms`**：分组统计。
- **`avg`**：平均值计算。
- **分析器**：分词工具，默认 `standard`。
- **`fuzzy`**：模糊查询，容忍拼写错误。
- **`wildcard`**：通配符查询。

> 详见[聚合：terms 与 avg](/article/elasticsearch-aggregations)、[分析器与分词器](/article/elasticsearch-analyzer)与 [fuzzy 与 wildcard 高级查询](/article/elasticsearch-fuzzy-and-wildcard)。

## Java 集成（第 5 天）

- **依赖**：`elasticsearch-java` 和 `jackson-databind`。
- **客户端**：`ElasticsearchClient`。
- **CRUD**：`index`、`get`、`update`、`delete`。

> 详见 [Java 项目配置与实体类](/article/elasticsearch-java-setup)、[用 Java 连接 ES](/article/elasticsearch-java-connect)与 [Java 实现 CRUD](/article/elasticsearch-java-crud)。

## 实战项目（第 6 天）

- **场景**：商品搜索。
- **功能**：插入、搜索、排序、统计。

> 详见[商品搜索系统：需求与数据设计](/article/elasticsearch-project-design)与[商品搜索系统：插入、搜索、排序与统计](/article/elasticsearch-project-implementation)。

## 注意事项

- **复习重点**：
  - 理解每部分的核心概念和应用。
  - 对比 REST 和 Java 实现。

## 关键点

- **复习**：
  - 覆盖基础到实战的全流程。

## 学习建议

- **复习巩固**：
  - 回顾前六天笔记，回答关键问题（如 `match` vs `term`）。
- **总结经验**：
  - 写下学习心得，规划后续深入方向（如集群管理）。

## 总结

第七天通过理论学习，你掌握了 ES 的优化技巧并复习了一周知识；通过实践操作，你优化了商品搜索项目，验证了 Bulk 和查询改进的效果。这是你一周学习的收官，标志着你已能独立开发 ES 应用。恭喜完成目标，后续可深入集群、性能调优等高级主题！

:::note
本文是《Elasticsearch 七日笔记》系列的第 19 篇，也是最后一篇，对应第 7 天的学习内容。
:::
