---
title: 单例模式｜设计模式笔记 06
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 创建型模式
  - 单例模式
id: design-pattern-singleton
date: 2022-06-01 14:37:44
updated: 2026-07-29
---

> **单例模式(Singleton Pattern)**：确保某一个类只有一个实例，而且自行实例化并向整个系统提供这个实例，这个类称为单例类，它提供全局访问的方法。单例模式是一种对象创建型模式。

## 单例模式三要素

- 只能有一个实例
- 必须自行创建这个实例
- 必须自行向整个系统提供这个实例

## 饿汉式单例类

饿汉式就是不管有没有，这个类在被加载的时候就会创建实例。用静态变量定义时就直接进行了类的实例化。然后构造方法定义为`private` 确保外部不能直接进行实例化。

```java
public class EagerSingleton {
    private static final EagerSingleton eagerSingleton = new EagerSingleton();

    private EagerSingleton() {
    }

    public static EagerSingleton getInstance(){
        return eagerSingleton;
    }

    public void doSomething(){
        System.out.println("do something");
    }
}
```

> 这是最简单的单例。但是由于时加载时就创建，消耗的资源比较多。

## 懒汉式单例类

懒汉式是为了解决饿汉的问题，在需要的时候再进行实例化。

```java
public class LazySingleton {
    private static LazySingleton lazySingleton;

    private LazySingleton() {

    }

    public static LazySingleton getInstance() {
        if (lazySingleton == null) {
            lazySingleton = new LazySingleton();
        }
        return lazySingleton;
    }

    public void doSomething() {
        System.out.println("do something");
    }
}
```

> 懒汉虽然解决了饿汉消耗资源的问题，但是并发情况下，我们就会发现当两个线程同时进来的时候，会创建多个单例，违反了唯一性。

## 单锁懒汉式单例类

为了解决并发情况不唯一的问题。给这个类加锁同步，确保唯一性。

```java
public class LazySingleton {
    private static LazySingleton lazySingleton;

    private LazySingleton() {

    }

    public static LazySingleton getInstance() {
        if (lazySingleton == null) {
            synchronized (LazySingleton.class){
                lazySingleton = new LazySingleton();
            }
        }
        return lazySingleton;
    }

    public void doSomething() {
        System.out.println("do something");
    }
}
```

> 虽然加锁同步了，但是还是会出现多个实例。
>
> 当线程A和B同时进入，都判断为null。这时A先进入同步块，B排队等候。A创建了一个实例Ai，出了同步块，然后B进入同步块，这时B不知道A已经创建了实例，B也是会创建一个实例Bi。
>
> 这时单例的唯一性被破坏。

## 双检锁单例模式

进一步确保唯一性，可以在同步块内部再判断一下是否为空。申明静态变量时再加上 `volatile` 进一步确保了唯一性。

> Java的volatile关键字能保证变量修改后，对各个线程是可见的。也就是说加了这个关键字，不管你是从哪个线程读取都是同样的。
>
> **什么时候多线程读取不一致？**
>
> 多个cpu多个线程时，每个线程都有可能拷贝这个变量到自己对应的cpu里面。这样就会出现一个线程改变了，另一个线程拷贝的是改变前的变量。导致了线程之间不同步。

```java
public class DCLSingleton {
    private static volatile DCLSingleton dclSingleton;

    private DCLSingleton(){

    }

    public static DCLSingleton getInstance(){
        if (dclSingleton == null) {
            synchronized (DCLSingleton.class){
                if (dclSingleton == null) {
                    dclSingleton = new DCLSingleton();
                }
            }
        }
        return dclSingleton;
    }

    public void doSomething(){
        System.out.println("do something");
    }
}
```

> 到了这里，双检锁基本上可以搞定99%的单例情况了。几乎是完美的单例了，但是还存在以下两点问题。
>
> - 但是由于使用了 `volatile` 关键字，屏蔽了Java虚拟机所做的一些代码优化，可能会导致系统运行效率降低。
> - 如果遇到反射调用的时候，因为反射可以调用内部 `private` 方法，所以能够直接创建实例，就不能保证唯一性了。

## 静态内部类单例模式（IoDH）

既然饿汉和懒汉都有缺点，那就自然有了客服这两个缺点的方法。在单例里面添加一个静态内部类。

```java
public class IoDHSingleton {
    private IoDHSingleton(){

    }
    private static class InnerClass{
        private static final IoDHSingleton IO_DH_SINGLETON = new IoDHSingleton();
    }

    public static IoDHSingleton getInstance(){
        return InnerClass.IO_DH_SINGLETON;
    }

    public void doSomething(){
        System.out.println("do something");
    }
}
```

通过使用**IoDH**，我们既可以实现延迟加载，又可以保证线程安全，不影响系统性能，不失为一种最好的**Java**语言单例模式实现方式

## 枚举实现单例模式

![image-20220601142746774](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206011427392.png)

大佬都这么说了。最完美好吧。无懈可击，起码我想不到什么能干掉这个。简单、搞笑、优美。

```java
public enum EnumSingleton {
    /**
     * 实例
     */
    INSTANCE;

    public void doSomething(){
        System.out.println("do something");
    }
}
```

这里我们再进行序列化测试和反射测试

```java
public static void main(String[] args) {
    EnumSingleton instance = EnumSingleton.INSTANCE;
    byte[] serialize = SerializationUtils.serialize(instance);
    Object deserialize = SerializationUtils.deserialize(serialize);
    System.out.println("instance = " + instance);
    System.out.println("deserialize = " + deserialize);
    System.out.println(instance == deserialize);

    Constructor<EnumSingleton> constructor = EnumSingleton.class.getDeclaredConstructor();
    constructor.setAccessible(true);
    EnumSingleton reInstance = constructor.newInstance();
    System.out.println("instance = " + instance);
    System.out.println("reInstance = " + reInstance);
    System.out.println(instance == reInstance);
}
```

![image-20220601143744952](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206011437040.png)

结果显而易见，序列化通过，反射直接报错。

> 这里反射报错，看源码可以知道是源码做了限制，如果反射的是`Enum`的话，会直接抛异常。具体可以看一下大佬的讲解。
>
> https://cloud.tencent.com/developer/article/1497592

## 总结

有个缺点：单例没有抽象层，拓展成问题。

- 一般情况下，不建议使用懒汉式，使用线程安全的饿汉式。
- 如果需要懒加载的话，使用IoDH方式。
- 如果有特殊需求，可以考虑使用双检索
- 当然，任何情况都推件使用枚举方式。有下面这三个优点，还要什么自行车。
  - 反射安全
  - 序列化/反序列化安全
  - **写法简单**

:::note
本文是《设计模式》系列学习笔记的第 6 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
