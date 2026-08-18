---
title: Git 完整命令手册｜从初始化到协作全流程
categories: Git
tags:
  - Git
  - 版本控制
  - 命令行
  - 团队协作
  - 代码管理
id: notes-git-commands-full-guide
date: 2026-08-18 14:55:16
recommend: true
---

Git 是现代软件开发中不可或缺的版本控制工具，无论是个人项目还是团队协作，掌握其核心命令和工作流程都能显著提升效率。本文按照实际开发顺序，整理了从仓库初始化到远程协作、分支管理、撤销回滚等全流程命令，并提供了可复用的实战示例，帮助你在日常工作中快速查阅和运用。

## 配置与初始化

开始使用 Git 前，需要设置全局用户信息，以便每次提交都能正确记录作者。

```bash
# 设置全局用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "email@example.com"

# 查看所有配置
git config --list
```

创建新仓库或克隆现有仓库：

```bash
# 在当前目录初始化本地仓库
git init

# 克隆远程仓库（完整历史）
git clone <仓库地址>

# 浅克隆（仅最近一次提交，适合大型仓库）
git clone --depth 1 <仓库地址>
```

## 基础快照操作（日常开发核心）

日常开发中最频繁的操作是查看状态、添加修改、提交版本。

```bash
# 查看工作区和暂存区状态（最常用）
git status

# 添加文件到暂存区
git add <文件名>      # 指定文件
git add .             # 当前目录所有变更
git add -A            # 所有变更（包括删除）

# 提交到本地仓库
git commit -m "提交信息"

# 跳过 add，直接提交已追踪文件的修改（不含新文件）
git commit -am "信息"

# 修改最近一次提交（信息或补充漏掉的文件）
git commit --amend -m "新信息"
```

## 分支管理

分支是 Git 的杀手级特性，支持并行开发和功能隔离。

```bash
# 查看分支
git branch             # 本地分支
git branch -a          # 本地+远程分支

# 创建分支
git branch <分支名>

# 切换分支（推荐新语法）
git switch <分支名>
git switch -c <分支名>   # 创建并切换

# 旧语法（仍可使用）
git checkout <分支名>
git checkout -b <分支名>

# 删除分支
git branch -d <分支名>   # 已合并时安全删除
git branch -D <分支名>   # 强制删除（慎用）

# 重命名当前分支
git branch -m <旧名> <新名>
```

## 远程协作

与团队共享代码时，需关联远程仓库并推送/拉取更新。

```bash
# 查看远程仓库
git remote -v

# 关联远程仓库
git remote add origin <仓库地址>

# 修改远程地址
git remote set-url origin <新地址>

# 推送本地分支到远程
git push origin <分支名>
git push -u origin <分支名>   # 首次推送并建立上游追踪（之后可直接 git push）

# 删除远程分支
git push origin --delete <分支名>

# 强制推送（覆盖远程，危险操作，团队中禁用）
git push --force

# 拉取远程更新（不合并）
git fetch origin

# 拉取并合并（等效 fetch + merge）
git pull

# 拉取并变基（保持线性历史，推荐团队使用）
git pull --rebase
```

## 合并与冲突解决

合并不同分支的代码时，可能会产生冲突，需要手动解决。

```bash
# 合并指定分支到当前分支
git merge <分支名>

# 变基当前分支到目标分支（线性历史）
git rebase <分支名>

# 调用差异工具解决冲突（如 VSCode）
git mergetool

# 查看差异
git diff                  # 工作区未暂存的改动
git diff --staged         # 已暂存与上次提交的差异
git diff <分支1> <分支2>  # 两个分支的差异
```

> **冲突解决流程**：手动修改冲突文件 → `git add .` → `git commit`（merge 场景）或 `git rebase --continue`（rebase 场景）。

## 撤销与回滚

Git 提供了多种撤销操作，从丢弃工作区修改到安全回滚公共提交。

```bash
# 丢弃工作区修改（未 add 时）
git restore <文件名>

# 将文件从暂存区撤回（保留本地修改）
git restore --staged <文件名>

# 撤销提交（保留修改）
git reset --soft HEAD~1   # 保留在暂存区
git reset --mixed HEAD~1  # 保留在工作区（默认）

# 强制回退（丢失修改，慎用）
git reset --hard HEAD~1   # 回退到上一个版本
git reset --hard <commit_id>  # 回退到指定提交

# 安全撤销（新增反向提交）
git revert <commit_id>    # 公共分支推荐

# 临时暂存未提交的修改（切换分支时）
git stash
git stash pop            # 恢复并删除暂存记录
git stash list           # 查看暂存列表
```

## 查看历史记录

追溯提交历史和文件变更，是调试和审计的重要工具。

```bash
# 完整提交历史
git log

# 简约版（一行一次提交）
git log --oneline

# 图形化展示所有分支结构
git log --graph --oneline --all

# 本地所有操作历史（终极后悔药）
git reflog

# 查看文件每行的最后修改者（找问题归属）
git blame <文件名>
```

## Tag 标签（版本发布）

为重要版本打标签，便于发布和回滚。

```bash
# 列出所有标签
git tag

# 创建带注释的标签
git tag -a v1.0 -m "版本说明"

# 推送标签到远程
git push origin v1.0
git push origin --tags   # 推送所有本地标签

# 删除标签
git tag -d v1.0          # 本地删除
git push origin --delete v1.0  # 远程删除
```

## 完整实战流程示例

以下是一个典型的功能开发全流程，涵盖了分支创建、提交、同步、合并和清理。

```bash
# 1. 克隆项目
git clone git@github.com:user/project.git
cd project

# 2. 创建并切换到新功能分支
git switch -c feature/new-login

# 3. 编码并提交
git status
git add .
git commit -m "feat: 增加短信登录接口"

# 4. 首次推送并设置上游
git push -u origin feature/new-login

# 5. 继续开发
git add .
git commit -m "feat: 完善登录校验"

# 6. 合并前同步主分支最新代码
git switch main
git pull --rebase   # 或 git pull
git switch feature/new-login

# 7. 变基到主分支（保持线性历史）
git rebase main
# 若冲突：解决后执行 git add . && git rebase --continue

# 8. 推送最终代码（变基后需强制推送，仅限个人分支）
git push -f

# 9. 合并到主分支并推送
git switch main
git merge feature/new-login
git push

# 10. 清理本地和远程功能分支
git branch -d feature/new-login
git push origin --delete feature/new-login
```

## 避坑指南与最佳实践

- **公共分支禁止强制推送**：`git push -f` 会覆盖远程历史，在多人协作的主分支（main/master）上绝对禁用。
- **误操作恢复**：若执行了 `git reset --hard` 丢失提交，立刻使用 `git reflog` 找到丢失的 commit id，再用 `git reset --hard <id>` 恢复。
- **提交信息规范**：建议遵循约定式提交（如 `feat:`、`fix:`、`docs:`），便于生成 changelog 和自动化版本管理。
- **优先使用 `git pull --rebase`**：代替默认的 `git pull`，可以避免产生不必要的合并提交，保持历史干净。
- **定期清理分支**：合并后的功能分支应及时删除，避免仓库杂乱。

掌握以上命令和流程，足以应对绝大多数 Git 使用场景。若遇到更复杂的情况（如交互式变基、子模块等），可在此基础上进一步深入学习。
