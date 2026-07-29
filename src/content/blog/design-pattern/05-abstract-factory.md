---
title: 抽象工厂模式｜设计模式笔记 05
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 创建型模式
  - 抽象工厂模式
id: design-pattern-abstract-factory
date: 2022-05-31 16:08:28
updated: 2026-07-29
---

>   **抽象工厂模式(Abstract Factory Pattern)**：提供一个创建一系列相关或相互依赖对象的接口，而无须指定它们具体的类。抽象工厂模式又称为**Kit**模式，它是一种对象创建型模式。

## 在抽象工厂模式结构图中包含如下几个角色

- **AbstractFactory（抽象工厂）**：它声明了一组用于创建一族产品的方法，每一个方法对应一种产品。

- **ConcreteFactory（具体工厂）**：它实现了在抽象工厂中声明的创建产品的方法，生成一组具体产品，这些产品构成了一个产品族，每一个产品都位于某个产品等级结构中。

- **AbstractProduct（抽象产品）**：它为每种产品声明接口，在抽象产品中声明了产品所具有的业务方法。

- **ConcreteProduct（具体产品）**：它定义具体工厂生产的具体产品对象，实现抽象产品接口中声明的业务方法。

## 代码实现

> 结合现实生活其实很好理解。比如说现在造东西的有很多厂，比如苹果、联想、dell。每个厂他不光造一样的东西。
>
> 这里我们把他们造的一样的东西拿出来几样做例子。比如，都会造书、造电脑。

### 实现抽象工厂

1. 首先，这里我们的产品就是两样：书、电脑。那么就可以先建一个接口`Book`及`Computer`

```java
//书
public interface Book {
    public void save();
}

//电脑
public interface Computer {
    public void update();
}
```

2. 然后，这两样东西的实现，是谁造出来的呢？三个厂家造的，分别进行实现

```java
//苹果造书
public class AppleBook implements Book {
    @Override
    public void save() {
        System.out.println("AppleBook save");
    }
}

//苹果造电脑
public class AppleComputer implements Computer {

    @Override
    public void update() {
        System.out.println("AppleComputer update");
    }
}

//dell造书
public class DellBook implements Book {
    @Override
    public void save() {
        System.out.println("DellBook save");
    }
}

//dell造电脑
public class DellComputer implements Computer {
    @Override
    public void update() {
        System.out.println("DellComputer update");
    }
}

//联想造书
public class LenovoBook implements Book {
    @Override
    public void save() {
        System.out.println("LenovoBook save");
    }
}

//联想造电脑
public class LenovoComputer implements Computer {
    @Override
    public void update() {
        System.out.println("LenovoComputer update");
    }
}
```

3. 到了这里，我们想。如果需要去调用的话，造一个东西只能实例一个，显然不太好。带入工厂思想。每个厂家创建一个工厂。

   然后这些工厂又有着相同的产品，分别为造书、造电脑。那就能提取为一个接口

   每个不同的厂家去实现不同的产品线

```java
//抽象工厂，不管怎么造的。只知道造这两样东西
public interface AbsFactory {

    public Book createBook();

    public Computer createComputer();
}

//苹果厂
public class AppleFactory implements AbsFactory {
    @Override
    public Book createBook() {
        return new AppleBook();
    }

    @Override
    public Computer createComputer() {
        return new AppleComputer();
    }
}

//Dell厂
public class DellFactory implements AbsFactory{
    @Override
    public Book createBook() {
        return new DellBook();
    }

    @Override
    public Computer createComputer() {
        return new DellComputer();
    }
}

//联想厂
public class LenovoFactory implements AbsFactory{
    @Override
    public Book createBook() {
        return new LenovoBook();
    }

    @Override
    public Computer createComputer() {
        return new LenovoComputer();
    }
}
```

4. 测试

```java
public static void main(String[] args) {
    AbsFactory factory = new DellFactory();
    factory.createComputer().update();
    factory.createBook().save();

    factory = new AppleFactory();
    factory.createBook().save();
    factory.createComputer().update();

    factory = new LenovoFactory();
    factory.createComputer().update();
    factory.createBook().save();
}
```

![image-20220531155559461](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202205311555599.png)

### 添加一个工厂

这时候小米公司说，我也要造这些东西。把我也加进去。

1. 首先我们添加小米的工厂

```java
public class MiFactory implements AbsFactory{
    @Override
    public Book createBook() {
        return new MiBook();
    }

    @Override
    public Computer createComputer() {
        return new MiComputer();
    }
}
```

2. 我们添加小米的产品线

```java
//小米造书
public class MiBook implements Book {
    @Override
    public void save() {
        System.out.println("MiBook save");
    }
}

//小米造电脑
public class MiComputer implements Computer {
    @Override
    public void update() {
        System.out.println("MiComputer update");
    }
}
```

3. 测试

```java
public static void main(String[] args) {
    AbsFactory factory = new MiFactory();
    factory.createBook().save();
    factory.createComputer().update();
}
```

![image-20220531160042668](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202205311600780.png)

4. 小结

我们发现，添加一个工厂是真的简单，只需要实现产品线，实现工厂类就可以了。完全不会动原有的代码。符合**开闭原则**

### 添加一个产品

新能源车活了。所有厂家赶紧入行开始造车，需要添加产品线，造车。

1. 添加车的产品

```java
public interface Car {
    public void drive();
}
```

2. 四个厂分别实现造车流水线

```java
public class AppleCar implements Car {
    @Override
    public void drive() {
        System.out.println("AppleCar drive");
    }
}

//dell
public class DellCar implements Car {
    @Override
    public void drive() {
        System.out.println("DellCar drive");
    }
}

public class LenovoCar implements Car {
    @Override
    public void drive() {
        System.out.println("LenovoCar drive");
    }
}

public class MiCar implements Car {

    @Override
    public void drive() {
        System.out.println("MiCar drive");
    }
}
```

3. 修改抽象工厂，添加造车流水线。每个厂分别实现

```java
public interface AbsFactory {
    
	...
    
    public Car createCar();
}

public class AppleFactory implements AbsFactory {
    ...

    @Override
    public Car createCar() {
        return new AppleCar();
    }
}

public class DellFactory implements AbsFactory{
    ...

    @Override
    public Car createCar() {
        return new DellCar();
    }
}

public class LenovoFactory implements AbsFactory{
    ...

    @Override
    public Car createCar() {
        return new LenovoCar();
    }
}

public class MiFactory implements AbsFactory{
    ...

    @Override
    public Car createCar() {
        return new MiCar();
    }
}
```

4. 测试

```java
public static void main(String[] args) {
    AbsFactory factory = new DellFactory();
    factory.createComputer().update();
    factory.createBook().save();
    factory.createCar().drive();
    factory = new AppleFactory();
    factory.createBook().save();
    factory.createComputer().update();
    factory.createCar().drive();
    factory = new LenovoFactory();
    factory.createComputer().update();
    factory.createBook().save();
    factory.createCar().drive();
    factory = new MiFactory();
    factory.createCar().drive();
    factory.createBook().save();
    factory.createComputer().update();
}
```

![image-20220531160828978](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202205311608171.png)

5. 小结

可以看出，如果是添加一个产品的话，需要修改原有代码，而且改的很多。不符合开闭原则。

## 总结

1. **在抽象工厂模式中，增加新的产品族很方便，但是增加新的产品等级结构很麻烦**，抽象工厂模式的这种性质称为**“开闭原则”的倾斜性**。
1. 优点：

- 抽象工厂模式隔离了具体类的生成，使得客户并不需要知道什么被创建。由于这种隔离，更换一个具体工厂就变得相对容易，所有的具体工厂都实现了抽象工厂中定义的那些公共接口，因此只需改变具体工厂的实例，就可以在某种程度上改变整个软件系统的行为。
- 当一个产品线中的多个对象被设计成一起工作时，它能够保证客户端始终只使用同一个产品族中的对象。
- 增加新的产品线很方便，无须修改已有系统，符合“开闭原则”。

3. 缺点

- 增加新的产品麻烦，需要对原有系统进行较大的修改，甚至需要修改抽象层代码，这显然会带来较大的不便，违背了“开闭原则”。

- 虽说添加麻烦，但是只要前期设计的时候考虑全面，添加产品线会更方便

## 适用场景

- 一个系统不应当依赖于产品类实例如何被创建、组合和表达的细节，这对于所有类型的工厂模式都是很重要的，用户无须关心对象的创建过程，将对象的创建和使用解耦。
- 系统中有多于一个的产品线，而每次只使用其中某一产品线。可以通过配置文件等方式来使得用户可以动态改变产品族，也可以很方便地增加新的产品线。
- 属于同一个产品线的产品将在一起使用，这一约束必须在系统的设计中体现出来。同一个产品线中的产品可以是没有任何关系的对象，但是它们都具有一些共同的约束，如同一操作系统下的按钮和文本框，按钮与文本框之间没有直接关系，但它们都是属于某一操作系统的，此时具有一个共同的约束条件：操作系统的类型。
- **产品等级结构稳定，设计完成之后，不会向系统中增加新的产品等级结构或者删除已有的产品等级结构。**

:::note
本文是《设计模式》系列学习笔记的第 5 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
