---
title: Java 项目配置与实体类｜Elasticsearch 七日笔记 13
categories: Elasticsearch
tags:
  - Elasticsearch
  - Java
  - Maven
  - 客户端
id: elasticsearch-java-setup
date: 2025-02-26 09:00:00
---

## 学习目标

- 掌握使用 Java 代码操作 Elasticsearch 的方法，理解客户端配置和基本 API 的使用。

## 定义与作用

要在 Java 中操作 Elasticsearch，需要配置开发环境，包括添加依赖、设置客户端和准备实体类。这是将 REST API 转变为代码的第一步。

- **作用**：
  - 建立 Java 与 ES 的连接。
  - 提供编程接口，替代手动 REST 请求。
- **工具**：
  - Maven：管理依赖。
  - Elasticsearch Java API Client：官方推荐的现代化客户端。

## Maven 依赖

- **客户端选择**：
  - **Elasticsearch Java API Client**：8.x 官方客户端，轻量且现代化。
  - **High-Level REST Client**：7.x 遗留客户端，8.x 仍支持但不推荐。
- **依赖配置**：
  ```xml
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
  ```
- **说明**：
  - `elasticsearch-java`：核心客户端库。
  - `jackson-databind`：JSON 序列化/反序列化支持。
- **环境要求**：
  - JDK 11 或 17，与 ES 8.17.2 兼容。
  - ES 服务运行在 `localhost:9200`。

## 注意事项

- **版本一致性**：
  - 客户端版本需与 ES 服务版本匹配（8.17.2）。
- **依赖冲突**：
  - 避免多个 JSON 库混用（如 Jackson 和 Gson）。

## 实体类

- **示例**：
  ```java
  public class User {
      private String name;
      private int age;

      public User() {}
      public User(String name, int age) {
          this.name = name;
          this.age = age;
      }
      public String getName() { return name; }
      public void setName(String name) { this.name = name; }
      public int getAge() { return age; }
      public void setAge(int age) { this.age = age; }
  }
  ```
- **要求**：
  - 需无参构造和 getter/setter，用于 JSON 序列化。

## 动手实践：创建 Java 项目

### 目标

- 搭建 Maven 项目，配置 ES 客户端依赖。

### 步骤

1. **新建项目**：
   - 在 IntelliJ IDEA 中：`File > New > Project > Maven`。
   - GroupId: `com.example`, ArtifactId: `es-demo`。
2. **添加依赖**：
   - 编辑 `pom.xml`：
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
     </dependencies>
     ```
3. **创建实体类**：
   - 新建 `User.java`（见上）。
4. **编译验证**：
   - 运行 `mvn clean install`，确保无报错。

### 注意事项

- 确保网络可用，下载依赖。
- 检查 JDK 版本（11 或 17）。

## 关键点

- **依赖**：
  - `elasticsearch-java` 和 `jackson-databind`。
- **序列化**：
  - Jackson 默认，要求实体类规范。

## 常见问题及解决方法

1. **问题**：依赖报错。
   - **原因**：版本不匹配。
   - **解决**：检查 `pom.xml`，确保 8.17.2。
2. **问题**：序列化错误。
   - **原因**：实体类缺少构造或 getter。
   - **解决**：添加无参构造和 getter/setter。
3. **问题**：`NoSuchFieldError`。
   - **原因**：Jackson 版本冲突。
   - **解决**：锁定 2.17.2。

## 学习建议

- **实体类设计**：
  - 测试复杂对象（如带 List 的类）。

:::note
本文是《Elasticsearch 七日笔记》系列的第 13 篇，对应第 5 天的学习内容。
:::
