---
title: 职责链模式｜设计模式笔记 16
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 行为型模式
  - 职责链模式
id: design-pattern-chain-of-responsibility
date: 2022-06-29 14:14:10
updated: 2026-07-29
---

> **职责链模式(Chain of Responsibility Pattern)**：避免请求发送者与接收者耦合在一起，让多个对象都有可能接收请求，将这些对象连接成一条链，并且沿着这条链传递请求，直到有对象处理它为止。职责链模式是一种对象行为型模式。
>
> *猜测工作流。可以有效解决if else 过多问题*

## 在职责链模式结构图中包含如下几个角色

  ● Hand**ler（抽象处理者）：**它定义了一个处理请求的接口，一般设计为抽象类，由于不同的具体处理者处理请求的方式不同，因此在其中定义了抽象请求处理方法。因为每一个处理者的下家还是一个处理者，因此在抽象处理者中定义了一个抽象处理者类型的对象（如结构图中的successor），作为其对下家的引用。通过该引用，处理者可以连成一条链。

  ● **ConcreteHandler（具体处理者）：**它是抽象处理者的子类，可以处理用户请求，在具体处理者类中实现了抽象处理者中定义的抽象请求处理方法，在处理请求之前需要进行判断，看是否有相应的处理权限，如果可以处理请求就处理它，否则将请求转发给后继者；在具体处理者中可以访问链中下一个对象，以便请求的转发。

**系统可以在不影响客户端的情况下动态地重新组织链和分配责任**。

> 需要注意的是：职责链模式并不创建职责链，职责链的创建工作必须由系统的其他部分来完成，一般是在使用该职责链的客户端中创建职责链。职责链模式降低了请求的发送端和接收端之间的耦合，使多个对象都有机会处理这个请求。

## 实现

```java
//实体类
@Data
public class PurchaseOrder {
    private BigDecimal amount;
    private String name;
    private int number;
}

//抽象审批类
public abstract class Approver {
    protected Approver successor;
    protected String name;

    public Approver(String name) {
        this.name = name;
    }

    public void setSuccessor(Approver successor) {
        this.successor = successor;
    }

    public abstract void processRequest(PurchaseOrder purchaseOrder);
}
```

```java
//实现类
//小组长
public class GroupLeaderApprover extends Approver {
    public GroupLeaderApprover(String name) {
        super(name);
    }

    @Override
    public void processRequest(PurchaseOrder purchaseOrder) {
        if (purchaseOrder.getAmount().compareTo(new BigDecimal(1000)) < 0) {
            System.out.println(name + ":我审批了，购买金额为" + purchaseOrder.getAmount() + "购买东西：" + purchaseOrder.getName() + "数量为" + purchaseOrder.getNumber());
        } else {
            successor.processRequest(purchaseOrder);
        }
    }
}

//经理
public class ManagerApprover extends Approver {
    public ManagerApprover(String name) {
        super(name);
    }

    @Override
    public void processRequest(PurchaseOrder purchaseOrder) {
        if (purchaseOrder.getAmount().compareTo(new BigDecimal(5000)) < 0) {
            System.out.println(name + ":我审批了，购买金额为" + purchaseOrder.getAmount() + "购买东西：" + purchaseOrder.getName() + "数量为" + purchaseOrder.getNumber());
        } else {
            successor.processRequest(purchaseOrder);
        }
    }
}

//董事长
public class ChairmanApprover extends Approver {
    public ChairmanApprover(String name) {
        super(name);
    }

    @Override
    public void processRequest(PurchaseOrder purchaseOrder) {
        if (purchaseOrder.getAmount().compareTo(new BigDecimal(10000)) < 0) {
            System.out.println(name + ":我审批了，购买金额为" + purchaseOrder.getAmount() + "购买东西：" + purchaseOrder.getName() + "数量为" + purchaseOrder.getNumber());
        } else {
            successor.processRequest(purchaseOrder);
        }
    }
}

//幕后大领导
public class MaxLeaderApprover extends Approver {
    public MaxLeaderApprover(String name) {
        super(name);
    }

    @Override
    public void processRequest(PurchaseOrder purchaseOrder) {
        System.out.println(name + ":我审批了，购买金额为" + purchaseOrder.getAmount() + "购买东西：" + purchaseOrder.getName() + "数量为" + purchaseOrder.getNumber());
    }
}

//测试
public static void main(String[] args) {
    Approver groupLeader1,groupLeader2,manager1,manager2,chairman,maxLeader;
    groupLeader1 = new GroupLeaderApprover("组长1");
    groupLeader2 = new GroupLeaderApprover("组长2");
    manager1 = new ManagerApprover("经理1");
    manager2 = new ManagerApprover("经理2");
    chairman = new ChairmanApprover("总裁");
    maxLeader = new MaxLeaderApprover("最高经理");
    groupLeader1.setSuccessor(manager1);
    groupLeader2.setSuccessor(manager2);
    manager1.setSuccessor(chairman);
    manager2.setSuccessor(chairman);
    chairman.setSuccessor(maxLeader);
    PurchaseOrder purchaseOrder = new PurchaseOrder();
    purchaseOrder.setAmount(new BigDecimal(500));
    purchaseOrder.setName("苹果");
    purchaseOrder.setNumber(10);
    groupLeader1.processRequest(purchaseOrder);
    System.out.println("--------------------------------------------");
    purchaseOrder.setAmount(new BigDecimal(3000));
    groupLeader2.processRequest(purchaseOrder);
    System.out.println("--------------------------------------------");
    purchaseOrder.setAmount(new BigDecimal(6000));
    groupLeader2.processRequest(purchaseOrder);
    System.out.println("--------------------------------------------");
    purchaseOrder.setAmount(new BigDecimal(10800));
    groupLeader2.processRequest(purchaseOrder);
}
```

![image-20220629140832083](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206291408284.png)

## 添加一个区域经理

```java
public class RegionalManagerApprover extends Approver {
    public RegionalManagerApprover(String name) {
        super(name);
    }

    @Override
    public void processRequest(PurchaseOrder purchaseOrder) {
        if (purchaseOrder.getAmount().compareTo(new BigDecimal(8000)) < 0) {
            System.out.println(name + ":我审批了，购买金额为" + purchaseOrder.getAmount() + "购买东西：" + purchaseOrder.getName() + "数量为" + purchaseOrder.getNumber());
        } else {
            successor.processRequest(purchaseOrder);
        }
    }
}

//只需添加实现类即可
//测试
public static void main(String[] args) {
    Approver groupLeader1,groupLeader2,manager1,manager2,chairman,maxLeader,regionalLeader;
    groupLeader1 = new GroupLeaderApprover("组长1");
    groupLeader2 = new GroupLeaderApprover("组长2");
    manager1 = new ManagerApprover("经理1");
    manager2 = new ManagerApprover("经理2");
    chairman = new ChairmanApprover("总裁");
    maxLeader = new MaxLeaderApprover("最高经理");
    regionalLeader = new RegionalManagerApprover("区域经理");
    groupLeader1.setSuccessor(manager1);
    groupLeader2.setSuccessor(manager2);
    manager1.setSuccessor(regionalLeader);
    manager2.setSuccessor(regionalLeader);
    regionalLeader.setSuccessor(chairman);
    chairman.setSuccessor(maxLeader);
    PurchaseOrder purchaseOrder = new PurchaseOrder();
    purchaseOrder.setAmount(new BigDecimal(500));
    purchaseOrder.setName("苹果");
    purchaseOrder.setNumber(10);
    groupLeader1.processRequest(purchaseOrder);
    System.out.println("--------------------------------------------");
    purchaseOrder.setAmount(new BigDecimal(3000));
    groupLeader2.processRequest(purchaseOrder);
    System.out.println("--------------------------------------------");
    purchaseOrder.setAmount(new BigDecimal(6000));
    groupLeader2.processRequest(purchaseOrder);
    System.out.println("--------------------------------------------");
    purchaseOrder.setAmount(new BigDecimal(8888));
    groupLeader2.processRequest(purchaseOrder);
    System.out.println("--------------------------------------------");
    purchaseOrder.setAmount(new BigDecimal(10800));
    groupLeader2.processRequest(purchaseOrder);
}
```

![image-20220629141410869](https://howe-pic-bed.oss-cn-beijing.aliyuncs.com/picbed/202206291414027.png)

## 纯与不纯的职责链模式

1. 纯的职责链模式

   一个纯的职责链模式要求一个具体处理者对象只能在两个行为中选择一个：要么承担全部责任，要么将责任推给下家，不允许出现某一个具体处理者对象在承担了一部分或全部责任后又将责任向下传递的情况。而且在纯的职责链模式中，要求一个请求必须被某一个处理者对象所接收，不能出现某个请求未被任何一个处理者对象处理的情况。在前面的采购单审批实例中应用的是纯的职责链模式。

2. 不纯的职责链模式

   在一个不纯的职责链模式中允许某个请求被一个具体处理者部分处理后再向下传递，或者一个具体处理者处理完某请求后其后继处理者可以继续处理该请求，而且一个请求可以最终不被任何处理者对象所接收。

   **每一级组件在接收到事件时，都可以处理此事件，而不论此事件是否在上一级已得到处理，还存在事件未被处理的情况**。

   这种事件处理机制又叫**事件浮升(Event Bubbling)**机制。

## 优缺点

1. 优点

     (1) 职责链模式使得一个对象无须知道是其他哪一个对象处理其请求，对象仅需知道该请求会被处理即可，接收者和发送者都没有对方的明确信息，且链中的对象不需要知道链的结构，由客户端负责链的创建，降低了系统的耦合度。

      (2) 请求处理对象仅需维持一个指向其后继者的引用，而不需要维持它对所有的候选处理者的引用，可简化对象的相互连接。

      (3) 在给对象分派职责时，职责链可以给我们更多的灵活性，可以通过在运行时对该链进行动态的增加或修改来增加或改变处理一个请求的职责。

      (4) 在系统中增加一个新的具体请求处理者时无须修改原有系统的代码，只需要在客户端重新建链即可，从这一点来看是符合“开闭原则”的。

2. 缺点

      (1) 由于一个请求没有明确的接收者，那么就不能保证它一定会被处理，该请求可能一直到链的末端都得不到处理；一个请求也可能因职责链没有被正确配置而得不到处理。

      (2) 对于比较长的职责链，请求的处理可能涉及到多个处理对象，系统性能将受到一定影响，而且在进行代码调试时不太方便。

      (3) 如果建链不当，可能会造成循环调用，将导致系统陷入死循环。

:::note
本文是《设计模式》系列学习笔记的第 16 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
