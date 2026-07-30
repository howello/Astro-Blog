---
title: 商品搜索系统：插入、搜索、排序与统计｜Elasticsearch 七日笔记 17
categories: Elasticsearch
tags:
  - Elasticsearch
  - Java
  - 实战项目
  - 聚合
id: elasticsearch-project-implementation
date: 2025-02-27 14:00:00
---

## 学习目标

- 在 Java 项目中完成数据的插入、关键词搜索、排序和类别统计功能，提升实战能力。

本文承接[上一篇](/article/elasticsearch-project-design)的项目设计，使用其中定义的 `Product` 实体类和[第 14 篇](/article/elasticsearch-java-connect)的 `ESClient`。

## 创建索引和插入数据

### 目标

- 初始化 `products` 索引并插入 10 条数据。

### 步骤

1. **创建索引**：
   - 在 Kibana 中运行：
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
2. **插入数据**：
   - 更新 `Main.java`：
     ```java
     import co.elastic.clients.elasticsearch.ElasticsearchClient;
     import java.io.IOException;
     import java.util.Arrays;
     import java.util.List;

     public class Main {
         public static void main(String[] args) throws IOException {
             ElasticsearchClient client = ESClient.getClient();

             List<Product> products = Arrays.asList(
                 new Product("iPhone 13 Pro", 999.99f, "Electronics"),
                 new Product("Samsung Galaxy S23", 799.50f, "Electronics"),
                 new Product("Sony WH-1000XM5 Headphones", 349.99f, "Electronics"),
                 new Product("Leather Jacket", 199.99f, "Clothing"),
                 new Product("Running Shoes Nike", 89.99f, "Clothing"),
                 new Product("Winter Coat", 149.50f, "Clothing"),
                 new Product("Java Programming Guide", 29.99f, "Books"),
                 new Product("Elasticsearch in Action", 39.95f, "Books"),
                 new Product("Electric Kettle", 45.00f, "Home Appliances"),
                 new Product("Non-Stick Frying Pan", 59.99f, "Home Appliances")
             );

             for (int i = 0; i < products.size(); i++) {
                 String id = String.valueOf(i + 1);
                 Product p = products.get(i);
                 client.index(idx -> idx
                     .index("products")
                     .id(id)
                     .document(p)
                 );
                 System.out.println("Inserted: " + p.getName());
             }
         }
     }
     ```
3. **验证**：
   - 运行代码，检查 Kibana：
     ```json
     GET /products/_search
     ```
   - 预期返回 10 条数据。

### 注意事项

- 确保索引未重复创建（先 `DELETE /products`）。
- 等待 1 秒，确保数据可查。

## 实现搜索和排序

### 目标

- 搜索“phone”并按价格降序排列。

### 步骤

- 更新 `Main.java`：
  ```java
  import co.elastic.clients.elasticsearch._types.SortOrder;
  import co.elastic.clients.elasticsearch.core.SearchResponse;
  import co.elastic.clients.elasticsearch.core.search.Hit;

  public class Main {
      public static void main(String[] args) throws IOException {
          ElasticsearchClient client = ESClient.getClient();

          // 插入数据（略）

          SearchResponse<Product> response = client.search(s -> s
              .index("products")
              .query(q -> q
                  .match(m -> m
                      .field("name")
                      .query("phone")
                  )
              )
              .sort(sort -> sort
                  .field(f -> f
                      .field("price")
                      .order(SortOrder.Desc)
                  )
              ),
              Product.class
          );

          System.out.println("Search results:");
          for (Hit<Product> hit : response.hits().hits()) {
              Product p = hit.source();
              System.out.println(p.getName() + " - $" + p.getPrice() + " - " + p.getCategory());
          }
      }
  }
  ```
- **预期输出**：
  ```
  Search results:
  iPhone 13 Pro - $999.99 - Electronics
  Samsung Galaxy S23 - $799.5 - Electronics
  Sony WH-1000XM5 Headphones - $349.99 - Electronics
  ```

### 注意事项

- 检查字段名（`name` 而非 `Name`）。
- 确保 `price` 是 `float`。

## 实现类别统计

### 目标

- 统计每个类别的商品数量。

### 步骤

- 更新 `Main.java`：
  ```java
  import co.elastic.clients.elasticsearch.core.SearchResponse;
  import co.elastic.clients.elasticsearch._types.aggregations.StringTermsBucket;

  public class Main {
      public static void main(String[] args) throws IOException {
          ElasticsearchClient client = ESClient.getClient();

          // 插入数据（略）
          // 搜索（略）

          SearchResponse<Product> aggResponse = client.search(s -> s
              .index("products")
              .query(q -> q.matchAll(m -> m))
              .aggregations("by_category", a -> a
                  .terms(t -> t.field("category"))
              ),
              Product.class
          );

          System.out.println("Category stats:");
          List<StringTermsBucket> buckets = aggResponse.aggregations()
              .get("by_category")
              .sterms()
              .buckets()
              .array();
          for (StringTermsBucket bucket : buckets) {
              System.out.println(bucket.key().stringValue() + ": " + bucket.docCount());
          }
      }
  }
  ```
- **预期输出**：
  ```
  Category stats:
  Electronics: 3
  Clothing: 3
  Books: 2
  Home Appliances: 2
  ```

### 注意事项

- 使用 `bucket.key().stringValue()` 获取类别名。
- 确保 `category` 是 `keyword`。

## 关键点

- **索引设计**：
  - `text` 用于搜索，`keyword` 用于聚合。
- **搜索**：
  - `match` 支持模糊匹配。
- **排序**：
  - `SortOrder.Desc` 降序。
- **聚合**：
  - `terms` 返回桶，需解析 `key`。
- **Java API**：
  - Lambda 表达式简化请求构建。

## 常见问题及解决方法

1. **问题**：搜索无结果。
   - **原因**：字段名错误或数据未刷新。
   - **解决**：
     - 检查 `name` 是否正确。
     - 运行 `POST /products/_refresh`。
2. **问题**：聚合结果为空。
   - **原因**：字段类型不符。
   - **解决**：确认 `category` 是 `keyword`（`GET /products/_mapping`）。
3. **问题**：排序无效。
   - **原因**：字段类型错误。
   - **解决**：确保 `price` 是 `float`。
4. **问题**：运行报错 `IOException`。
   - **原因**：ES 未启动。
   - **解决**：检查 `localhost:9200`。

## 学习建议

- **动手实践**：
  - 添加更多数据（20 条），测试搜索和聚合。
  - 尝试其他关键词（如“book”）。
- **功能扩展**：
  - 实现模糊查询（`fuzzy`）和通配符查询（`wildcard`）。
- **代码调试**：
  - 打印 `response` 的完整 JSON，理解结构。
- **性能观察**：
  - 记录搜索和聚合的耗时。
- **笔记记录**：
  - 整理插入、搜索、聚合的代码。
  - 画出项目功能流程图。

## 总结

第六天通过理论学习，你设计了一个商品搜索系统；通过实践操作，你用 Java 实现了数据插入、搜索、排序和统计。这是前五天知识的综合应用，标志着你能独立开发 ES 项目。明天将[优化项目并复习](/article/elasticsearch-performance-tuning)，准备好迎接最后一关吧！

:::note
本文是《Elasticsearch 七日笔记》系列的第 17 篇，对应第 6 天的学习内容。
:::
