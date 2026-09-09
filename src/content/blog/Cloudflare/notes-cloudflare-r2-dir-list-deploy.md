---
title: Cloudflare R2 图床目录列表部署实录｜踩坑与修复
categories: Cloudflare
tags:
  - Cloudflare
  - R2
  - Workers
  - TypeScript
  - 部署
id: notes-cloudflare-r2-dir-list-deploy
date: 2026-09-09 09:58:42
---

使用 Cloudflare R2 搭建图床后，如果想通过自定义域名直接查看存储桶内的文件列表，官方并未提供内置的目录浏览功能。社区开源项目 `r2-dir-list` 通过 Cloudflare Workers 实现了轻量级的文件索引页面，本文将记录完整的部署过程及踩坑修复经验。

## 背景与需求

- 已有一个 R2 存储桶 `pic-bed`，绑定了自定义域名 `img.example.com`
- 存储桶内按路径组织文件，例如 `img/photo1.jpg`
- 希望访问 `https://img.example.com/` 时能列出根目录下的文件夹和文件，点击文件夹能进入下一级

## 方案选择

在多个类似的 Workers 脚本中，最终选择 `r2-dir-list`（GitHub: cmj2002/r2-dir-list），因为它简洁、配置灵活，且提供美观的目录列表界面。

## 部署步骤

### 1. 克隆项目并安装依赖

```bash
git clone https://github.com/cmj2002/r2-dir-list.git
cd r2-dir-list
npm install
```

### 2. 配置 wrangler.toml

复制示例文件并编辑：

```bash
mv wrangler.toml.example wrangler.toml
```

关键配置项：

```toml
name = "r2-dir-list"
main = "src/index.ts"
compatibility_date = "2023-03-01"
workers_dev = false
routes = [
  { pattern = "img.example.com/*", zone_name = "example.com" }
]

r2_buckets = [
  { binding = "BUCKET_pic_bed", bucket_name = "pic-bed" }
]
```

- `routes.pattern` 必须带 `/*` 后缀
- `r2_buckets.binding` 为 Worker 中访问存储桶的变量名，`bucket_name` 为实际的 R2 存储桶名称

### 3. 配置 src/config.ts

复制示例并编辑：

```bash
mv src/config.ts.example src/config.ts
```

```typescript
import { Env, SiteConfig } from './types';

export function getSiteConfig(env: Env, domain: string): SiteConfig | undefined {
  const configs: {[domain: string]: SiteConfig} = {
    'img.example.com': {
      name: "我的图床",
      bucket: env.BUCKET_pic_bed,
      desp: {
        '/': "个人图片存储",
      },
      showPoweredBy: true,
      decodeURI: true,
    },
  };
  return configs[domain];
}
```

注意 `bucket` 字段必须与 `wrangler.toml` 中的 `binding` 完全一致。

### 4. 登录并部署

```bash
wrangler login
wrangler deploy
```

## 遭遇的坑与修复

### 坑一：部署后访问报错 Error 1101

访问 `https://img.example.com/` 时出现 Cloudflare 1101 错误（Worker 运行时异常）。

**排查过程**：
- 查看 Worker 日志（Cloudflare Dashboard → Workers & Pages → 对应 Worker → Logs）发现类似 `env.BUCKET_pic-bed is not a function` 的错误。
- 定位到 `config.ts` 中 `bucket: env.BUCKET_pic-bed`，JavaScript 中变量名不能包含连字符 `-`，点号访问会被解析为减法运算，导致 `env.BUCKET_pic` 减 `bed` 返回 `NaN`。

**修复**：将绑定名中的 `-` 改为 `_`，统一使用下划线。

- `wrangler.toml` 中改为 `{ binding = "BUCKET_pic_bed", bucket_name = "pic-bed" }`
- `config.ts` 中改为 `bucket: env.BUCKET_pic_bed`

重新部署后正常访问。

### 坑二：点击文件夹触发下载

部署成功后，根目录显示了 `img` 文件夹（实际是 R2 中一个键为 `img/` 的零字节对象）。点击该文件夹时，浏览器直接弹出下载，而非进入子目录列表。

**原因分析**：
- R2 为模拟目录结构，允许创建以 `/` 结尾的空对象作为“目录占位符”。
- `r2-dir-list` 的 `shouldReturnOriginResponse` 函数逻辑为：如果请求路径以 `/` 结尾，且 R2 返回了非 404 响应（即使是 0 字节文件），则直接返回该响应，不生成列表。
- 因此访问 `https://img.example.com/img/` 时，R2 返回了该零字节对象，Worker 直接将其返回，浏览器收到空内容后触发下载。
- 访问 `https://img.example.com/img`（无斜杠）则因为键 `img` 不存在而返回 404。

**解决方案**：

**方案一（推荐）**：删除 R2 中的零字节占位符对象
- 进入 Cloudflare R2 控制台，找到 `pic-bed` 存储桶，删除键为 `img/` 的对象。
- 之后访问 `/img/` 时 R2 返回 404，Worker 进入列表生成逻辑，正常显示 `img/` 下的文件列表。

**方案二**：启用 `dangerousOverwriteZeroByteObject`
- 在 `config.ts` 中为对应站点添加配置：`dangerousOverwriteZeroByteObject: true`
- 这样即使存在零字节对象，Worker 也会忽略它，强制生成目录列表。

**方案三**：增加自动添加尾部斜杠的重定向（提升体验）
- 在 `src/index.ts` 的 `fetch` 函数开头加入：

```typescript
const url = new URL(request.url);
const pathname = url.pathname;
if (!pathname.endsWith('/') && !pathname.includes('.')) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = pathname + '/';
    return new Response(null, {
        status: 301,
        headers: { 'Location': redirectUrl.toString() }
    });
}
```

这样访问 `img` 会自动跳转到 `img/`，配合删除占位符或方案二，即可完美运行。

## 最终效果

- 访问根域名显示存储桶根目录下的文件夹和文件列表
- 点击文件夹正常进入子目录，并显示其中的图片文件
- 点击图片直接访问原图（因为 R2 已配置公读权限）

## 经验总结

1. **绑定命名规范**：Cloudflare Workers 中的环境变量名（绑定名）应仅包含字母、数字和下划线，避免使用连字符，否则在 JavaScript 中会被解释为减号。
2. **R2 的目录是“伪”的**：理解 R2 通过键前缀和零字节占位符模拟目录，才能正确处理目录请求。
3. **善用日志**：遇到 Worker 报错时，先查看 Live Logs，能快速定位异常堆栈。
4. **小修改需重部署**：每次修改 `wrangler.toml` 或 `config.ts` 后，必须重新运行 `wrangler deploy` 使更改生效。

若你也在使用 R2 配合 Workers 搭建个人图床，希望本文能帮你避开同样的坑。
