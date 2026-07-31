---
title: 原型模式｜设计模式笔记 07
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 创建型模式
  - 原型模式
id: design-pattern-prototype
date: 2022-06-06 11:29:51
updated: 2026-07-29
---

> **原型模式(Prototype Pattern)**：使用原型实例指定创建对象的种类，并且通过拷贝这些原型创建新的对象。原型模式是一种对象创建型模式。
>
> ***需要注意的是通过克隆方法所创建的对象是全新的对象，它们在内存中拥有新的地址，通常对克隆所产生的对象进行修改对原型对象不会造成任何影响，每一个克隆对象都是相互独立的。通过不同的方式修改可以得到一系列相似但不完全相同的对象。***

## 原型模式结构图中包含如下几个角色

- **Prototype（抽象原型类）**：它是声明克隆方法的接口，是所有具体原型类的公共父类，可以是抽象类也可以是接口，甚至还可以是具体实现类。
- **ConcretePrototype（具体原型类）**：它实现在抽象原型类中声明的克隆方法，在克隆方法中返回自己的一个克隆对象。
- **Client（客户类）**：让一个原型对象克隆自身从而创建一个新的对象，在客户类中只需要直接实例化或通过工厂方法等方式创建一个原型对象，再通过调用该对象的克隆方法即可得到多个相同的对象。由于客户类针对抽象原型类Prototype编程，因此用户可以根据需要选择具体原型类，系统具有较好的可扩展性，增加或更换具体原型类都很方便。

## 简单实现

```java
@Data
public class ObjA implements Cloneable{

    private String name;

    //自定义
    public ObjA clone(){
        ObjA objA = new ObjA();
        objA.setName(this.name);
        return objA;
    }

    //通过Object的clone方法实现
    @SneakyThrows
    public ObjA clone2(){
       return (ObjA) super.clone();
    }
}

//测试
public static void main(String[] args) {
    ObjA objA = new ObjA();
    objA.setName("张三");
    ObjA clone1 = objA.clone();
    ObjA clone2 = objA.clone2();
    System.out.println("objA = " + objA);
    System.out.println("cloneA = " + clone1);
    System.out.println("clone2 = " + clone2);
    System.out.println("ObjA与clone1对比：" + (objA == clone1));
    System.out.println("ObjA与clone2对比：" + (objA == clone2));
}
```

![image-20220606100600698](https://img.wyantao.com/img/202206061006033.png)

## 深浅克隆

> 在Java语言中，数据类型分为**值类型**（基本数据类型）和**引用类型**
>
> 值类型:`int`、`double`、`byte`、`boolean`、`char`等简单数据类型
>
> 引用类型:`类`、`接口`、`数组`等复杂类型。
>
> **浅克隆和深克隆的主要区别在于是否支持引用类型的成员变量的复制**

### 浅克隆

在浅克隆中，如果原型对象的成员变量是值类型，将复制一份给克隆对象；

如果原型对象的成员变量是引用类型，则将引用对象的地址复制一份给克隆对象，也就是说原型对象和克隆对象的成员变量指向相同的内存地址。

简单来说，在浅克隆中，当对象被复制时只复制它本身和其中包含的值类型的成员变量，而引用类型的成员对象并没有复制

通过覆盖Object类的clone()方法可以实现浅克隆

```java
@Data
public class ShallowClone implements Cloneable {

    private String name;
    private Attachment attachment;

    @SneakyThrows
    public ShallowClone clone(){
        return (ShallowClone) super.clone();
    }
}

@Data
public class Attachment {
    private String name;
    private String url;

    public void download() {
        System.out.println("下载附件 = " + name + url);
    }
}

//测试
public static void main(String[] args) {
    ShallowClone shallowClone = new ShallowClone();
    shallowClone.setName("张三");
    Attachment attachment = new Attachment();
    attachment.setName("附件1");
    attachment.setUrl("http://www.baidu.com");
    shallowClone.setAttachment(attachment);
    ShallowClone clone = shallowClone.clone();
    System.out.println("shallowClone = " + shallowClone);
    System.out.println("clone = " + clone);
    System.out.println("shallowClone与clone对比：" + (shallowClone == clone));
    System.out.println("shallowClone的附件与clone的附件对比：" + (shallowClone.getAttachment() == clone.getAttachment()));
}
```

![image-20220606101602868](https://img.wyantao.com/img/202206061016052.png)

可见，浅克隆的对象里面的对象在内存中是同一个。

### 深克隆

在深克隆中，无论原型对象的成员变量是值类型还是引用类型，都将复制一份给克隆对象，深克隆将原型对象的所有引用对象也复制一份给克隆对象。

简单来说，在深克隆中，除了对象本身被复制外，对象所包含的所有成员变量也将复制

在JAVA中，一般有两个简单方法来实现深拷贝。序列化（Serializable）和 JSON序列化

```java
@Data
public class DeepClone implements Serializable {
    private String name;

    private Attachment attachment;

    //通过序列化进行深拷贝
    public DeepClone cloneBySerializable() {
        try {
        	//将对象写入流
            ByteOutputStream byteOutputStream = new ByteOutputStream();
            ObjectOutputStream objectOutputStream = new ObjectOutputStream(byteOutputStream);
            objectOutputStream.writeObject(this);
            //将对象读出流
            ByteArrayInputStream byteInputStream = new ByteArrayInputStream(byteOutputStream.getBytes());
            ObjectInputStream objectInputStream = new ObjectInputStream(byteInputStream);
            DeepClone deepClone = (DeepClone) objectInputStream.readObject();
            return deepClone;
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
            throw new RuntimeException("克隆失败");
        }
    }

    //通过Json进行深拷贝
    public DeepClone cloneByJson(){
        String jsonString = JSONObject.toJSONString(this);
        return JSONObject.parseObject(jsonString, DeepClone.class);
    }
}

@Data
public class Attachment implements Serializable {
    private String name;
    private String url;

    public void download() {
        System.out.println("下载附件 = " + name + url);
    }
}
```

测试：

```java
public static void main(String[] args) {
    DeepClone deepClone = new DeepClone();
    deepClone.setName("李四");
    Attachment attachment = new Attachment();
    attachment.setName("附件二：");
    attachment.setUrl("http://123.com");
    deepClone.setAttachment(attachment);
    DeepClone deepCloneBySe = deepClone.cloneBySerializable();
    DeepClone deepCloneByJson = deepClone.cloneByJson();
    System.out.println("deepClone = " + deepClone);
    System.out.println("deepCloneBySe = " + deepCloneBySe);
    System.out.println("deepCloneByJson = " + deepCloneByJson);
    System.out.println("deepClone与deepCloneBySe对比：" + (deepClone == deepCloneBySe));
    System.out.println("deepClone的附件与deepCloneBySe的附件对比：" + (deepClone.getAttachment() == deepCloneBySe.getAttachment()));
    System.out.println("deepClone与deepdeepCloneByJson对比：" + (deepClone == deepCloneByJson));
    System.out.println("deepClone的附件与deepCloneByJson的附件对比：" + (deepClone.getAttachment() == deepCloneByJson.getAttachment()));
}
```

![image-20220606104328115](https://img.wyantao.com/img/202206061043479.png)

从结果可以看出，深拷贝之后，即使是引用类型也在内存中拷贝了一份，内存地址不用。

## 原型管理器（Prototype Manager）

> **原型管理器(Prototype Manager)**是将多个原型对象存储在一个集合中供客户端使用，它是一个专门负责克隆对象的工厂，其中定义了一个集合用于存储原型对象，如果需要某个原型对象的一个克隆，可以通过复制集合中对应的原型对象来获得。
>
> 在原型管理器中针对抽象原型类进行编程，以便扩展。

```java
//模板接口
public interface IOfficeMoBan{
    public void print();

    //使用默认方法定义克隆方法
    default IOfficeMoBan cloneByJson(Class<?> clazz){
        String jsonString = JSONObject.toJSONString(this);
        return  (IOfficeMoBan) JSONObject.parseObject(jsonString, clazz);
    }
}

//接口实现
public class RegisterOffice implements IOfficeMoBan {
    @Override
    public void print() {
        System.out.println("打印登记处");
    }
}
public class RedcOffice implements IOfficeMoBan {
    @Override
    public void print() {
        System.out.println("减员打印");
    }
}

//原型管理器
//使用enum方法实现单例
public enum PrototypeManager {
    /**
     * 实例
     */
    INSTANCE;

    private static final Map<String, IOfficeMoBan> MAP = new HashMap<>();

    public void addOffice(String key,IOfficeMoBan iOfficeMoBan){
        MAP.put(key,iOfficeMoBan);
    }

    public IOfficeMoBan getOffice(String key){
        IOfficeMoBan iOfficeMoBan = MAP.get(key);
        return iOfficeMoBan.cloneByJson(iOfficeMoBan.getClass());
    }
}
```

测试：

```java
public static void main(String[] args) {
    PrototypeManager pm = PrototypeManager.INSTANCE;
    pm.addOffice("reg",new RegisterOffice());
    pm.addOffice("redc",new RedcOffice());
    IOfficeMoBan reg1 = pm.getOffice("reg");
    IOfficeMoBan reg2 = pm.getOffice("reg");
    reg1.print();
    reg2.print();
    System.out.println(reg1 == reg2);
    IOfficeMoBan redc1 = pm.getOffice("redc");
    IOfficeMoBan redc2 = pm.getOffice("redc");
    redc1.print();
    redc2.print();
    System.out.println(redc1 == redc2);
}
```

![image-20220606112951359](https://img.wyantao.com/img/202206061129453.png)

这样的话如果添加一个新的实现类，直接添加接可以。不用修改代码。

## 优点

-  当创建新的对象实例较为复杂时，使用原型模式可以简化对象的创建过程，通过复制一个已有实例可以提高新实例的创建效率。
- 扩展性较好，由于在原型模式中提供了抽象原型类，在客户端可以针对抽象原型类进行编程，而将具体原型类写在配置文件中，增加或减少产品类对原有系统都没有任何影响。
- 原型模式提供了简化的创建结构，工厂方法模式常常需要有一个与产品类等级结构相同的工厂等级结构，而原型模式就不需要这样，原型模式中产品的复制是通过封装在原型类中的克隆方法实现的，无须专门的工厂类来创建产品。
- 可以使用深克隆的方式保存对象的状态，使用原型模式将对象复制一份并将其状态保存起来，以便在需要的时候使用（如恢复到某一历史状态），可辅助实现撤销操作。

## 适用场景

(1) 创建新对象成本较大（如初始化需要占用较长的时间，占用太多的CPU资源或网络资源），新的对象可以通过原型模式对已有对象进行复制来获得，如果是相似对象，则可以对其成员变量稍作修改。

(2) 如果系统要保存对象的状态，而对象的状态变化很小，或者对象本身占用内存较少时，可以使用原型模式配合备忘录模式来实现。

(3) 需要避免使用分层次的工厂类来创建分层次的对象，并且类的实例对象只有一个或很少的几个组合状态，通过复制原型对象得到新实例可能比使用构造函数创建一个新实例更加方便。

> 说实话，这个具体在什么情况下能用到，还有点迷。不是很清晰。

:::note
本文是《设计模式》系列学习笔记的第 7 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
