---
title: 桥接模式｜设计模式笔记 10
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 结构型模式
  - 桥接模式
id: design-pattern-bridge
date: 2022-06-07 11:33:52
updated: 2026-07-29
---

> **桥接模式(Bridge Pattern)**：将抽象部分与它的实现部分分离，使它们都可以独立地变化。
>
> 它是一种对象结构型模式，又称为柄体**(`Handle and Body`)**模式或接口**(`Interface`)**模式。

## 桥接模式结构图中包含如下几个角色

- **Abstraction（抽象类）**：用于定义抽象类的接口，它一般是抽象类而不是接口，其中定义了一个Implementor（实现类接口）类型的对象并可以维护该对象，它与Implementor之间具有关联关系，它既可以包含抽象业务方法，也可以包含具体业务方法。
- **RefinedAbstraction（扩充抽象类）**：扩充由Abstraction定义的接口，通常情况下它不再是抽象类而是具体类，它实现了在Abstraction中声明的抽象业务方法，在RefinedAbstraction中可以调用在Implementor中定义的业务方法。
- **Implementor（实现类接口）**：定义实现类的接口，这个接口不一定要与Abstraction的接口完全一致，事实上这两个接口可以完全不同，一般而言，Implementor接口仅提供基本操作，而Abstraction定义的接口可能会做更多更复杂的操作。Implementor接口对这些基本操作进行了声明，而具体实现交给其子类。通过关联关系，在Abstraction中不仅拥有自己的方法，还可以调用到Implementor中定义的方法，使用关联关系来替代继承关系。
- **ConcreteImplementor（具体实现类）**：具体实现Implementor接口，在不同的ConcreteImplementor中提供基本操作的不同实现，在程序运行时，ConcreteImplementor对象将替换其父类对象，提供给抽象类具体的业务操作方法。

## 概念理解

好jb抽象

![Factory](https://img.wyantao.com/img/202206071115409.png)

> 需求：需要制造电脑，根据用户输入，制造出对应的笔记本电脑、平板电脑、台式机以及对应厂家生产的这几种电脑。

1. 需求分析

电脑 -> 电脑类别 -> 电脑厂商对应的电脑类别

这三个是依次继承的关系，如果直接写，那么对应的类写的就会很多。定义一个电脑类，下面继承三个子类，三个子类分别各自继承四个子类。这样下来就会有16个类。而且，如果再添加一个电脑类别或者厂商的话，就会增加的比较多，而且还需要改现有代码。

2. 痛点解决

   先看类图，然后掌握整个架构。咱们逐步分析。

   2.1 先将厂家单独拎出来

   ​	定义一个厂家的接口，不管他制造那个种类，先给他个制造的方法。让他的子类实现这个制造方法，自定义各自的制造方法。

   2.2 然后将种类也单独拎出来

   ​	定义一个抽象类，先在种类里面加一个设置厂家的方法。这一步很关键，将厂家和种类关联起来了。

   ​	然后让种类的子类去继承这个抽象类。然后覆写父类里面的方法实现需求。

   ​	当然调用厂家里面的相关方法就可以在这里调用了，因为前面已经设置过厂家了。

   2.3 使用

   ​	使用的时候就很方便了。用户根据自己的需求，先定义一个厂家，然后定义一个种类，把定义好的厂家设置到种类里面。然后调用种类里面的相关方法就能够完成需求。

   ​	这样的话，无论是新添加一个种类还是新添加一个厂家就直接实现父类就可以。无需修改现有代码。

## 代码

1. 工厂接口

```java
public interface Factory {
    public void manufacture();
}
```

2. 工厂实现

```java
public class AppleFactory implements Factory {
    @Override
    public void manufacture() {
        System.out.print("AppleFactory制造，");
    }
}

public class DellFactory implements Factory {
    @Override
    public void manufacture() {
        System.out.print("DellFactory制造，");
    }
}

public class LenovoFactory implements Factory {
    @Override
    public void manufacture() {
        System.out.print("LenovoFactory制造，");
    }
}

public class MiFactory implements Factory {
    @Override
    public void manufacture() {
        System.out.print("MiFactory制造，");
    }
}
```

3. 种类抽象类

```java
public abstract class Computer {
    protected Factory factory;

    public Computer setFactory(Factory factory) {
        this.factory = factory;
        return this;
    }

    public void classification(String name) {
        this.factory.manufacture();
    }
}
```

4. 种类子类

```java
public class desktopComputer extends Computer {
    @Override
    public void classification(String name) {
        super.classification(name);
        System.out.println("desktopComputer,名字为：" + name);
    }
}

public class laptopComputer extends Computer {
    @Override
    public void classification(String name) {
        super.classification(name);
        System.out.println("laptopComputer,名字为：" + name);
    }
}

public class tabletComputer extends Computer {
    @Override
    public void classification(String name) {
        super.classification(name);
        System.out.println("tabletComputer,名字为：" + name);
    }
}
```

5. 测试

```java
public static void main(String[] args) {
    Computer computer = new laptopComputer();
    Factory factory = new MiFactory();
    computer.setFactory(factory).classification("i7");
    computer = new tabletComputer();
    factory = new DellFactory();
    computer.setFactory(factory).classification("i5");
    computer = new desktopComputer();
    factory = new LenovoFactory();
    computer.setFactory(factory).classification("i3");
    factory = new AppleFactory();
    computer.setFactory(factory).classification("i9");
}
```

![image-20220607113352925](https://img.wyantao.com/img/202206071133035.png)

## 总结

1. 优点

- 分离抽象接口及其实现部分。桥接模式使用“对象间的关联关系”解耦了抽象和实现之间固有的绑定关系，使得抽象和实现可以沿着各自的维度来变化。所谓抽象和实现沿着各自维度的变化，也就是说抽象和实现不再在同一个继承层次结构中，而是“子类化”它们，使它们各自都具有自己的子类，以便任何组合子类，从而获得多维度组合对象。
- 在很多情况下，桥接模式可以取代多层继承方案，多层继承方案违背了“单一职责原则”，复用性较差，且类的个数非常多，桥接模式是比多层继承方案更好的解决方法，它极大减少了子类的个数。
- 桥接模式提高了系统的可扩展性，在两个变化维度中任意扩展一个维度，都不需要修改原有系统，符合“开闭原则”。

2. 缺点

- 桥接模式的使用会增加系统的理解与设计难度，由于关联关系建立在抽象层，要求开发者一开始就针对抽象层进行设计与编程。
- 桥接模式要求正确识别出系统中两个独立变化的维度，因此其使用范围具有一定的局限性，如何正确识别两个独立维度也需要一定的经验积累。

3. 适用场景

- 如果一个系统需要在抽象化和具体化之间增加更多的灵活性，避免在两个层次之间建立静态的继承关系，通过桥接模式可以使它们在抽象层建立一个关联关系。
- “抽象部分”和“实现部分”可以以继承的方式独立扩展而互不影响，在程序运行时可以动态将一个抽象化子类的对象和一个实现化子类的对象进行组合，即系统需要对抽象化角色和实现化角色进行动态耦合。
- 一个类存在两个（或多个）独立变化的维度，且这两个（或多个）维度都需要独立进行扩展。
- 对于那些不希望使用继承或因为多层继承导致系统类的个数急剧增加的系统，桥接模式尤为适用。

:::note
本文是《设计模式》系列学习笔记的第 10 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
