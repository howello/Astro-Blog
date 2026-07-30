---
title: 组合模式｜设计模式笔记 11
categories: 设计模式
tags:
  - 设计模式
  - Java
  - 结构型模式
  - 组合模式
id: design-pattern-composite
date: 2022-06-07 16:00:01
updated: 2026-07-29
---

> **组合模式(Composite Pattern)**：组合多个对象形成树形结构以表示具有“整体—部分”关系的层次结构。
>
> 组合模式对单个对象（即叶子对象）和组合对象（即容器对象）的使用具有一致性，组合模式又可以称为“整体—部分”`(Part-Whole)`模式，它是一种对象结构型模式。

## 组合模式结构图中包含如下几个角色

- **Component（抽象构件）**：它可以是接口或抽象类，为叶子构件和容器构件对象声明接口，在该角色中可以包含所有子类共有行为的声明和实现。在抽象构件中定义了访问及管理它的子构件的方法，如增加子构件、删除子构件、获取子构件等。
- **Leaf（叶子构件）**：它在组合结构中表示叶子节点对象，叶子节点没有子节点，它实现了在抽象构件中定义的行为。对于那些访问及管理子构件的方法，可以通过异常等方式进行处理。
- **Composite（容器构件）**：它在组合结构中表示容器节点对象，容器节点包含子节点，其子节点可以是叶子节点，也可以是容器节点，它提供一个集合用于存储子节点，实现了在抽象构件中定义的行为，包括那些访问及管理子构件的方法，在其业务方法中可以递归调用其子节点的业务方法。

> **组合模式的关键是定义了一个抽象构件类，它既可以代表叶子，又可以代表容器，而客户端针对该抽象构件类进行编程，无须知道它到底表示的是叶子还是容器，可以对其进行统一处理。**

## 组合模式简单实现（透明）

```java
//抽象文件类
public abstract class AbstractFile {
    public abstract void add(AbstractFile file);

    public abstract void  remove(AbstractFile file);

    public abstract AbstractFile getChild(int i);

    public abstract void kill();
}

//图像文件子类
public class ImageFile extends AbstractFile{
    private String name;

    public ImageFile(String name) {
        this.name = name;
    }

    @Override
    public void add(AbstractFile file) {
        System.out.println("不支持该操作");
    }

    @Override
    public void remove(AbstractFile file) {
        System.out.println("不支持该操作");
    }

    @Override
    public AbstractFile getChild(int i) {
        System.out.println("不支持该操作");
        return null;
    }

    @Override
    public void kill() {
        System.out.println("===对图像文件杀毒：name：" + name);
    }
}

//文本文件子类
public class TextFile extends AbstractFile{
    private String name;

    public TextFile(String name) {
        this.name = name;
    }

    @Override
    public void add(AbstractFile file) {
        System.out.println("不支持该操作");
    }

    @Override
    public void remove(AbstractFile file) {
        System.out.println("不支持该操作");
    }

    @Override
    public AbstractFile getChild(int i) {
        System.out.println("不支持该操作");
        return null;
    }

    @Override
    public void kill() {
        System.out.println("===对文本文档杀毒：name：" + name);
    }
}

//视频文件子类
public class VideoFile extends AbstractFile{
    private String name;

    public VideoFile(String name) {
        this.name = name;
    }

    @Override
    public void add(AbstractFile file) {
        System.out.println("不支持该操作");
    }

    @Override
    public void remove(AbstractFile file) {
        System.out.println("不支持该操作");
    }

    @Override
    public AbstractFile getChild(int i) {
        System.out.println("不支持该操作");
        return null;
    }

    @Override
    public void kill() {
        System.out.println("===对视频文件杀毒：name：" + name);
    }
}

//测试
public static void main(String[] args) {
    AbstractFile img1,img2,img3,txt1,txt2,txt3,video1,video2,video3,folder1,folder2,folder3,folder4;
    img1 = new ImageFile("img1");
    img2 = new ImageFile("img2");
    img3 = new ImageFile("img3");
    txt1 = new TextFile("txt1");
    txt2 = new TextFile("txt2");
    txt3 = new TextFile("txt3");
    video1 = new VideoFile("video1");
    video2 = new VideoFile("video2");
    video3 = new VideoFile("video3");
    folder1 = new Folder("folder1");
    folder2 = new Folder("folder2");
    folder3 = new Folder("folder3");
    folder4 = new Folder("folder4");
    folder1.add(img1);
    folder1.add(txt1);
    folder1.add(video1);
    folder2.add(img2);
    folder2.add(txt2);
    folder2.add(video2);
    folder2.add(folder1);
    folder3.add(img3);
    folder3.add(txt3);
    folder3.add(video3);
    folder3.add(folder2);
    folder4.add(folder3);
    folder4.kill();
}
```

![image-20220607152757209](https://img.wyantao.com/img/202206071527358.png)

就感觉很牛逼，啥都没干，突然就啥都有了。

## 组合模式优化实现（透明）

> 给叶子节点用不到的几个方法，添加默认实现。这样叶子就不用重写，只有容器重写就可以。
>
> 比较简单，但是不安全

```java
public abstract class AbstractFile {
    public  void add(AbstractFile file){
        System.out.println("不支持该操作");
    }

    public  void  remove(AbstractFile file){
        System.out.println("不支持该操作");
    }

    public  AbstractFile getChild(int i){
        System.out.println("不支持该操作");
        return null;
    }

    public abstract void kill();
}

public class Folder extends AbstractFile {
    private String name;
    private List<AbstractFile> childList = new ArrayList<>();

    public Folder(String name) {
        this.name = name;
    }

    @Override
    public void add(AbstractFile file) {
        childList.add(file);
    }

    @Override
    public void remove(AbstractFile file) {
        childList.remove(file);
    }

    @Override
    public AbstractFile getChild(int i) {
        return childList.get(i);
    }

    @Override
    public void kill() {
        System.out.println("===对文件夹进行杀毒：name：" + name);
        for (AbstractFile abstractFile : childList) {
            abstractFile.kill();
        }
    }
}

public class ImageFile extends AbstractFile {
    private String name;

    public ImageFile(String name) {
        this.name = name;
    }

    @Override
    public void kill() {
        System.out.println("===对图像文件杀毒：name：" + name);
    }
}

public class TextFile extends AbstractFile {
    private String name;

    public TextFile(String name) {
        this.name = name;
    }

    @Override
    public void kill() {
        System.out.println("===对文本文档杀毒：name：" + name);
    }
}

public class VideoFile extends AbstractFile {
    private String name;

    public VideoFile(String name) {
        this.name = name;
    }

    @Override
    public void kill() {
        System.out.println("===对视频文件杀毒：name：" + name);
    }
}

public static void main(String[] args) {
    AbstractFile img1, img2, img3, txt1, txt2, txt3, video1, video2, video3, folder1, folder2, folder3, folder4;
    img1 = new ImageFile("img1");
    img2 = new ImageFile("img2");
    img3 = new ImageFile("img3");
    txt1 = new TextFile("txt1");
    txt2 = new TextFile("txt2");
    txt3 = new TextFile("txt3");
    video1 = new VideoFile("video1");
    video2 = new VideoFile("video2");
    video3 = new VideoFile("video3");
    folder1 = new Folder("folder1");
    folder2 = new Folder("folder2");
    folder3 = new Folder("folder3");
    folder4 = new Folder("folder4");
    folder1.add(img1);
    folder1.add(txt1);
    folder1.add(video1);
    folder2.add(img2);
    folder2.add(txt2);
    folder2.add(video2);
    folder2.add(folder1);
    folder3.add(img3);
    folder3.add(txt3);
    folder3.add(video3);
    folder3.add(folder2);
    folder4.add(folder3);
    folder4.kill();
}
```

![image-20220607155452283](https://img.wyantao.com/img/202206071554407.png)

## 组合模式实现（安全）

> 抽象类里面直接不定义几个方法，放到容器里面定义。这样比较安全。
>
> 但是使用的时候需要用到容器进行实例化，不能使用抽象类
>
> 安全组合模式的缺点是不够透明，因为叶子构件和容器构件具有不同的方法，且容器构件中那些用于管理成员对象的方法没有在抽象构件类中定义，因此客户端不能完全针对抽象编程，必须有区别地对待叶子构件和容器构件。

```java
public abstract class AbstractFile {
    public abstract void kill();
}

public class Folder extends AbstractFile {
    private String name;
    private List<AbstractFile> childList = new ArrayList<>();

    public Folder(String name) {
        this.name = name;
    }

    public void add(AbstractFile file) {
        childList.add(file);
    }

    public void remove(AbstractFile file) {
        childList.remove(file);
    }

    public AbstractFile getChild(int i) {
        return childList.get(i);
    }

    @Override
    public void kill() {
        System.out.println("===对文件夹进行杀毒：name：" + name);
        for (AbstractFile abstractFile : childList) {
            abstractFile.kill();
        }
    }
}

public class ImageFile extends AbstractFile {
    private String name;

    public ImageFile(String name) {
        this.name = name;
    }

    @Override
    public void kill() {
        System.out.println("===对图像文件杀毒：name：" + name);
    }
}

public class TextFile extends AbstractFile {
    private String name;

    public TextFile(String name) {
        this.name = name;
    }

    @Override
    public void kill() {
        System.out.println("===对文本文档杀毒：name：" + name);
    }
}

public class VideoFile extends AbstractFile {
    private String name;

    public VideoFile(String name) {
        this.name = name;
    }

    @Override
    public void kill() {
        System.out.println("===对视频文件杀毒：name：" + name);
    }
}

public static void main(String[] args) {
    AbstractFile img1, img2, img3, txt1, txt2, txt3, video1, video2, video3;
    Folder folder1, folder2, folder3, folder4;
    img1 = new ImageFile("img1");
    img2 = new ImageFile("img2");
    img3 = new ImageFile("img3");
    txt1 = new TextFile("txt1");
    txt2 = new TextFile("txt2");
    txt3 = new TextFile("txt3");
    video1 = new VideoFile("video1");
    video2 = new VideoFile("video2");
    video3 = new VideoFile("video3");
    folder1 = new Folder("folder1");
    folder2 = new Folder("folder2");
    folder3 = new Folder("folder3");
    folder4 = new Folder("folder4");
    folder1.add(img1);
    folder1.add(txt1);
    folder1.add(video1);
    folder2.add(img2);
    folder2.add(txt2);
    folder2.add(video2);
    folder2.add(folder1);
    folder3.add(img3);
    folder3.add(txt3);
    folder3.add(video3);
    folder3.add(folder2);
    folder4.add(folder3);
    folder4.kill();
}
```

![image-20220607160001822](https://img.wyantao.com/img/202206071600968.png)

## 总结

组合模式使用面向对象的思想来实现树形结构的构建与处理，描述了如何将容器对象和叶子对象进行递归组合，实现简单，灵活性好。

1. 优点

  (1) 组合模式可以清楚地定义分层次的复杂对象，表示对象的全部或部分层次，它让客户端忽略了层次的差异，方便对整个层次结构进行控制。

  (2) 客户端可以一致地使用一个组合结构或其中单个对象，不必关心处理的是单个对象还是整个组合结构，简化了客户端代码。

  (3) 在组合模式中增加新的容器构件和叶子构件都很方便，无须对现有类库进行任何修改，符合“开闭原则”。

  (4) 组合模式为树形结构的面向对象实现提供了一种灵活的解决方案，通过叶子对象和容器对象的递归组合，可以形成复杂的树形结构，但对树形结构的控制却非常简单。

2. 缺点

在增加新构件时很难对容器中的构件类型进行限制。有时候我们希望一个容器中只能有某些特定类型的对象，例如在某个文件夹中只能包含文本文件，使用组合模式时，不能依赖类型系统来施加这些约束，因为它们都来自于相同的抽象层，在这种情况下，必须通过在运行时进行类型检查来实现，这个实现过程较为复杂。

3. 适用场景

  (1) 在具有整体和部分的层次结构中，希望通过一种方式忽略整体与部分的差异，客户端可以一致地对待它们。

  (2) 在一个使用面向对象语言开发的系统中需要处理一个树形结构。

  (3) 在一个系统中能够分离出叶子对象和容器对象，而且它们的类型不固定，需要增加一些新的类型。

> Java SE中的AWT和Swing包的设计就基于组合模式,还有XML解析、组织结构树处理、文件系统设计等领域适用较多。

:::note
本文是《设计模式》系列学习笔记的第 11 篇，内容整理并改编自 [刘伟老师的设计模式系列博文](https://blog.csdn.net/lovelion/article/details/17517213)，并加入了个人理解与代码实践。
:::
