---
title: Spring Framework 核心知识｜java知识点
categories: java知识点
tags:
  - java知识点
  - Java
  - Spring
  - IoC
  - AOP
id: interview-notes-spring-framework
date: 2026-03-24 16:11:59
---

## Bean 创建生命周期

Spring 容器启动后，Bean 的完整创建流程如下：

1. **扫描与解析**：Spring 扫描配置注解（如 `@Component`、`@Service`）和 XML 配置，将每个 Bean 解析为 `BeanDefinition` 对象，记录 Bean 的类信息、作用域、依赖等元数据。
2. **实例化**：通过反射机制根据 `BeanDefinition` 创建 Bean 的原始实例（此时属性还是默认值）。
3. **属性填充（依赖注入）**：根据 `@Autowired`、`@Resource` 等注解，将 Bean 所需的依赖注入到实例中。
4. **初始化**：调用 `@PostConstruct` 标注的方法或实现 `InitializingBean` 接口的 `afterPropertiesSet()` 方法。
5. **AOP 代理植入**：在初始化前后，Spring 会执行 `BeanPostProcessor` 的前置和后置处理。AOP 代理就是在这个阶段生成的——如果 Bean 匹配了切面规则，Spring 会用 JDK 动态代理或 CGLIB 生成代理对象替代原始实例。
6. **放入一级缓存**：Bean 创建完成后放入一级缓存（singletonObjects），此时可以被其他 Bean 正常引用和使用。

## 三级缓存与循环依赖

Spring 通过三级缓存解决 Setter / `@Autowired` 注入的循环依赖问题：

| 缓存 | 存储内容 | 作用 |
|------|---------|------|
| 一级缓存（singletonObjects） | 完全创建好的单例 Bean | 最终态，可直接使用 |
| 二级缓存（earlySingletonObjects） | 已实例化但未完成属性注入的 Bean | 提前暴露，解决循环依赖 |
| 三级缓存（singletonFactories） | BeanFactory（ObjectFactory） | 生成 Bean 的早期引用（含 AOP 代理） |

工作原理：当 Bean A 依赖 Bean B，而 Bean B 又依赖 Bean A 时，A 实例化后将其工厂放入三级缓存。B 在注入依赖时通过三级缓存获取 A 的早期引用，完成自身创建。A 随后也能获取到完整的 B。

**为什么构造器注入不能解决循环依赖？** 构造器注入在实例化阶段就需要依赖对象，而三级缓存中的早期引用是在实例化之后才生成的。也就是说，构造器注入时 Bean 还没有被实例化，三级缓存中找不到对应条目，所以无法解决。Setter / `@Autowired` 注入发生在属性填充阶段，此时 Bean 已经实例化并放入了三级缓存，可以正常获取早期引用。

## AOP 与事务管理

### AOP 实现原理

Spring AOP 基于动态代理实现：

- **JDK 动态代理**：只能代理**接口**。通过 `Proxy.newProxyInstance()` 创建代理对象，拦截接口方法的调用。由于接口方法天生就是 `public` 的，所以 JDK 代理默认只能拦截 `public` 方法。
- **CGLIB 代理**：可以代理**普通类和方法**。通过继承目标类并重写方法来实现拦截。`private` 和 `final` 方法无法被重写，因此也无法被代理。

Spring 默认策略：如果目标对象实现了接口，优先使用 JDK 动态代理；否则使用 CGLIB。Spring Boot 2.x 之后默认使用 CGLIB。

### 事务管理原理

Spring 事务管理封装在 AOP 切面中：

1. 通过 `@EnableTransactionManagement` 开启事务管理，Spring 为带有 `@Transactional` 注解的 Bean 生成代理对象。
2. 代理对象在方法执行前开启事务（`@Before` 通知），方法正常执行后提交事务（`@AfterReturning` 通知），方法抛出异常时回滚事务（`@AfterThrowing` 通知）。
3. Spring 使用 `ThreadLocal` 来管理事务连接，保证同一线程中获取到的是同一个数据库连接，从而保证事务上下文一致。

### 事务不生效的常见场景

- **内部方法调用**：同一个类中，方法 A 调用方法 B（B 上有 `@Transactional`），不经过代理，事务不生效。
- **private 方法**：private 方法无法被代理重写。
- **异常被吞掉**：方法内部 `try-catch` 捕获了异常但没有重新抛出，事务管理器感知不到异常。
- **非 RuntimeException / Error**：默认只对 `RuntimeException` 和 `Error` 回滚。如果抛出的是受检异常（如 `IOException`），需要通过 `@Transactional(rollbackFor = Exception.class)` 指定回滚异常类型。

### 事务传播行为

- **REQUIRED（默认）**：如果当前存在事务则加入，否则创建新事务。子事务和父事务共享同一个事务，任何一个异常都会导致整体回滚。
- **REQUIRES_NEW**：总是创建一个新事务。如果当前存在事务，将当前事务挂起。子事务独立提交或回滚，不影响外层事务。

其他传播行为：`SUPPORTS`、`NOT_SUPPORTED`、`MANDATORY`、`NEVER`、`NESTED`，使用频率较低。

## Spring 设计模式

Spring 框架中运用了多种经典设计模式：

- **工厂模式**：`BeanFactory` 和 `ApplicationContext` 通过工厂模式创建和管理 Bean。
- **代理模式**：AOP 通过 JDK 动态代理或 CGLIB 实现代理。
- **单例模式**：Bean 默认作用域为 Singleton，容器中只存在一个实例。
- **模板模式**：`JdbcTemplate`、`RestTemplate`、`RedisTemplate` 等封装了操作模板。
- **适配器模式**：`DispatcherServlet` 中的 `HandlerAdapter` 将不同类型的处理器适配为统一的调用方式。AOP 中的 `AdvisorAdapter` 将不同类型的 Advice 适配为 `MethodInterceptor`。

## 统一异常处理

使用 `@ControllerAdvice` + `@ExceptionHandler` 实现全局异常处理：

- `@ControllerAdvice` 标注在类上，声明该类为全局异常处理类。
- `@ExceptionHandler` 标注在方法上，指定该方法处理的异常类型。

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public AjaxResult handleRuntimeException(RuntimeException e) {
        return AjaxResult.error(e.getMessage());
    }
}
```

## Spring Boot 自动配置

Spring Boot 自动配置的核心流程：

1. `@SpringBootApplication` 包含 `@EnableAutoConfiguration` 注解，这是自动配置的开关。
2. 启动时，Spring Boot 扫描所有引入 jar 包中 `META-INF/spring.factories`（Spring Boot 3.x 改为 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`）文件里注册的配置类。
3. 加载配置类时，会根据类上的 `@Conditional` 系列注解（如 `@ConditionalOnClass`、`@ConditionalOnProperty`、`@ConditionalOnMissingBean`）进行条件判断。条件满足则加载，不满足则跳过。

**Starter 的作用**：将某个功能所需的所有依赖和自动配置打包在一起。开发者只需引入一个 Starter 依赖，Spring Boot 就会根据条件自动配置好相关组件。遵循"约定大于配置"的原则，大幅简化开发。

:::note
本文内容整理自 Spring Framework 学习笔记，涵盖 Bean 生命周期、三级缓存、AOP、事务、设计模式和自动配置等核心知识点。
:::
