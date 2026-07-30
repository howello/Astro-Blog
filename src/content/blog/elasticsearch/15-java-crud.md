---
title: Java 实现 CRUD｜Elasticsearch 七日笔记 15
categories: Elasticsearch
tags:
  - Elasticsearch
  - Java
  - CRUD
  - API
id: elasticsearch-java-crud
date: 2025-02-26 14:00:00
---

## 学习目标

- 通过 Java 实现对 ES 的增删改查（CRUD）操作，将前四天的 REST API 知识转化为编程实践。

本文使用[第 14 篇](/article/elasticsearch-java-connect)创建的 `ESClient` 与[第 13 篇](/article/elasticsearch-java-setup)定义的 `User` 实体类。

## 插入（Create）

- **方法**：
  - `index`：插入或覆盖文档。
- **示例**：
  ```java
  User user = new User("Alice", 25);
  client.index(i -> i
      .index("users")
      .id("1")
      .document(user)
  );
  ```
- **机制**：
  - 将 `User` 对象序列化为 JSON，发送 PUT 请求。

## 查询（Read）

- **方法**：
  - `get`：按 ID 获取文档。
- **示例**：
  ```java
  GetResponse<User> response = client.get(g -> g
      .index("users")
      .id("1"),
      User.class
  );
  if (response.found()) {
      User user = response.source();
      System.out.println(user.getName());
  }
  ```
- **返回**：
  - `GetResponse` 包含 `_source`（文档内容）。

## 更新（Update）

- **方法**：
  - `update`：部分更新文档。
- **示例**：
  ```java
  client.update(u -> u
      .index("users")
      .id("1")
      .doc(new User("Alice Smith", 26)),
      User.class
  );
  ```
- **机制**：
  - 只更新指定字段，原字段保留。

## 删除（Delete）

- **方法**：
  - `delete`：删除文档。
- **示例**：
  ```java
  client.delete(d -> d
      .index("users")
      .id("1")
  );
  ```
- **返回**：
  - `DeleteResponse` 包含删除状态。

## 动手实践：实现 CRUD

### 目标

- 用 Java 执行增删改查操作。

### 步骤

1. **插入数据**：
   - 更新 `Main.java`：
     ```java
     User user = new User("Alice", 25);
     client.index(i -> i.index("users").id("1").document(user));
     System.out.println("Inserted Alice");
     ```
2. **查询数据**：
   - 添加：
     ```java
     GetResponse<User> response = client.get(g -> g.index("users").id("1"), User.class);
     if (response.found()) {
         User found = response.source();
         System.out.println("Found: " + found.getName() + ", " + found.getAge());
     }
     ```
3. **更新数据**：
   - 添加：
     ```java
     client.update(u -> u.index("users").id("1").doc(new User("Alice Smith", 26)), User.class);
     System.out.println("Updated Alice");
     ```
4. **删除数据**：
   - 添加：
     ```java
     client.delete(d -> d.index("users").id("1"));
     System.out.println("Deleted Alice");
     ```
5. **运行验证**：
   - 依次运行，检查输出。
   - 用 Kibana 验证：`GET /users/_doc/1`。

### 注意事项

- 确保 `User` 类完整。
- 处理 `IOException`。

## 关键点

- **CRUD 方法**：
  - `index`、`get`、`update`、`delete`。

## 学习建议

- **动手实践**：
  - 尝试插入多条数据，查询不同 ID。
  - 添加异常处理，观察失败场景。
- **理解 API**：
  - 阅读 `ElasticsearchClient` 的方法签名。
  - 对比 REST 和 Java API。
- **调试技巧**：
  - 用 `System.out` 打印返回结果。
  - 在 Kibana 检查数据一致性。
- **笔记记录**：
  - 整理 CRUD 代码示例。

## 总结

第五天通过理论学习，你掌握了 Java 集成 ES 的配置和 CRUD 操作；通过实践操作，你搭建了项目并用代码管理数据。这是编程与 ES 的桥梁，为明天的[实战项目](/article/elasticsearch-project-design)提供了技术支持。下一天将进入实战，准备好实现一个完整应用吧！

:::note
本文是《Elasticsearch 七日笔记》系列的第 15 篇，对应第 5 天的学习内容。
:::
