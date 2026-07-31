---
title: 用 Java 连接 ES｜Elasticsearch 七日笔记 14
categories: Elasticsearch
tags:
  - Elasticsearch
  - Java
  - 客户端
  - 认证
id: elasticsearch-java-connect
date: 2025-02-26 11:00:00
---

## 学习目标

- 在实际项目中连接 ES，执行数据操作，为后续的实战项目奠定编程基础，确保能够将 ES 集成到 Java 应用中。

本文承接[上一篇](/article/elasticsearch-java-setup)搭好的 `es-demo` 项目。

## 定义与方式

连接 ES 是 Java 操作的第一步，需要初始化客户端以发送请求和接收响应。

- **核心组件**：
  - `RestClient`：低级 HTTP 客户端。
  - `ElasticsearchTransport`：传输层，处理 JSON 转换。
  - `ElasticsearchClient`：高级客户端，提供 API。
- **基本连接**：
  ```java
  import co.elastic.clients.elasticsearch.ElasticsearchClient;
  import co.elastic.clients.json.jackson.JacksonJsonpMapper;
  import co.elastic.clients.transport.ElasticsearchTransport;
  import co.elastic.clients.transport.rest_client.RestClientTransport;
  import org.apache.http.HttpHost;
  import org.elasticsearch.client.RestClient;

  RestClient restClient = RestClient.builder(
      new HttpHost("localhost", 9200, "http")
  ).build();
  ElasticsearchTransport transport = new RestClientTransport(
      restClient, new JacksonJsonpMapper()
  );
  ElasticsearchClient client = new ElasticsearchClient(transport);
  ```

## 带认证连接

- **背景**：
  - ES 8.x 默认启用安全特性，需用户名和密码。
- **示例**：
  ```java
  import org.apache.http.auth.AuthScope;
  import org.apache.http.auth.UsernamePasswordCredentials;
  import org.apache.http.impl.client.BasicCredentialsProvider;

  BasicCredentialsProvider creds = new BasicCredentialsProvider();
  creds.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials("elastic", "你的密码"));
  RestClient restClient = RestClient.builder(
      new HttpHost("localhost", 9200, "http")
  ).setHttpClientConfigCallback(httpClientBuilder -> {
      return httpClientBuilder.setDefaultCredentialsProvider(creds);
  }).build();
  ElasticsearchTransport transport = new RestClientTransport(
      restClient, new JacksonJsonpMapper()
  );
  ElasticsearchClient client = new ElasticsearchClient(transport);
  ```
- **说明**：
  - 替换“你的密码”为 `elastic` 用户的实际密码（见[安装 Elasticsearch 与 Kibana](/article/elasticsearch-install)）。

## 注意事项

- **连接参数**：
  - `HttpHost`：指定 ES 的主机、端口和协议。
- **异常处理**：
  - 需捕获 `IOException`，如连接超时。

## 动手实践：连接 ES

### 目标

- 用 Java 连接本地 ES 并验证。

### 步骤

1. **创建客户端类**：
   - 新建 `ESClient.java`：
     ```java
     import co.elastic.clients.elasticsearch.ElasticsearchClient;
     import co.elastic.clients.json.jackson.JacksonJsonpMapper;
     import co.elastic.clients.transport.ElasticsearchTransport;
     import co.elastic.clients.transport.rest_client.RestClientTransport;
     import org.apache.http.HttpHost;
     import org.apache.http.auth.AuthScope;
     import org.apache.http.auth.UsernamePasswordCredentials;
     import org.apache.http.impl.client.BasicCredentialsProvider;
     import org.elasticsearch.client.RestClient;

     public class ESClient {
         public static ElasticsearchClient getClient() {
             BasicCredentialsProvider creds = new BasicCredentialsProvider();
             creds.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials("elastic", "你的密码"));
             RestClient restClient = RestClient.builder(
                 new HttpHost("localhost", 9200, "http")
             ).setHttpClientConfigCallback(httpClientBuilder ->
                 httpClientBuilder.setDefaultCredentialsProvider(creds)
             ).build();
             ElasticsearchTransport transport = new RestClientTransport(
                 restClient, new JacksonJsonpMapper()
             );
             return new ElasticsearchClient(transport);
         }
     }
     ```
   - 替换“你的密码”为实际值。
2. **测试连接**：
   - 新建 `Main.java`：
     ```java
     import co.elastic.clients.elasticsearch.ElasticsearchClient;
     import java.io.IOException;

     public class Main {
         public static void main(String[] args) throws IOException {
             ElasticsearchClient client = ESClient.getClient();
             String clusterName = client.info().clusterName();
             System.out.println("Connected to cluster: " + clusterName);
         }
     }
     ```
   - 运行，预期输出：`Connected to cluster: elasticsearch`。

### 注意事项

- 确保 ES 在 `localhost:9200` 运行。
- 检查密码是否正确。

## 关键点

- **客户端**：
  - `RestClient` -> `Transport` -> `ElasticsearchClient`。
- **认证**：
  - 需配置 `elastic` 用户密码。

## 常见问题及解决方法

1. **问题**：连接失败。
   - **原因**：ES 未运行或密码错误。
   - **解决**：
     - 验证 `localhost:9200` 可访问。
     - 检查密码。

## 学习建议

- **笔记记录**：
  - 画出客户端初始化流程图。

:::note
本文是《Elasticsearch 七日笔记》系列的第 14 篇，对应第 5 天的学习内容。本文创建的 `ESClient` 会被后续第 15～18 篇反复复用。
:::
