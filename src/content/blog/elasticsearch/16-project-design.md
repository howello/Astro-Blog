---
title: 商品搜索系统：需求与数据设计｜Elasticsearch 七日笔记 16
categories: Elasticsearch
tags:
  - Elasticsearch
  - Java
  - 实战项目
  - 索引设计
id: elasticsearch-project-design
date: 2025-02-27 09:00:00
---

## 学习目标

- 通过实现一个简易商品搜索系统，综合运用前五天的 Elasticsearch 知识，包括 CRUD、搜索、聚合和 Java 集成。
- 掌握从需求分析到代码实现的全流程，为后续优化和复习提供完整案例，确保能够独立开发 ES 应用。

## 项目场景选择

### 定义与意义

实战项目是将理论转化为实践的关键。本项目选择“简易商品搜索系统”，模拟电商场景，涵盖常见功能。

- **场景**：
  - 一个小型电商平台，需管理商品数据并提供搜索功能。
- **功能需求**：
  - **数据插入**：添加商品信息。
  - **关键词搜索**：支持模糊匹配（如“phone”）。
  - **按价格排序**：按价格升序或降序排列结果。
  - **类别统计**：统计每个类别的商品数量。
- **意义**：
  - 结合 [CRUD](/article/elasticsearch-create-index)、[搜索](/article/elasticsearch-match-and-term)、[聚合](/article/elasticsearch-aggregations)和 [Java 集成](/article/elasticsearch-java-setup)。
  - 贴近实际应用，锻炼综合能力。

### 技术选型

- **ES 索引**：`products`，存储商品数据。
- **Java 客户端**：Elasticsearch Java API Client 8.17.2。
- **开发工具**：IntelliJ IDEA，Maven。

### 注意事项

- **数据规模**：从小规模开始（10 条），便于测试。
- **功能扩展**：支持[模糊查询和通配符查询](/article/elasticsearch-fuzzy-and-wildcard)。

## 数据设计

### 索引结构

- **索引名称**：`products`
- **映射（Mapping）**：
  ```json
  PUT /products
  {
    "mappings": {
      "properties": {
        "name": {"type": "text"},
        "price": {"type": "float"},
        "category": {"type": "keyword"}
      }
    }
  }
  ```
- **字段说明**：
  - `name`（`text`）：商品名称，支持全文搜索。
  - `price`（`float`）：价格，支持排序和范围查询。
  - `category`（`keyword`）：类别，支持精确匹配和聚合。

### 示例数据

- **10 条商品数据**：
  ```json
  {"name": "iPhone 13 Pro", "price": 999.99, "category": "Electronics"}
  {"name": "Samsung Galaxy S23", "price": 799.50, "category": "Electronics"}
  {"name": "Sony WH-1000XM5 Headphones", "price": 349.99, "category": "Electronics"}
  {"name": "Leather Jacket", "price": 199.99, "category": "Clothing"}
  {"name": "Running Shoes Nike", "price": 89.99, "category": "Clothing"}
  {"name": "Winter Coat", "price": 149.50, "category": "Clothing"}
  {"name": "Java Programming Guide", "price": 29.99, "category": "Books"}
  {"name": "Elasticsearch in Action", "price": 39.95, "category": "Books"}
  {"name": "Electric Kettle", "price": 45.00, "category": "Home Appliances"}
  {"name": "Non-Stick Frying Pan", "price": 59.99, "category": "Home Appliances"}
  ```
- **特点**：
  - 覆盖多种类别（Electronics、Clothing、Books、Home Appliances）。
  - 价格范围广泛，便于排序测试。

### 注意事项

- **字段类型**：
  - `name` 用 `text` 支持分词。
  - `category` 用 `keyword` 支持聚合。
- **数据一致性**：
  - 确保字段名和类型与映射匹配。

## 功能实现思路

### 插入数据

- **方法**：
  - 使用 `index` API 批量插入。
- **Java 实现**：
  - 通过循环插入多条数据。
- **目标**：
  - 将 10 条商品写入 `products` 索引。

### 关键词搜索

- **方法**：
  - 使用 `match` 查询，支持模糊匹配。
- **Java 实现**：
  - 调用 `search` 方法，返回匹配文档。
- **目标**：
  - 搜索含“phone”的商品。

### 按价格排序

- **方法**：
  - 使用 `sort` 参数，按 `price` 排序。
- **Java 实现**：
  - 在 `search` 中添加排序逻辑。
- **目标**：
  - 按价格降序排列搜索结果。

### 类别统计

- **方法**：
  - 使用 `terms` 聚合，按 `category` 分组。
- **Java 实现**：
  - 在 `search` 中添加聚合逻辑。
- **目标**：
  - 统计每个类别的商品数量。

### 注意事项

- **性能**：
  - 小数据集直接插入，大数据需优化（见[性能优化](/article/elasticsearch-performance-tuning)）。
- **扩展性**：
  - 支持模糊查询（`fuzzy`）和通配符查询（`wildcard`）。

## 动手实践：准备项目

### 目标

- 搭建 Java 项目，复用[第 5 天](/article/elasticsearch-java-setup)的环境。

### 步骤

1. **复用环境**：
   - 使用第 5 天的 `es-demo` 项目。
   - 确保 `pom.xml` 包含：
     ```xml
     <dependencies>
         <dependency>
             <groupId>co.elastic.clients</groupId>
             <artifactId>elasticsearch-java</artifactId>
             <version>8.17.2</version>
         </dependency>
         <dependency>
             <groupId>com.fasterxml.jackson.core</groupId>
             <artifactId>jackson-databind</artifactId>
             <version>2.17.2</version>
         </dependency>
         <dependency>
             <groupId>org.projectlombok</groupId>
             <artifactId>lombok</artifactId>
             <version>1.18.36</version>
             <scope>provided</scope>
         </dependency>
     </dependencies>
     ```
2. **创建实体类**：
   - 新建 `Product.java`：
     ```java
     import lombok.Data;

     @Data
     public class Product {
         private String name;
         private float price;
         private String category;

         public Product() {}
         public Product(String name, float price, String category) {
             this.name = name;
             this.price = price;
             this.category = category;
         }
     }
     ```
3. **复用客户端**：
   - 使用[第 14 篇](/article/elasticsearch-java-connect)的 `ESClient.java`。

### 注意事项

- 确保依赖已下载（`mvn compile`）。
- 检查 ES 运行状态。

:::note
本文是《Elasticsearch 七日笔记》系列的第 16 篇，对应第 6 天的学习内容。本文定义的 `Product` 实体类会被第 17、18 篇继续使用。
:::
