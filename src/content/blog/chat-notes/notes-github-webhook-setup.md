---
title: GitHub Webhook 创建与密钥生成｜对话笔记
categories: 开发笔记
tags:
  - GitHub
  - Webhook
  - 密钥生成
  - 开发工具
id: notes-github-webhook-setup
date: 2026-08-03 17:48:46
---

## 背景

在 GitHub 仓库中配置 Webhook 是连接外部服务（如 CI/CD、自动化脚本）的常见需求。配置过程中需要明确 Webhook 的触发事件、Payload URL，并通常需要设置一个 `Secret` 密钥来验证请求真实性。本文整理 Webhook 的创建步骤，并重点说明如何生成本地安全密钥，同时补充 GitHub 上其他常见密钥类型（SSH、Personal Access Token）的用途与生成方式。

## GitHub Webhook 创建步骤

1. 进入仓库主页，点击 **Settings** 选项卡。
2. 在左侧边栏选择 **Webhooks**，然后点击 **Add webhook**。
3. 填写关键字段：
   - **Payload URL**：接收事件数据的服务器端点地址。
   - **Content type**：推荐 `application/json`。
   - **Secret**（可选但强烈建议）：自定义字符串，用于服务端验证请求来源。
   - **触发事件**：可选择仅 `push` 或手动勾选多个事件。
   - **Active**：保持勾选使 Webhook 立即生效。
4. 点击 **Add webhook** 保存。创建后 GitHub 会发送一个 `ping` 事件测试连通性。

## Webhook Secret 密钥生成方法

`Secret` 字段无强制长度或格式要求，但建议使用高强度的随机字符串（如 256 位 / 32 字节）。推荐在本地终端生成，避免在线工具泄露风险。

**生成 64 位十六进制字符串（兼容性好）**：
```bash
openssl rand -hex 32
```

**生成 Base64 字符串**：
```bash
openssl rand -base64 32
```

**使用 Python**：
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**使用 Node.js**：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

生成后的字符串（例如 `<YOUR_SECRET>`）需粘贴到 Webhook 设置的 `Secret` 框中，并同时在服务端代码中用相同密钥验证 `X-Hub-Signature-256` 请求头。

## GitHub 其他常见密钥类型

除 Webhook Secret 外，GitHub 还常用以下两种密钥：

### SSH 密钥
用于免密码操作 Git 仓库（推送/拉取）。生成方式：
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
将公钥（`~/.ssh/id_ed25519.pub`）添加到 GitHub 账号的 **Settings → SSH and GPG keys** 中。

### Personal Access Token (PAT)
用于 API 访问或替代密码（尤其启用 2FA 后）。在 GitHub 网页端生成：**Settings → Developer settings → Personal access tokens**，选择权限与有效期，生成后立即保存令牌（仅显示一次）。

## 安全提醒

- 不同服务使用不同的密钥，避免复用。
- 密钥不应硬编码在代码中，建议使用环境变量。
- 定期轮换密钥，设置合理过期时间。
- 生产环境务必使用本地生成的强随机密钥，切勿使用示例值。
