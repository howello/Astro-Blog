---
title: 外观模式｜设计模式笔记 13
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 结构型模式
  - 外观模式
id: design-pattern-facade
date: 2022-06-14 17:08:54
updated: 2026-07-29
---

> **外观模式（**Facade Pattern**）：**为子系统中的一组接口提供一个统一的入口。外观模式定义了一个高层接口，这个接口使得这一子系统更加容易使用。
>
> 外观模式中，一个子系统的外部与其内部的通信通过一个统一的外观类进行，外观类将客户类与子系统的内部复杂性分隔开，使得客户类只需要与外观角色打交道，而不需要与子系统内部的很多对象打交道。
>
>  外观模式又称为门面模式，它是一种对象结构型模式。
>
> 外观模式是迪米特法则的一种具体实现，通过引入一个新的外观角色可以降低原有系统的复杂度，同时降低客户类与子系统的耦合度。

![image-20220614165339630](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206141653713.png)

## 外观模式包含如下两个角色

  (1) **Facade（外观角色）**：在客户端可以调用它的方法，在外观角色中可以知道相关的（一个或者多个）子系统的功能和责任；在正常情况下，它将所有从客户端发来的请求委派到相应的子系统去，传递给相应的子系统对象处理。

  (2) **SubSystem（子系统角色）**：在软件系统中可以有一个或者多个子系统角色，每一个子系统可以不是一个单独的类，而是一个类的集合，它实现子系统的功能；每一个子系统都可以被客户端直接调用，或者被外观角色调用，它处理由外观类传过来的请求；子系统并不知道外观的存在，对于子系统而言，外观角色仅仅是另外一个客户端而已。

## 简单代码实现

> 张三怎么过一天进行举例子

```java
//子系统
public class Book {
    public void open(){
        System.out.println("把书翻开放桌子上");
    }
}
public class Computer {
    public void watch(){
        System.out.println("玩电脑11.9小时");
    }
}
public class Phone {
    public void play(){
        System.out.println("玩手机10小时");
    }
}

//外观角色
public class ZhangSanDeYiTianFacade {
    private Phone phone;
    private Book book;
    private Computer computer;

    public ZhangSanDeYiTianFacade() {
        phone = new Phone();
        book = new Book();
        computer = new Computer();
    }

    public void overThisDay(){
        book.open();
        phone.play();
        computer.watch();
    }
}
//测试
public static void main(String[] args) {
    ZhangSanDeYiTianFacade zhangSanDeYiTianFacade = new ZhangSanDeYiTianFacade();
    zhangSanDeYiTianFacade.overThisDay();
}
```

![image-20220614170259636](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206141702741.png)

## 加入抽象类

> 如果张三不想这么沉沦下去了。决定不玩手机不玩电脑，只看书。

```java
public interface YiTianDacade {
    public void overThisDay();
}

public class ZhangSanFightYiTian implements YiTianDacade {
    private Book book;

    public ZhangSanFightYiTian() {
        book = new Book();
    }

    @Override
    public void overThisDay() {
        book.open();
    }
}

public static void main(String[] args) {
    YiTianDacade zhangSanDeYiTianFacade = new ZhangSanDeYiTianFacade();
    zhangSanDeYiTianFacade.overThisDay();
    System.out.println("=============改变==================");
    YiTianDacade zhangSanFightYiTian = new ZhangSanFightYiTian();
    zhangSanFightYiTian.overThisDay();
}
```

![image-20220614170854514](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206141708695.png)

## 总结

1. 优点
   - 它对客户端屏蔽了子系统组件，减少了客户端所需处理的对象数目，并使得子系统使用起来更加容易。通过引入外观模式，客户端代码将变得很简单，与之关联的对象也很少。
   - 它实现了子系统与客户端之间的松耦合关系，这使得子系统的变化不会影响到调用它的客户端，只需要调整外观类即可。
   - 一个子系统的修改对其他子系统没有任何影响，而且子系统内部变化也不会影响到外观对象。
2. 缺点
   - 不能很好地限制客户端直接使用子系统类，如果对客户端访问子系统类做太多的限制则减少了可变性和灵活性。
   - 如果设计不当，增加新的子系统可能需要修改外观类的源代码，违背了开闭原则。
3. 适用场景
   - 当要为访问一系列复杂的子系统提供一个简单入口时可以使用外观模式。
   - 客户端程序与多个子系统之间存在很大的依赖性。引入外观类可以将子系统与客户端解耦，从而提高子系统的独立性和可移植性。
   - 在层次化结构中，可以使用外观模式定义系统中每一层的入口，层与层之间不直接产生联系，而通过外观类建立联系，降低层之间的耦合度。

:::note
本文是《设计模式》系列学习笔记的第 13 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
