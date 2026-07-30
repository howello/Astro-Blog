---
title: 性能优化：Bulk、索引设计与查询优化｜Elasticsearch 七日笔记 18
categories: Elasticsearch
tags:
  - Elasticsearch
  - 性能优化
  - Bulk API
  - Java
id: elasticsearch-performance-tuning
date: 2025-02-28 09:00:00
---

## 学习目标

- 优化第六天的商品搜索项目，提升数据插入和查询的性能，掌握 Elasticsearch 的优化技巧。
- 通过实践操作，验证优化效果并总结经验，完成一周学习目标，为后续独立开发 ES 应用奠定坚实基础。

本文继续使用[第 16 篇](/article/elasticsearch-project-design)的 `Product` 实体类和[第 14 篇](/article/elasticsearch-java-connect)的 `ESClient`。

## 定义与意义

性能优化是提升 Elasticsearch 效率的关键，尤其在实际项目中面对大数据量时。优化涵盖数据插入、查询和索引设计，确保系统的高效性和可扩展性。

- **意义**：
  - 提高插入速度，减少资源消耗。
  - 加速查询响应，提升用户体验。
  - 优化索引结构，适应增长的数据规模。

## 批量操作（Bulk API）

- **定义**：
  - Bulk API 允许一次性插入、更新或删除多条文档，减少网络请求开销。
- **REST 示例**：
  ```json
  POST /products/_bulk
  {"index": {"_id": "1"}}
  {"name": "iPhone 13 Pro", "price": 999.99, "category": "Electronics"}
  {"index": {"_id": "2"}}
  {"name": "Samsung Galaxy S23", "price": 799.50, "category": "Electronics"}
  ```
  - 格式：每两行一个操作，第一行是元数据，第二行是文档内容。
- **优势**：
  - 比单条插入快 10-100 倍。
  - 减少网络往返时间。
- **Java 实现**：
  - 使用 `BulkRequest` 批量操作。
- **注意**：
  - 单次批量不宜过大（建议 1000-5000 条），避免内存压力。

## 索引设计优化

- **分片数优化**：
  - 单机建议 1 个主分片，0 个副本，减少资源占用。
    ```json
    PUT /products
    {
      "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0
      }
    }
    ```
  - 集群时根据节点数调整（每节点 20-30 个分片）。
- **字段优化**：
  - 只定义必要字段，禁用无关功能：
    ```json
    "mappings": {
      "properties": {
        "name": {"type": "text"},
        "price": {"type": "float", "index": false}  // 不索引，仅存储
      }
    }
    ```
- **禁用 `_source`**（可选）：
  - 如果只查询特定字段，可禁用：
    ```json
    "mappings": {
      "_source": {"enabled": false}
    }
    ```
  - 减少存储开销，但无法获取完整文档。

## 查询优化

- **使用 `filter`**：
  - 替换 `must`，避免得分计算。
  - 示例：
    ```json
    "bool": {
      "filter": [
        {"range": {"price": {"lte": 1000}}}
      ]
    }
    ```
- **缩小范围**：
  - 添加条件（如类别过滤），减少扫描文档。
- **避免深分页**：
  - 大 `from` 值性能低，建议用 `scroll` API。

## 注意事项

- **平衡性能与功能**：
  - 优化需根据场景权衡（如禁用 `_source` 牺牲灵活性）。
- **监控**：
  - 用 `_cat/indices?v` 查看索引状态。

## 动手实践：用 Bulk API 优化插入

### 目标

- 使用 Bulk API 批量插入第 6 天的 10 条数据。

### 步骤

1. **清空并重建索引**：
   - 在 Kibana 中运行：
     ```json
     DELETE /products
     PUT /products
     {
       "settings": {
         "number_of_shards": 1,
         "number_of_replicas": 0
       },
       "mappings": {
         "properties": {
           "name": {"type": "text"},
           "price": {"type": "float"},
           "category": {"type": "keyword"}
         }
       }
     }
     ```
2. **实现 Bulk 插入**：
   - 更新 `Main.java`：
     ```java
     import co.elastic.clients.elasticsearch.ElasticsearchClient;
     import co.elastic.clients.elasticsearch.core.BulkRequest;
     import co.elastic.clients.elasticsearch.core.BulkResponse;
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

             BulkRequest.Builder br = new BulkRequest.Builder();
             for (int i = 0; i < products.size(); i++) {
                 String id = String.valueOf(i + 1);
                 Product p = products.get(i);
                 br.operations(op -> op
                     .index(idx -> idx
                         .index("products")
                         .id(id)
                         .document(p)
                     )
                 );
             }

             BulkResponse bulkResponse = client.bulk(br.build());
             System.out.println("Bulk insert completed, errors: " + bulkResponse.errors());
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

- 检查 `bulkResponse.errors()` 是否为 `false`。
- 确保 `Product` 类正确定义。

## 动手实践：优化查询

### 目标

- 优化第 6 天的搜索，加入 `filter` 和范围查询。

### 步骤

- 更新 `Main.java`：
  ```java
  import co.elastic.clients.elasticsearch._types.SortOrder;
  import co.elastic.clients.elasticsearch.core.SearchResponse;
  import co.elastic.clients.elasticsearch.core.search.Hit;
  import co.elastic.clients.json.JsonData;

  public class Main {
      public static void main(String[] args) throws IOException {
          ElasticsearchClient client = ESClient.getClient();

          // Bulk 插入（略）

          SearchResponse<Product> response = client.search(s -> s
              .index("products")
              .query(q -> q
                  .bool(b -> b
                      .must(m -> m
                          .match(ma -> ma
                              .field("name")
                              .query("phone")
                          )
                      )
                      .filter(f -> f
                          .range(r -> r
                              .field("price")
                              .lte(JsonData.of(1000.0))
                          )
                      )
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

          System.out.println("Optimized search results:");
          for (Hit<Product> hit : response.hits().hits()) {
              Product p = hit.source();
              System.out.println(p.getName() + " - $" + p.getPrice());
          }
      }
  }
  ```
- **预期输出**：
  ```
  Optimized search results:
  iPhone 13 Pro - $999.99
  Samsung Galaxy S23 - $799.5
  Sony WH-1000XM5 Headphones - $349.99
  ```

### 注意事项

- 确保 `filter` 生效（`_score` 为 0）。
- 检查字段类型匹配。

## 动手实践：测试与总结

### 目标

- 验证优化效果并总结一周学习。

### 步骤

1. **测试性能**：
   - **插入时间**：
     - 对比单条插入和 Bulk：
       ```java
       long start = System.currentTimeMillis();
       // Bulk 插入代码
       long end = System.currentTimeMillis();
       System.out.println("Bulk time: " + (end - start) + "ms");
       ```
   - **查询时间**：
     - 加 `profile` 检查：
       ```json
       GET /products/_search?profile=true
       {
         "query": {
           "bool": {
             "must": {"match": {"name": "phone"}},
             "filter": {"range": {"price": {"lte": 1000}}}
           }
         }
       }
       ```
2. **总结问题**：
   - 记录一周遇到的问题和解决方法。
   - 整理关键知识点（如 `filter` 优势）。

### 注意事项

- 记录时间差异，分析优化效果。
- 确保所有功能正常。

## 关键点

- **Bulk API**：
  - 批量操作提升插入效率。
- **索引优化**：
  - 减少分片，禁用冗余字段。
- **查询优化**：
  - `filter` 替代 `must`，缩小范围。
- **性能**：
  - 优化需平衡功能与效率。

## 常见问题及解决方法

1. **问题**：Bulk 插入失败。
   - **原因**：JSON 格式错误。
   - **解决**：检查 `bulkResponse.items()` 的错误详情。
2. **问题**：查询未优化。
   - **原因**：未用 `filter`。
   - **解决**：确认 `_score` 是否为 0。
3. **问题**：索引创建失败。
   - **原因**：已存在。
   - **解决**：先删除 `DELETE /products`。
4. **问题**：运行超时。
   - **原因**：ES 负载高。
   - **解决**：检查 ES 状态（`GET _cat/health`）。

## 学习建议

- **动手实践**：
  - 增加数据量（100 条），测试 Bulk 效果。
  - 尝试其他优化（如调整 `refresh_interval`）。
- **性能对比**：
  - 记录优化前后的时间差异。
- **代码完善**：
  - 添加异常处理和日志。

:::note
本文是《Elasticsearch 七日笔记》系列的第 18 篇，对应第 7 天的学习内容。
:::
