---
title: 将现有本地仓库添加为 Git Submodule（无远程）｜对话笔记
categories: 开发笔记
tags:
  - Git
  - Submodule
  - PowerShell
  - 操作记录
id: notes-git-submodule-local
date: 2026-08-03 17:52:03
---

## 背景

在本地有一个父仓库（示例路径 `/path/to/parent-repo`），其下有两个子目录 `blog-ui` 和 `howe-system`，每个子目录本身都是独立的 Git 仓库，但父仓库尚未将二者纳入版本管理。由于工作环境不涉及远程服务器，父仓库也不绑定任何远程地址，因此需要将这两个现有仓库作为子模块添加到父仓库中，且不能依赖克隆 URL。

Git 的标准命令 `git submodule add <url> <path>` 要求提供可克隆的远程地址，且目标路径必须为空或不存在。本地已有内容且无远程时，需要采用手动注入索引的方式。

本文记录完整的操作步骤、遇到的错误及修正方法，适用于 Windows 环境下的 PowerShell。

## 操作步骤

### 1. 确保子仓库状态干净

进入每个子目录，提交所有未保存的更改，保证工作树清洁。

```powershell
cd /path/to/parent-repo/blog-ui
git status
git add . && git commit -m "保存当前状态"

cd ../howe-system
git status
git add . && git commit -m "保存当前状态"
```

### 2. 从父仓库索引中移除子目录（保留工作目录）

回到父仓库根目录，执行 `git rm -r --cached` 将子目录从 Git 索引中删除，但**不删除磁盘上的实际文件**。

```powershell
cd /path/to/parent-repo
git rm -r --cached blog-ui
git rm -r --cached howe-system
git commit -m "从索引中移除子目录，准备添加为子模块"
```

此时，这两个目录在父仓库中变为未跟踪状态，但自身仍保留 `.git` 目录，仍然是独立的仓库。

### 3. 获取子仓库当前的 HEAD 提交哈希

使用 PowerShell 语法获取每个子仓库的最新提交哈希值。**注意**：不要使用 Bash 风格的 `$(...)` 赋值，PowerShell 应使用 `$变量 = 命令`。

```powershell
cd blog-ui
$hash_blog = git rev-parse HEAD
cd ..

cd howe-system
$hash_howe = git rev-parse HEAD
cd ..

# 检查变量（应显示 40 位十六进制）
echo $hash_blog
echo $hash_howe
```

### 4. 创建 `.gitmodules` 文件

在父仓库根目录创建 `.gitmodules`，内容如下（URL 可填本地相对路径或任意占位符，不会实际使用）：

```ini
[submodule "blog-ui"]
    path = blog-ui
    url = ./blog-ui
[submodule "howe-system"]
    path = howe-system
    url = ./howe-system
```

### 5. 手动将子模块条目加入索引

使用 `git update-index --add --cacheinfo` 命令，**参数必须用逗号分隔**，格式为 `<mode>,<sha1>,<path>`。

```powershell
git update-index --add --cacheinfo 160000,$hash_blog,blog-ui
git update-index --add --cacheinfo 160000,$hash_howe,howe-system
```

模式 `160000` 表示 Git 子模块的特殊文件模式。

### 6. 提交更改

```powershell
git add .gitmodules
git commit -m "将 blog-ui 和 howe-system 添加为子模块"
```

### 7. 验证

```powershell
git submodule status
```

正常输出会显示两个子模块的哈希和路径，例如：
```
+3a4b5c... blog-ui (heads/main)
+7d8e9f... howe-system (heads/main)
```

## 遇到的问题与修正

### 错误 1：变量赋值语法错误（Bash vs PowerShell）

初次使用 `hash_howe=$(git rev-parse HEAD)` 在 PowerShell 中会报错：
> 无法将“hash_howe=$(git rev-parse HEAD)”项识别为 cmdlet、函数……

**原因**：PowerShell 不识别 `$(...)` 作为命令替换，应用 `$hash_howe = git rev-parse HEAD`。

### 错误 2：`update-index` 参数格式错误

执行 `git update-index --add --cacheinfo 160000 $hash_howe howe-system` 报错：
> error: option 'cacheinfo' expects <mode>,<sha1>,<path>

**原因**：`--cacheinfo` 要求三个参数用**逗号**连接，而非空格。正确写法是 `160000,$hash_howe,howe-system`。

## 后续使用

### 更新子模块

当子模块内部有新的提交时，父仓库需要记录新的哈希：

```powershell
cd blog-ui
git add . && git commit -m "更新内容"
cd ..
git add blog-ui
git commit -m "更新子模块 blog-ui"
```

### 克隆父仓库时的处理

由于 `.gitmodules` 中的 URL 为相对路径或占位符，若要将仓库克隆到新机器，需先确保子模块目录存在且内容正确，或手动修改 URL 为可访问的路径。但本方案仅用于本地开发，不涉及克隆，因此可忽略。

## 总结

在无法（或无需）使用远程地址的情况下，通过手动操作 Git 索引和 `.gitmodules`，可以将已有的独立仓库转换为父仓库的子模块。关键点在于：

- 使用 `git rm -r --cached` 清理父仓库索引，但保留工作目录。
- 用 `git rev-parse HEAD` 获取子模块的提交哈希。
- 以逗号分隔格式执行 `git update-index --add --cacheinfo`。
- 创建 `.gitmodules` 并提交。

掌握这个方法后，即使没有远程仓库，也能灵活利用 Git 子模块的依赖管理能力，同时保留了原有仓库的完整历史。
