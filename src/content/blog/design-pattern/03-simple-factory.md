---
title: 简单工厂模式｜设计模式笔记 03
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 创建型模式
  - 简单工厂模式
id: design-pattern-simple-factory
date: 2022-05-31 10:53:58
updated: 2026-07-29
---

>   简单工厂模式(Simple Factory Pattern)：定义一个工厂类，它可以根据参数的不同返回不同类的实例，被创建的实例通常都具有共同的父类。因为在简单工厂模式中用于创建实例的方法是静态(static)方法，因此简单工厂模式又被称为**静态工厂方法**(Static Factory Method)模式，它属于类创建型模式。

## 在简单工厂模式结构图中包含如下几个角色

- **Factor（工厂角色）：**工厂角色即工厂类，它是简单工厂模式的核心，负责实现创建所有产品实例的内部逻辑；工厂类可以被外界直接调用，创建所需的产品对象；在工厂类中提供了静态的工厂方法factoryMethod()，它的返回类型为抽象产品类型Product。
- **Product（抽象产品角色）：**它是工厂类所创建的所有对象的父类，封装了各种产品对象的公有方法，它的引入将提高系统的灵活性，使得在工厂类中只需定义一个通用的工厂方法，因为所有创建的具体产品对象都是其子类对象。
- **ConcreteProduct（具体产品角色）：**它是简单工厂模式的创建目标，所有被创建的对象都充当这个角色的某个具体类的实例。每一个具体产品角色都继承了抽象产品角色，需要实现在抽象产品中声明的抽象方法。

在简单工厂模式中，客户端通过工厂类来创建一个产品类的实例，而无须直接使用new关键字来创建对象，它是工厂模式家族中最简单的一员。

## 代码实现

1. 抽象类 **Product**

```java
public abstract class Product {

    public void save(){
        System.out.println("抽象父类的保存方法");
    }

    public void delete(){
        System.out.println("抽象父类的删除方法");
    }

    public abstract void update();
}
```

2. 抽象类子类 **Book**

```java
public class Book extends Product {

    @Override
    public void save() {
        super.save();
        System.out.println("书籍的保存方法");
    }

    @Override
    public void update() {
        System.out.println("书籍的更新方法");
    }
}
```

3. 抽象类子类 **computer**

```java
public class Computer extends Product {
    @Override
    public void update() {
        System.out.println("电脑的更新方法");
    }

    @Override
    public void delete() {
        super.delete();
        System.out.println("电脑的删除方法");
    }
}
```

4. 工厂类 **Factory**

```java
public class Factory {

    public static Product getProduct(String type) {
        switch (type) {
            case "book":
                return new Book();
            case "computer":
                return new Computer();
            default:
                return null;
        }
    }
}
```

5. 测试代码

```java
public static void main(String[] args) {
    Product book = Factory.getProduct("computer");
    book.save();
    book.delete();
    book.update();
}
```

6. 测试结果

![image-20220531105358764](https://img.wyantao.com/img/202205311053908.png)

## 总结

1. 就是简单的使用工厂的静态方法创建实现类。减少了耦合，如果需要增加或者减少产品类型的话，只需要动工厂类，实际的产品不需要修改。

2. 算是解决了一下痛点。比如不用每次都自己new，拓展代码的时候需要一个一个改。

3. 自认为的缺点，估计后续的设计模式会改变这几个：
   - 创建方法时还需要传这个参数，传的type是字符串，写代码时不是很友好
   - 工厂静态类创建实现类的时候，用了大量的条件选择（if...else或者switch...case），就不是很完美。

4. 适用场景
   - 工厂类负责创建的对象比较少，由于创建的对象较少，不会造成工厂方法中的业务逻辑太过复杂。
   - 客户端只知道传入工厂类的参数，对于如何创建对象并不关心。

:::note
本文是《设计模式》系列学习笔记的第 3 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
