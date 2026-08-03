---
title: GitHub CI/CD 构建 Docker 镜像并推送至 Docker Hub｜对话笔记
categories: 开发笔记
tags:
  - CI/CD
  - Docker
  - GitHub Actions
  - 自动化部署
  - 开发笔记
id: notes-github-cicd-dockerhub
date: 2026-08-03 17:42:36
---

## 背景

在日常开发中，将应用容器化并自动推送到镜像仓库是持续集成流水线的常见需求。本文记录如何利用 GitHub Actions 在代码推送时自动构建 Docker 镜像，并将其上传到 Docker Hub。整个过程涉及密钥配置、工作流编写以及一些最佳实践，适合需要快速搭建自动化构建流程的开发者参考。

## 前置准备：获取 Docker Hub 凭证

Docker Hub 已不再支持通过密码直接登录 CI 环境，推荐使用**访问令牌（Access Token）**。操作路径如下：

1. 登录 Docker Hub，进入 **Account Settings** → **Security**。
2. 点击 **New Access Token**，设置名称并勾选 **Read/Write** 权限。
3. 生成后**立即复制并妥善保存**令牌（关闭页面后无法再查看）。

## 存储密钥：GitHub Secrets 配置

将 Docker Hub 凭证存入 GitHub 仓库的 Secrets 中，避免明文暴露。具体步骤：

- 进入仓库 **Settings** → **Secrets and variables** → **Actions**。
- 添加两个 Repository Secret：
  - `DOCKER_USERNAME`：Docker Hub 用户名。
  - `DOCKER_PASSWORD`：上一步生成的访问令牌。

## 工作流核心文件

在仓库根目录下创建 `.github/workflows/docker-publish.yml`，这是 GitHub Actions 的配置文件。以下是一个完整示例，已包含常用功能。

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ "main" ]   # 触发分支，可按需调整为 master

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/my-app:latest
            ${{ secrets.DOCKER_USERNAME }}/my-app:${{ github.sha }}
```

### 步骤解析

| 步骤 | 作用 |
|------|------|
| `actions/checkout` | 拉取当前仓库代码，供后续构建使用 |
| `docker/login-action` | 使用 Secrets 中的凭证登录 Docker Hub |
| `docker/setup-buildx` | 启用 Buildx，支持多平台构建和高级缓存 |
| `docker/build-push-action` | 根据 `Dockerfile` 构建镜像，`push: true` 表示构建完成后直接推送 |

> **注意**：`tags` 中同时指定了 `latest` 和基于 commit SHA 的标签，便于版本追溯。

## 触发与验证

将工作流文件提交并推送到仓库（如 `main` 分支）后，GitHub Actions 会自动运行。

- 在仓库的 **Actions** 选项卡可查看执行日志，包含构建和推送的详细输出。
- 成功执行后，登录 Docker Hub 即可在对应仓库下看到新推送的镜像标签。

## 进阶建议

- **增加测试环节**：可在推送前先构建不带 `push` 的镜像用于测试，通过后再进行推送。
- **利用缓存加速**：`docker/build-push-action` 默认开启 GitHub Actions 的内置缓存，可显著缩短后续构建时间。
- **语义化版本标签**：除 `latest` 和 SHA 外，还可结合 Git 标签（如 `v1.0.0`）生成对应镜像标签，便于版本管理。
- **敏感信息分离**：对于非敏感的配置（如镜像名），可使用 GitHub Variables 而非 Secrets，简化管理。

## 结语

通过上述配置，即可实现代码提交即自动构建并推送镜像到 Docker Hub。这套流程同样适用于其他容器仓库（如阿里云 ACR、Google Container Registry），只需替换登录动作和镜像标签即可。

如有更复杂的构建需求（如多平台、多阶段构建），可参考官方 `docker/build-push-action` 的文档进行扩展。
