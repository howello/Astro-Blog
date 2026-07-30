---
title: 工厂方法模式｜设计模式笔记 04
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 创建型模式
  - 工厂方法模式
id: design-pattern-factory-method
date: 2022-05-31 10:54:50
updated: 2026-07-29
---

> **工厂方法模式(Factory Method Pattern)**：定义一个用于创建对象的接口，让子类决定将哪一个类实例化。
>
> 工厂方法模式让一个类的实例化延迟到其子类。
>
> 工厂方法模式又简称为工厂模式(Factory Pattern)，又可称作虚拟构造器模式(Virtual Constructor Pattern)或多态工厂模式(Polymorphic Factory Pattern)。
>
> 工厂方法模式是一种类创建型模式。

## 在工厂方法模式结构图中包含如下几个角色

- **Product（抽象产品）**：它是定义产品的接口，是工厂方法模式所创建对象的超类型，也就是产品对象的公共父类。

- **ConcreteProduct（具体产品）**：它实现了抽象产品接口，某种类型的具体产品由专门的具体工厂创建，具体工厂和具体产品之间一一对应。

- **Factory（抽象工厂）**：在抽象工厂类中，声明了工厂方法(Factory Method)，用于返回一个产品。抽象工厂是工厂方法模式的核心，所有创建对象的工厂类都必须实现该接口。

- **ConcreteFactory（具体工厂）**：它是抽象工厂类的子类，实现了抽象工厂中定义的工厂方法，并可由客户端调用，返回一个具体产品类的实例。

与简单工厂模式相比，工厂方法模式最重要的区别是引入了抽象工厂角色，抽象工厂可以是接口，也可以是抽象类或者具体类，

## 代码实现

1. 产品类

   ```java
   //Product父类
   public abstract class Product {
       public void save() {
           System.out.println("抽象父类的保存方法");
       }
   
       public void delete() {
           System.out.println("抽象父类的删除方法");
       }
   
       public abstract void update();
   }
   
   //产品书实现
   public class BookProduct extends Product {
       @Override
       public void update() {
           System.out.println("书籍更新");
       }
   }
   
   //产品电脑实现
   public class ComputerProduct extends Product {
       @Override
       public void update() {
           System.out.println("电脑更新");
       }
   }
   ```

2. 工厂类

   ```java
   //工厂父接口
   public interface Factory {
       public Product createProduct();
   }
   
   //产品书的工厂实现
   public class BookFactory implements Factory {
       @Override
       public Product createProduct() {
           return new BookProduct();
       }
   }
   
   //产品电脑的工厂实现
   public class ComputerFactory implements Factory {
       @Override
       public Product createProduct() {
           return new ComputerProduct();
       }
   }
   ```

3. 测试类

   ```java
   public class Main {
       public static void main(String[] args) {
           Factory factory = new BookFactory();
           factory.createProduct().update();
   
           factory = new ComputerFactory();
           factory.createProduct().update();
       }
   }
   ```

4. 测试结果

![image-20220531105450751](https://img.wyantao.com/img/202205311054925.png)

## 总结

1. 完美解决了简单工厂模式需要传type来进行定位的不好之处。
2. 解决了简单工厂模式中，工厂需要大量条件语句的弊端。
3. 增加新产品时，只需要增加产品实现类，继承产品父类即可。然后增加产品工厂实现类，实现工厂接口即可。不需要进行代码的修改。
4. 自认为的缺点
   - 虽然解决了增加产品时的问题。但是加一个产品就得加一个工厂，这块是不是能更加优化一下。（或许时理解的不太全）

## 优化

1. 工厂重载

   可以在工厂中添加不同入参的方法来进一步进行工厂的多样话配置，比如某个工厂需要数据库连接，某个不需要，但需要线程池配置等。

   - 工厂可修改为这样

   ```java
   //工厂接口
   public interface Factory {
       public Product createProduct();
   
       public Product createProduct(String... args);
   
       public Product createProduct(ProductSettings settings);
   }
   
   //书籍实现工厂
   public class BookFactory implements Factory {
       @Override
       public Product createProduct() {
           return new BookProduct();
       }
   
       @Override
       public Product createProduct(String... args) {
           //此处可以根据args的值来配置不同的产品。比如数据库连接、线程池等。
           //代码省略
           return new BookProduct();
       }
   
       @Override
       public Product createProduct(ProductSettings settings) {
           //此处可以根据配置对象来配置不同的产品。比如数据库连接、线程池等。
           //代码省略
           return new BookProduct();
       }
   }
   
   //电脑实现工厂
   public class ComputerFactory implements Factory {
       @Override
       public Product createProduct() {
           return new ComputerProduct();
       }
   
       @Override
       public Product createProduct(String... args) {
           //此处可以根据args的值来配置不同的产品。比如数据库连接、线程池等。
           //代码省略
           return new ComputerProduct();
       }
   
       @Override
       public Product createProduct(ProductSettings settings) {
           //此处可以根据配置对象来配置不同的产品。比如数据库连接、线程池等。
           //代码省略
           return new ComputerProduct();
       }
   }
   ```

   在抽象工厂中定义多个重载的工厂方法，在具体工厂中实现了这些工厂方法，这些方法可以包含不同的业务逻辑，以满足对不同产品对象的需求。

   > 思考：这里可以在工厂接口类里面添加默认方法default（java8），子类也不一定需要实现，需要才实现。能更进一步根据多样性配置不用的工厂。

2. 工厂方法隐藏（隐藏产品应该更贴切）

可以在工厂里面直接调用产品的方法，这样用户就不用管产品类是什么情况，只需要实例化工厂，然后调用工厂方法就可以。

代码：

```java
//工厂接口
public interface Factory {
    public Product createProduct();

    public Product createProduct(String... args);

    public Product createProduct(ProductSettings settings);

    default void save() {
        Product product = this.createProduct();
        product.save();
    }
}

//测试类
public static void main(String[] args) {
    Factory factory = new BookFactory();
    factory.save();
}

//其他代码略
```

> 思考：进一步将用户调用简化了。使用默认方法，增加的时候也可以选择是否重写。

## 适用场景

 (1) 客户端不知道它所需要的对象的类。

在工厂方法模式中，客户端不需要知道具体产品类的类名，只需要知道所对应的工厂即可，具体的产品对象由具体工厂类创建，可将具体工厂类的类名存储在配置文件或数据库中。

(2) 抽象工厂类通过其子类来指定创建哪个对象。

在工厂方法模式中，对于抽象工厂类只需要提供一个创建产品的接口，而由其子类来确定具体要创建的对象，利用面向对象的多态性和里氏代换原则，在程序运行时，子类对象将覆盖父类对象，从而使得系统更容易扩展。

:::note
本文是《设计模式》系列学习笔记的第 4 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
