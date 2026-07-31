---
title: 什么是 Elasticsearch｜Elasticsearch 七日笔记 01
categories: Elasticsearch
tags:
  - Elasticsearch
  - 搜索引擎
  - 入门
  - 分布式
id: elasticsearch-what-is-es
date: 2025-02-22 09:00:00
---

## 学习目标

- 深入理解 Elasticsearch 的基本原理、架构设计及其在现代应用中的作用。

## 定义与背景

Elasticsearch（简称 ES）是一个基于 Apache Lucene 构建的开源分布式搜索引擎，由 Elastic 公司开发。它最初是为了解决大规模数据搜索和分析的痛点而设计的，广泛应用于日志分析、全文搜索、数据可视化等领域。ES 的核心在于其高效的索引机制和分布式架构，能够处理海量数据并提供近实时的查询响应。

- **诞生背景**：
  - 2010 年，Shay Banon 发布了 Elasticsearch，旨在解决当时现有搜索工具（如 Solr）在分布式扩展和易用性上的不足。
  - ES 从一开始就注重开发者体验，提供 RESTful API 和简单的 JSON 查询语言。
- **版本演进**：
  - 截至 2025 年 2 月，最新稳定版为 8.17.2，集成了安全性（如默认启用 X-Pack）、高性能和现代化客户端支持（如 Java API Client）。
- **与 Lucene 的关系**：
  - Lucene 是底层的搜索库，提供倒排索引和查询功能。
  - ES 在 Lucene 上封装了分布式功能、REST API 和集群管理。

## 核心特点

- **分布式架构**：
  - ES 将数据分布在多个节点上，每个节点可以独立运行，自动实现负载均衡和故障恢复。
  - 通过分片和副本机制，确保高可用性和高并发处理能力。
  - 例如，一个集群可以有 3 个节点，每个节点存储部分数据，查询时并行处理。
- **无固定 Schema**：
  - 数据以 JSON 格式存储，无需预定义表结构，适合动态变化的数据模型。
  - 例如，一个文档可以随时添加新字段，ES 会自动推断其类型（如 `"age": 25` 推断为 `integer`）。
- **近实时性（Near Real-Time）**：
  - 数据写入后，经过短暂的刷新间隔（默认 1 秒），即可被搜索到，而非完全实时。
  - 通过 `refresh_interval` 参数可调整延迟与性能的平衡，例如：
    ```yaml
    index.refresh_interval: 30s
    ```
- **全文搜索能力**：
  - 基于 Lucene 的倒排索引，支持分词、模糊匹配和复杂的查询逻辑。
  - 例如，搜索“apple phone”可以匹配包含“apple”或“phone”的文档，并按相关性排序。
- **可扩展性**：
  - 支持水平扩展，只需添加节点即可提升容量和性能，无需修改应用代码。
  - 集群规模可以从单节点扩展到数百节点。

## 与关系型数据库的对比

为了更好地理解 ES，我们将其与传统的关系型数据库（如 MySQL）进行对比：

| **特性**     | **Elasticsearch**      | **MySQL**                 |
| ------------ | ---------------------- | ------------------------- |
| **数据结构** | JSON 文档，无固定结构  | 固定表结构，需定义 Schema |
| **存储方式** | 分布式，分片存储       | 单机或主从架构            |
| **查询方式** | 查询 DSL（JSON 格式）  | SQL                       |
| **扩展性**   | 水平扩展，添加节点即可 | 垂直扩展或主从复制        |
| **实时性**   | 近实时（约 1 秒延迟）  | 完全实时                  |
| **适用场景** | 搜索、分析、日志处理   | 事务处理、结构化数据存储  |

- **示例**：
  - 在 MySQL 中，表 `users` 需定义列 `name VARCHAR(50), age INT`。
  - 在 ES 中，`users` 索引直接存储 `{"name": "Alice", "age": 25}`，无需预定义。

## 应用场景

- **日志分析**：
  - 如 ELK 栈（Elasticsearch、Logstash、Kibana），实时分析服务器日志。
  - 例如，收集 Nginx 日志，搜索 404 错误并统计频率。
- **电商搜索**：
  - 如淘宝的商品搜索，支持关键词匹配、过滤（价格范围）和排序（销量）。
- **数据可视化**：
  - 通过 Kibana 展示统计数据，如用户行为分析（每日访问量、热门页面）。
- **企业搜索**：
  - 为内部文档、知识库提供快速检索，如搜索公司政策文件。
- **实时监控**：
  - 分析传感器数据，检测异常并触发告警。

## 为什么学习 ES？

作为 Java 程序员，ES 在后端开发中非常常见，尤其在以下场景：

- **日志系统**：与 Spring Boot 集成，分析应用日志。
- **搜索模块**：为 Web 应用提供高效搜索功能。
- **大数据处理**：处理分布式数据，提升系统性能。

掌握 ES 能让你在分布式系统开发中更具竞争力，尤其在微服务架构中。

## 本系列目录

本系列是一份七天的 Elasticsearch 入门学习计划，按知识点拆成 19 篇。建议按顺序阅读，后面的实践大量复用前面建好的索引和 Java 类。

**第 1 天：基础概念与环境搭建**

1. 什么是 Elasticsearch（本文）
2. [核心术语：索引、文档、映射、分片与副本](/article/elasticsearch-core-terms)
3. [安装 Elasticsearch 与 Kibana](/article/elasticsearch-install)

**第 2 天：基本操作（CRUD）**

4. [创建索引](/article/elasticsearch-create-index)
5. [插入文档](/article/elasticsearch-insert-document)
6. [查询、更新与删除文档](/article/elasticsearch-read-update-delete)

**第 3 天：搜索基础**

7. [match 与 term 查询](/article/elasticsearch-match-and-term)
8. [bool 组合查询](/article/elasticsearch-bool-query)
9. [分页与排序](/article/elasticsearch-paging-and-sorting)

**第 4 天：聚合与高级查询**

10. [聚合：terms 与 avg](/article/elasticsearch-aggregations)
11. [分析器与分词器](/article/elasticsearch-analyzer)
12. [fuzzy 与 wildcard 高级查询](/article/elasticsearch-fuzzy-and-wildcard)

**第 5 天：Java 集成 ES**

13. [Java 项目配置与实体类](/article/elasticsearch-java-setup)
14. [用 Java 连接 ES](/article/elasticsearch-java-connect)
15. [Java 实现 CRUD](/article/elasticsearch-java-crud)

**第 6 天：实战项目**

16. [商品搜索系统：需求与数据设计](/article/elasticsearch-project-design)
17. [商品搜索系统：插入、搜索、排序与统计](/article/elasticsearch-project-implementation)

**第 7 天：优化与复习**

18. [性能优化：Bulk、索引设计与查询优化](/article/elasticsearch-performance-tuning)
19. [七日知识复习](/article/elasticsearch-week-review)

:::note
本文是《Elasticsearch 七日笔记》系列的第 1 篇，对应第 1 天的学习内容。
:::
