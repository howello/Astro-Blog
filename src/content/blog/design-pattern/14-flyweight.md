---
title: 享元模式｜设计模式笔记 14
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 结构型模式
  - 享元模式
id: design-pattern-flyweight
date: 2022-06-15 15:44:03
updated: 2026-07-29
---

> **享元模式(Flyweight Pattern)**：运用共享技术有效地支持大量细粒度对象的复用。系统只使用少量的对象，而这些对象都很相似，状态变化很小，可以实现对象的多次复用。由于享元模式要求能够共享的对象必须是细粒度对象，因此它又称为轻量级模式，它是一种对象结构型模式。

## 相关概念

1. 享元池(Flyweight Pool)

   享元模式通过共享技术实现相同或相似对象的重用，**在逻辑上每一个出现的字符都有一个对象与之对应，然而在物理上它们却共享同一个享元对象**，这个对象可以出现在一个字符串的不同地方，相同的字符对象都指向同一个实例，在享元模式中，存储这些共享实例对象的地方称为**享元池**

2. 享元的内部状态

   **内部状态是存储在享元对象内部并且不会随环境改变而改变的状态，内部状态可以共享**。

   如字符的内容，不会随外部环境的变化而变化，无论在任何环境下字符“a”始终是“a”，都不会变成“b”。

3. 享元的外部状态

   外部状态是随环境改变而改变的、不可以共享的状态。

   享元对象的外部状态通常由客户端保存，并在享元对象被创建之后，需要使用的时候再传入到享元对象内部。一个外部状态与另一个外部状态之间是相互独立的。

   如字符的颜色，可以在不同的地方有不同的颜色，例如有的“a”是红色的，有的“a”是绿色的，字符的大小也是如此，有的“a”是五号字，有的“a”是四号字。而且字符的颜色和大小是两个独立的外部状态，它们可以独立变化，相互之间没有影响，客户端可以在使用时将外部状态注入享元对象中。

## 享元模式结构图中包含如下几个角色

  ● **Flyweight（抽象享元类）**：通常是一个接口或抽象类，在抽象享元类中声明了具体享元类公共的方法，这些方法可以向外界提供享元对象的内部数据（内部状态），同时也可以通过这些方法来设置外部数据（外部状态）。

  ● **ConcreteFlyweight（具体享元类）**：它实现了抽象享元类，其实例称为享元对象；在具体享元类中为内部状态提供了存储空间。通常我们可以结合单例模式来设计具体享元类，为每一个具体享元类提供唯一的享元对象。

  ● **UnsharedConcreteFlyweight（非共享具体享元类）**：并不是所有的抽象享元类的子类都需要被共享，不能被共享的子类可设计为非共享具体享元类；当需要一个非共享具体享元类的对象时可以直接通过实例化创建。

  ● **FlyweightFactory（享元工厂类）**：享元工厂类用于创建并管理享元对象，它针对抽象享元类编程，将各种类型的具体享元对象存储在一个享元池中，享元池一般设计为一个存储“键值对”的集合（也可以是其他类型的集合），可以结合工厂模式进行设计；当用户请求一个具体享元对象时，享元工厂提供一个存储在享元池中已创建的实例或者创建一个新的实例（如果不存在的话），返回新创建的实例并将其存储在享元池中。

## 简单实现

图书馆里面只有三本书，语数外，不管谁借借到的都会是同一本书。

```java
public abstract class Book {
    public abstract String getBook();

    public void read(){
        System.out.println("读书,读的什么书？" + this.getBook());
    }
}

public class ChineseBook extends Book {
    @Override
    public String getBook() {
        return "中文书";
    }
}

public class MathBook extends Book {
    @Override
    public String getBook() {
        return "数学书";
    }
}

public class EnglishBook extends Book {
    @Override
    public String getBook() {
        return "英语书";
    }
}
```

享元池实现，用单例构造，用HashTable进行存储。

```java
public enum LibraryFactory {
    /**
     * 实例
     */
    INSTANCE;

    private final static Hashtable<String, Book> BOOK_TABLE = new Hashtable<>();

    public Book borrowBook(String bookType) {
        if (BOOK_TABLE.containsKey(bookType)) {
            return BOOK_TABLE.get(bookType);
        } else {
            Book b;
            switch (bookType) {
                case "e":
                    b = new EnglishBook();
                    break;
                case "m":
                    b = new MathBook();
                    break;
                case "c":
                    b = new ChineseBook();
                    break;
                default:
                    b = null;
                    break;
            }
            if (b != null) {
                BOOK_TABLE.put(bookType, b);
            }
            return b;
        }
    }
}
```

测试

```java
public static void main(String[] args) {
    Book english1, english2, english3, math1, math2, chinese1, chinese2;
    english1 = LibraryFactory.INSTANCE.borrowBook("e");
    english2 = LibraryFactory.INSTANCE.borrowBook("e");
    english3 = LibraryFactory.INSTANCE.borrowBook("e");
    math1 = LibraryFactory.INSTANCE.borrowBook("m");
    math2 = LibraryFactory.INSTANCE.borrowBook("m");
    chinese1 = LibraryFactory.INSTANCE.borrowBook("c");
    chinese2 = LibraryFactory.INSTANCE.borrowBook("c");
    System.out.println("判断借出的书是不是同一本书：" + (english1 == english2));
    System.out.println("判断借出的书是不是同一本书：" + (math1 == math2));
    System.out.println("判断借出的书是不是同一本书：" + (chinese1 == chinese2));
    english1.read();
    english2.read();
    english3.read();
    math1.read();
    math2.read();
    chinese1.read();
    chinese2.read();
}
```

![image-20220615153127686](https://img.wyantao.com/img/202206151531900.png)

## 带外部状态的解决方案

添加一个条件类

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConditionIndex {
    private Integer page;
    private Integer row;
    private Integer col;
}
```

Book抽象类改为

```java
public abstract class Book {
    public abstract String getBook();

    public void read(ConditionIndex index) {
        System.out.println("读书,读的什么书？" + this.getBook() + "。读的第" + index.getPage() + "页" + "，第" + index.getRow() + "行" + "，第" + index.getCol() + "列");
    }
}
```

测试

```java
public static void main(String[] args) {
    Book english1, english2, english3, math1, math2, chinese1, chinese2;
    english1 = LibraryFactory.INSTANCE.borrowBook("e");
    english2 = LibraryFactory.INSTANCE.borrowBook("e");
    english3 = LibraryFactory.INSTANCE.borrowBook("e");
    math1 = LibraryFactory.INSTANCE.borrowBook("m");
    math2 = LibraryFactory.INSTANCE.borrowBook("m");
    chinese1 = LibraryFactory.INSTANCE.borrowBook("c");
    chinese2 = LibraryFactory.INSTANCE.borrowBook("c");
    System.out.println("判断借出的书是不是同一本书：" + (english1 == english2));
    System.out.println("判断借出的书是不是同一本书：" + (math1 == math2));
    System.out.println("判断借出的书是不是同一本书：" + (chinese1 == chinese2));
    english1.read(new ConditionIndex(1,1,1));
    english2.read(new ConditionIndex(2, 3, 4));
    english3.read(new ConditionIndex(5, 6, 7));
    math1.read(new ConditionIndex(4, 6, 8));
    math2.read(new ConditionIndex(2, 3, 7));
    chinese1.read(new ConditionIndex(5, 2, 1));
    chinese2.read(new ConditionIndex(9, 32, 45));
}
```

![image-20220615154043570](https://img.wyantao.com/img/202206151544594.png)

## 单纯享元模式和复合享元模式

1. 单纯享元模式

   > 在单纯享元模式中，所有的具体享元类都是可以共享的，不存在非共享具体享元类。

2. 复合享元模式

   > 将一些单纯享元对象使用组合模式加以组合，还可以形成复合享元对象，这样的复合享元对象本身不能共享，但是它们可以分解成单纯享元对象，而后者则可以共享。

通过复合享元模式，可以确保复合享元类CompositeConcreteFlyweight中所包含的每个单纯享元类ConcreteFlyweight都具有相同的外部状态，而这些单纯享元的内部状态往往可以不同。如果希望为多个内部状态不同的享元对象设置相同的外部状态，可以考虑使用复合享元模式。

## 总结

1. 优点

   ​    (1) 可以极大减少内存中对象的数量，使得相同或相似对象在内存中只保存一份，从而可以节约系统资源，提高系统性能。

   ​    (2) 享元模式的外部状态相对独立，而且不会影响其内部状态，从而使得享元对象可以在不同的环境中被共享。

2. 缺点

   ​    (1) 享元模式使得系统变得复杂，需要分离出内部状态和外部状态，这使得程序的逻辑复杂化。

   ​    (2) 为了使对象可以共享，享元模式需要将享元对象的部分状态外部化，而读取外部状态将使得运行时间变长。

3. 适用场景

      (1) 一个系统有大量相同或者相似的对象，造成内存的大量耗费。

      (2) 对象的大部分状态都可以外部化，可以将这些外部状态传入对象中。

      (3) 在使用享元模式时需要维护一个存储享元对象的享元池，而这需要耗费一定的系统资源，因此，应当在需要多次重复使用享元对象时才值得使用享元模式。

:::note
本文是《设计模式》系列学习笔记的第 14 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
