---
title: 适配器模式｜设计模式笔记 09
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 结构型模式
  - 适配器模式
id: design-pattern-adapter
date: 2022-06-06 17:48:46
updated: 2026-07-29
---

> **适配器模式(Adapter Pattern)**：将一个接口转换成客户希望的另一个接口，使接口不兼容的那些类可以一起工作，其别名为包装器(`Wrapper`)。适配器模式既可以作为类结构型模式，也可以作为对象结构型模式。
>
> **注：在适配器模式定义中所提及的接口是指广义的接口，它可以表示一个方法或者方法的集合。**

## 在对象适配器模式结构图中包含如下几个角色

- **Target（目标抽象类）**：目标抽象类定义客户所需接口，可以是一个抽象类或接口，也可以是具体类。
- **Adapter（适配器类）**：适配器可以调用另一个接口，作为一个转换器，对`Adaptee`和`Target`进行适配，适配器类是适配器模式的核心，在对象适配器中，它通过继承`Target`并关联一个`Adaptee`对象使二者产生联系。
- **Adaptee（适配者类）**：适配者即被适配的角色，它定义了一个已经存在的接口，这个接口需要适配，适配者类一般是一个具体类，包含了客户希望使用的业务方法，在某些情况下可能没有适配者类的源代码。

## 对象适配器实现

1. 两个适配者类

这两个类都比较垃圾，只能计算int类型的。但是客户输入是字符串型的不定长。所以就需要适配器中间做一下转换。

```java
public class AddSubCalculate {

    public int add(int a, int b) {
        return a + b;
    }

    public int sub(int a, int b) {
        return a - b;
    }
}

public class MultiplyDivideCalculate {

    public int multiply(int a, int b) {
        return a * b;
    }

    public int divide(int a, int b) {
        return a / b;
    }
}
```

2. 目标轴向类

可以理解为用户看到的接口，满足用户需求的接口。

```java
public interface Arithmetic {
    int add(String ...a);

    int sub(String ...a);

    int multiply(String ...a);

    int divide(String... a);
}
```

3. 中间适配层

这里只是演示可行性，不去处理异常情况

```java
public class ArithmeticAdapter implements Arithmetic {
    private AddSubCalculate addSubCalculate;
    private MultiplyDivideCalculate multiplyDivideCalculate;

    public ArithmeticAdapter() {
        addSubCalculate = new AddSubCalculate();
        multiplyDivideCalculate = new MultiplyDivideCalculate();
    }

    @Override
    public int add(String... a) {
        int sum = 0;
        for (String s : a) {
            int i = Integer.parseInt(s);
            sum = addSubCalculate.add(sum, i);
        }
        return sum;
    }

    @Override
    public int sub(String... a) {
        int sub = 2 * Integer.parseInt(a[0]);
        for (String s : a) {
            int i = Integer.parseInt(s);
            sub = addSubCalculate.sub(sub, i);
        }
        return sub;
    }

    @Override
    public int multiply(String... a) {
        int mult = 1;
        for (String s : a) {
            int i = Integer.parseInt(s);
            mult = multiplyDivideCalculate.multiply(mult, i);
        }
        return mult;
    }

    @Override
    public int divide(String... a) {
        int a0 = Integer.parseInt(a[0]);
        int div = a0 * a0;
        for (String s : a) {
            int i = Integer.parseInt(s);
            div = multiplyDivideCalculate.divide(div, i);
        }
        return div;
    }
}
```

4. 测试

```java
public static void main(String[] args) {
    Arithmetic arithmetic = new ArithmeticAdapter();
    int add = arithmetic.add("1", "2", "3", "4", "5", "6", "7", "8");
    int sub = arithmetic.sub("15", "1", "2", "3", "4");
    int multiply = arithmetic.multiply("1", "2", "3", "4", "5", "6", "7");
    int divide = arithmetic.divide("16", "2", "4", "1");
    System.out.println("add = " + add);
    System.out.println("sub = " + sub);
    System.out.println("multiply = " + multiply);
    System.out.println("divide = " + divide);
}
```

![image-20220606170411143](https://img.wyantao.com/img/202206061704212.png)

5. 小总结

不用动原有代码，加了一层适配器，解决了客户的需求

## 类适配器

> 类适配器模式和对象适配器模式最大的区别在于适配器和适配者之间的关系不同，对象适配器模式中适配器和适配者之间是关联关系，而类适配器模式中适配器和适配者是继承关系
>
> 因为java不支持多继承，所以类适配器受到很多限制，较少使用

```java
public class ArithmeticClassAdapter extends AddSubCalculate implements Arithmetic{
    @Override
    public int add(String... a) {
        int sum = 0;
        for (String s : a) {
            int i = Integer.parseInt(s);
            sum = this.add(sum,i);
        }
        return sum;
    }

    @Override
    public int sub(String... a) {
        int sub = 2 * Integer.parseInt(a[0]);
        for (String s : a) {
            int i = Integer.parseInt(s);
            sub = this.sub(sub, i);
        }
        return sub;
    }

    @Override
    public int multiply(String... a) {
        return 0;
    }

    @Override
    public int divide(String... a) {
        return 0;
    }
}

//测试
arithmetic = new ArithmeticClassAdapter();
int add2 = arithmetic.add("1", "2", "3", "4", "5", "6", "7", "8");
int sub2 = arithmetic.sub("15", "1", "2", "3", "4");
System.out.println("add2 = " + add2);
System.out.println("sub2 = " + sub2);
```

![image-20220606173327129](https://img.wyantao.com/img/202206061733242.png)

## 双向适配器

> 在对象适配器的使用过程中，如果在适配器中同时包含对目标类和适配者类的引用，适配者可以通过它调用目标类中的方法，目标类也可以通过它调用适配者类中的方法，那么该适配器就是一个双向适配器
>
> 用处不大，实现复杂。所以实际开发中基本上不使用。这里作为了解

## 缺省适配器

> **缺省适配器模式(Default Adapter Pattern)**：当不需要实现一个接口所提供的所有方法时，可先设计一个抽象类实现该接口，并为接口中每个方法提供一个默认实现（空方法），那么该抽象类的子类可以选择性地覆盖父类的某些方法来实现需求，它适用于不想使用一个接口中的所有方法的情况，又称为单接口适配器模式。

1. 缺省适配器中包括
   - **ServiceInterface（适配者接口）**：它是一个接口，通常在该接口中声明了大量的方法。
   - **AbstractServiceClass（缺省适配器类）**：它是缺省适配器模式的核心类，使用空方法的形式实现了在ServiceInterface接口中声明的方法。通常将它定义为抽象类，因为对它进行实例化没有任何意义。
   - **ConcreteServiceClass（具体业务类）**：它是缺省适配器类的子类，在没有引入适配器之前，它需要实现适配者接口，因此需要实现在适配者接口中定义的所有方法，而对于一些无须使用的方法也不得不提供空实现。在有了缺省适配器之后，可以直接继承该适配器类，根据需要有选择性地覆盖在适配器类中定义的方法。

2. 代码

```java
//用户接口
public interface Calculate {
    int add(String... a);

    int sub(String... a);

    int multiply(String... a);

    int divide(String... a);
}

//缺省适配器类
public abstract class AbsCalculate implements Calculate{
    @Override
    public int sub(String... a) {
        System.out.println("父类");
        int sub = 2 * Integer.parseInt(a[0]);
        for (String s : a) {
            int i = Integer.parseInt(s);
            sub = sub - i;
        }
        return sub;
    }

    @Override
    public int multiply(String... a) {
        return 0;
    }

    @Override
    public int divide(String... a) {
        return 0;
    }
}
//具体业务子类
public class AbsCalculateExt extends AbsCalculate {
    private AddSubCalculate addSubCalculate;

    public AbsCalculateExt() {
        addSubCalculate = new AddSubCalculate();
    }

    @Override
    public int add(String... a) {
        System.out.println("子类");
        int sum = 0;
        for (String s : a) {
            int i = Integer.parseInt(s);
            sum = addSubCalculate.add(sum, i);
        }
        return sum;
    }
}
//测试
Calculate calculate = new AbsCalculateExt();
int add3 = calculate.add("1", "2", "3", "4", "5", "6", "7", "8");
int sub3 = calculate.sub("15", "1", "2", "3", "4");
System.out.println("add3 = " + add3);
System.out.println("sub3 = " + sub3);
```

![image-20220606174846152](https://img.wyantao.com/img/202206061748255.png)

## 总结

1. 优点
   - 将目标类和适配者类解耦，通过引入一个适配器类来重用现有的适配者类，无须修改原有结构。
   - 增加了类的透明性和复用性，将具体的业务实现过程封装在适配者类中，对于客户端类而言是透明的，而且提高了适配者的复用性，同一个适配者类可以在多个不同的系统中复用
   - 由于适配器类是适配者类的子类，因此**可以在适配器类中置换一些适配者的方法**，使得适配器的灵活性更强。
   - 一个对象适配器**可以把多个不同的适配者适配到同一个目标**；
   - **可以适配一个适配者的子类**，由于适配器和适配者之间是关联关系，根据“里氏代换原则”，适配者的子类也可通过该适配器进行适配。

2. 缺点

   类适配器：

   -  对于Java、C#等不支持多重类继承的语言，一次最多只能适配一个适配者类，**不能同时适配多个适配者**；
   -  **适配者类不能为最终类**，如在Java中不能为final类，C#中不能为sealed类；
   - 在Java、C#等语言中，**类适配器模式中的目标抽象类只能为接口，不能为类**，其使用有一定的局限性

   对象适配器：

   -  与类适配器模式相比，**要在适配器中置换适配者类的某些方法比较麻烦**。如果一定要置换掉适配者类的一个或多个方法，可以先做一个适配者类的子类，将适配者类的方法置换掉，然后再把适配者类的子类当做真正的适配者进行适配，实现过程较为复杂。

3. 适用情况

   ​    (1) 系统需要使用一些现有的类，而这些类的接口（如方法名）不符合系统的需要，甚至没有这些类的源代码。

   ​    (2) 想创建一个可以重复使用的类，用于与一些彼此之间没有太大关联的一些类，包括一些可能在将来引进的类一起工作。

:::note
本文是《设计模式》系列学习笔记的第 9 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
