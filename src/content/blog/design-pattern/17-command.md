---
title: 命令模式｜设计模式笔记 17
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 行为型模式
  - 命令模式
id: design-pattern-command
date: 2022-06-30 10:34:01
updated: 2026-07-29
---

> **命令模式(Command Pattern)**：将一个请求封装为一个对象，从而让我们可用不同的请求对客户进行参数化；对请求排队或者记录请求日志，以及支持可撤销的操作。命令模式是一种对象行为型模式，其别名为动作**(Action)**模式或事务**(Transaction)**模式。
>
> **命令模式可以将请求发送者和接收者完全解耦，发送者与接收者之间没有直接引用关系，发送请求的对象只需要知道如何发送请求，而不必知道如何完成请求**。

## 命令模式结构图中包含如下几个角色

   ● **Command（抽象命令类）**：抽象命令类一般是一个抽象类或接口，在其中声明了用于执行请求的execute()等方法，通过这些方法可以调用请求接收者的相关操作。

   ● **ConcreteCommand（具体命令类）**：具体命令类是抽象命令类的子类，实现了在抽象命令类中声明的方法，它对应具体的接收者对象，将接收者对象的动作绑定其中。在实现execute()方法时，将调用接收者对象的相关操作(Action)。

   ● **Invoker（调用者）**：调用者即请求发送者，它通过命令对象来执行请求。一个调用者并不需要在设计时确定其接收者，因此它只与抽象命令类之间存在关联关系。在程序运行时可以将一个具体命令对象注入其中，再调用具体命令对象的execute()方法，从而实现间接调用请求接收者的相关操作。

   ● **Receiver（接收者）**：接收者执行与请求相关的操作，它具体实现对请求的业务处理。

> 命令模式的本质是对请求进行封装，一个请求对应于一个命令，将发出命令的责任和执行命令的责任分割开。每一个命令都是一个操作：请求的一方发出请求要求执行一个操作；接收的一方收到请求，并执行相应的操作。命令模式允许请求的一方和接收的一方独立开来，使得请求的一方不必知道接收请求的一方的接口，更不必知道请求如何被接收、操作是否被执行、何时被执行，以及是怎么被执行的。

## 简单实现

```java
public interface Command {
    void execute();

   public default void setReceiver(Receiver receiver) {
       receiver.action();
   }

}

public class Invoker {
    private Command command;

    public void setCommand(Command command) {
        this.command = command;
    }

    public void action() {
        command.execute();
    }
}

public class Receiver {
    public void action() {
        System.out.println("执行命令");
    }
}

//实现
public class BlowUpCommand implements Command {
    @Override
    public void execute() {
        System.out.println("放大");
    }
}

public class ReSizeCommand implements Command {
    @Override
    public void execute() {
        System.out.println("恢复");
    }
}

public class ZoomOutCommand implements Command {
    @Override
    public void execute() {
        System.out.println("缩小");
    }
}

//测试
public static void main(String[] args) {
    Receiver receiver = new Receiver();
    Command command1, command2, command3;
    command1 = new ReSizeCommand();
    command2 = new BlowUpCommand();
    command3 = new ZoomOutCommand();
    command1.setReceiver(receiver);
    command2.setReceiver(receiver);
    command3.setReceiver(receiver);
    Invoker invoker = new Invoker();
    invoker.setCommand(command1);
    invoker.action();
    Invoker invoker2 = new Invoker();
    invoker2.setCommand(command2);
    invoker2.action();
    Invoker invoker3 = new Invoker();
    invoker3.setCommand(command3);
    invoker3.action();
}
```

![image-20220629152220104](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206291522261.png)

## 实际问题解决

>  Sunny软件公司开发人员为公司内部OA系统开发了一个桌面版应用程序，该应用程序为用户提供了一系列自定义功能键，用户可以通过这些功能键来实现一些快捷操作。Sunny软件公司开发人员通过分析，发现不同的用户可能会有不同的使用习惯，在设置功能键的时候每个人都有自己的喜好，例如有的人喜欢将第一个功能键设置为“打开帮助文档”，有的人则喜欢将该功能键设置为“最小化至托盘”，为了让用户能够灵活地进行功能键的设置，开发人员提供了一个“功能键设置”窗口，该窗口界面如图2所示：
>
>  ![1366033417_2468](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206301011141.jpg)
>
>
>  图2  “功能键设置”界面效果图
>
>  通过如图2所示界面，用户可以将功能键和相应功能绑定在一起，还可以根据需要来修改功能键的设置，而且系统在未来可能还会增加一些新的功能或功能键。

```java
//窗口类
public class FBSettingWindow {
    private String title;
    private List<FunctionButton> functionButtonList = new ArrayList<>();

    public FBSettingWindow(String title) {
        this.title = title;
    }

    public void addFunctionButton(FunctionButton functionButton) {
        functionButtonList.add(functionButton);
    }

    public void removeFunctionButton(FunctionButton functionButton) {
        functionButtonList.remove(functionButton);
    }

    public void displayWindow(){
        System.out.println("--------------------------------------------");
        System.out.println("|显示窗口：" + title);
        System.out.println("|显示按钮：");
        for (FunctionButton functionButton : functionButtonList) {
            System.out.println("|" +functionButton.getName());
        }
        System.out.println("--------------------------------------------");
    }
}

//功能键类
public class FunctionButton {
    private String name;
    private Command command;

    public FunctionButton(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setCommand(Command command) {
        this.command = command;
    }

    public void onClick() {
        System.out.print("点击功能键:");
        command.execute();
    }
}

//命令类及实现
public interface Command {
    void execute();
}

public class ZoomInCommand implements Command {
    @Override
    public void execute() {
        System.out.println("放大");
    }
}

public class ZoomOutCommand implements Command {
    @Override
    public void execute() {
        System.out.println("缩小");
    }
}

//测试
public static void main(String[] args) {
    FBSettingWindow fbSettingWindow = new FBSettingWindow("设置");
    FunctionButton fbZoomIn = new FunctionButton("放大");
    FunctionButton fbZoomOut = new FunctionButton("缩小");
    fbSettingWindow.addFunctionButton(fbZoomIn);
    fbSettingWindow.addFunctionButton(fbZoomOut);
    Command zoomIn, zoomOut;
    zoomIn = new ZoomInCommand();
    zoomOut = new ZoomOutCommand();
    fbZoomIn.setCommand(zoomIn);
    fbZoomOut.setCommand(zoomOut);
    fbSettingWindow.displayWindow();
    fbZoomIn.onClick();
    fbZoomOut.onClick();
    fbZoomIn.setCommand(zoomOut);
    fbZoomOut.setCommand(zoomIn);
    fbZoomIn.onClick();
    fbZoomOut.onClick();
}
```

![image-20220630103401776](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206301034977.png)

> 可见，设置和使用按键是分开的。这里设置的时候属于是命令发送者，而每一个具体的命令实现属于命令接收者。
>
> **每一个具体命令类对应一个请求的处理者（接收者），通过向请求发送者注入不同的具体命令对象可以使得相同的发送者对应不同的接收者，从而实现“将一个请求封装为一个对象，用不同的请求对客户进行参数化”**，客户端只需要将具体命令对象作为参数注入请求发送者，无须直接操作请求的接收者。

## 撤销操作的实现

:::note{type="warning"}
本节尚未整理完成，后续补充。
:::

:::note
本文是《设计模式》系列学习笔记的第 17 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
