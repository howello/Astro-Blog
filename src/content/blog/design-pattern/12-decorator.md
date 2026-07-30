---
title: 装饰模式｜设计模式笔记 12
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 结构型模式
  - 装饰模式
id: design-pattern-decorator
date: 2022-06-14 16:45:10
updated: 2026-07-29
---

> **装饰模式(Decorator Pattern)**：动态地给一个对象增加一些额外的职责，就增加对象功能来说，装饰模式比生成子类实现更为灵活。
>
> 装饰模式是一种对象结构型模式。
>
> 装饰模式是一种用于替代继承的技术，它通过一种无须定义子类的方式来给对象动态增加职责，使用对象之间的关联关系取代类之间的继承关系。

## 装饰模式结构图中包含如下几个角色

- **Component（抽象构件）**：它是具体构件和抽象装饰类的共同父类，声明了在具体构件中实现的业务方法，它的引入可以使客户端以一致的方式处理未被装饰的对象以及装饰之后的对象，实现客户端的透明操作。
- **ConcreteComponent（具体构件）**：它是抽象构件类的子类，用于定义具体的构件对象，实现了在抽象构件中声明的方法，装饰器可以给它增加额外的职责（方法）。
- **Decorator（抽象装饰类）**：它也是抽象构件类的子类，用于给具体构件增加职责，但是具体职责在其子类中实现。它维护一个指向抽象构件对象的引用，通过该引用可以调用装饰之前构件对象的方法，并通过其子类扩展该方法，以达到装饰的目的。
- **ConcreteDecorator（具体装饰类）**：它是抽象装饰类的子类，负责向构件添加新的职责。每一个具体装饰类都定义了一些新的行为，它可以调用在抽象装饰类中定义的方法，并可以增加新的方法用以扩充对象的行为。

## 代码实现

```java
//构建类
public abstract class Computer {
    public abstract void build();
}
//构建实现类
public class AppleComputer extends Computer {
    @Override
    public void build() {
        System.out.println("建造苹果电脑！");
    }
}

public class DellComputer extends Computer {
    @Override
    public void build() {
        System.out.println("建造Dell电脑！");
    }
}

public class LenovoComputer extends Computer {
    @Override
    public void build() {
        System.out.println("建造联想电脑！");
    }
}
```

```java
//装饰类
public abstract class ComputerDecorator extends Computer{
    private Computer computer;

    public ComputerDecorator(Computer computer) {
        this.computer = computer;
    }

    @Override
    public void build() {
        computer.build();
    }
}

public class ColorDecorator extends ComputerDecorator {

    public ColorDecorator(Computer computer) {
        super(computer);
    }

    @Override
    public void build() {
        this.addColor("red");
        super.build();
    }

    public void addColor(String color) {
        System.out.println("添加颜色：" + color);
    }
}

public class ShapeDecorator extends ComputerDecorator {
    public ShapeDecorator(Computer computer) {
        super(computer);
    }

    @Override
    public void build() {
        this.addShape("circle");
        super.build();
    }

    public void  addShape(String shape) {
        System.out.println("添加形状：" + shape);
    }
}
```

```java
//测试
public static void main(String[] args) {
    Computer computer = new DellComputer();
    Computer colorDecorator = new ColorDecorator(computer);
    colorDecorator.build();
    System.out.println("----------------------------------------------------");
    Computer appleComputer = new AppleComputer();
    Computer appleDecorator = new ShapeDecorator(appleComputer);
    appleDecorator.build();
    System.out.println("----------------------------------------------------");
    Computer dellComputer = new DellComputer();
    Computer dellColorDecorator = new ColorDecorator(dellComputer);
    Computer dellShapeDecorator = new ShapeDecorator(dellColorDecorator);
    dellShapeDecorator.build();
}
```

![image-20220614164510512](https://img.wyantao.com/img/202206141645728.png)

## 总结

一句话来说就是在原有基础不动的前提下，进行业务的扩充。

1. 优点
   - 对于扩展一个对象的功能，装饰模式比继承更加灵活性，不会导致类的个数急剧增加。
   - 可以通过一种动态的方式来扩展一个对象的功能。
   - 可以对一个对象进行多次装饰，通过使用不同的具体装饰类以及这些装饰类的排列组合，可以创造出很多不同行为的组合，得到功能更为强大的对象。
   - 具体构件类与具体装饰类可以独立变化，用户可以根据需要增加新的具体构件类和具体装饰类，原有类库代码无须改变，符合“开闭原则”。
2. 缺点
   - 使用装饰模式进行系统设计时将产生很多小对象，这些对象的区别在于它们之间相互连接的方式有所不同，而不是它们的类或者属性值有所不同，大量小对象的产生势必会占用更多的系统资源，在一定程序上影响程序的性能。
   - 装饰模式提供了一种比继承更加灵活机动的解决方案，但同时也意味着比继承更加易于出错，排错也很困难，对于多次装饰的对象，调试时寻找错误可能需要逐级排查，较为繁琐。
3. 适用场景
   - 在不影响其他对象的情况下，以动态、透明的方式给单个对象添加职责。
   - 当不能采用继承的方式对系统进行扩展或者采用继承不利于系统扩展和维护时可以使用装饰模式。不能采用继承的情况主要有两类：第一类是系统中存在大量独立的扩展，为支持每一种扩展或者扩展之间的组合将产生大量的子类，使得子类数目呈爆炸性增长；第二类是因为类已定义为不能被继承（如Java语言中的final类）。

:::note
本文是《设计模式》系列学习笔记的第 12 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
