# 王艳涛的博客 · Astro Blog

一个以 Markdown 为内容源、构建期静态生成的技术博客。站点包含文章、分类、标签、归档、推荐、关于、友链、碎片说说与公告等页面，支持评论、搜索、响应式布局与页面过渡。

技术栈以 **Astro 5 + TypeScript + Less** 为核心，评论使用 **Waline**，交互脚本使用原生 TypeScript，动效使用 **Swup**。

## 功能

- 文章阅读：Markdown / MDX、代码高亮、目录、阅读时间、上一篇 / 下一篇
- 内容组织：分类、标签、归档、推荐、置顶与文章搜索
- 独立页面：关于、留言、友链、碎片说说、公告
- 评论系统：Waline（当前已启用）
- 全站搜索：构建时生成 `vh-search.json`，前端按关键词即时过滤
- 响应式布局、图片懒加载与灯箱预览
- 页面无刷新过渡（Swup）与返回顶部
- RSS、Sitemap、robots.txt 与 SEO 元信息
- 首页动态着色器背景（React 组件，仅用于该视觉模块）

## 技术栈

| 分类 | 技术 |
|---|---|
| 静态站点框架 | Astro 5 |
| 语言 | TypeScript |
| 样式 | Less |
| 内容格式 | Markdown / MDX |
| 交互增强 | 原生 TypeScript、Swup |
| 评论 | Waline |
| 搜索 | 静态 JSON 索引 + 前端过滤 |
| 着色器背景 | React + `@paper-design/shaders-react` |
| 图标 | 内联 SVG |
| 部署 | Cloudflare Pages / Workers 静态资源 |

## 快速开始

### 环境要求

- Node.js 18+
- npm

```bash
npm install
npx astro dev
```

访问 `http://localhost:4321`。

### 构建

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`。

## 内容与配置

- 站点标题、描述、作者、头像、导航、评论、统计等配置集中在 `src/config.ts`
- 文章位于 `src/content/blog/`，支持 Markdown 与 MDX
- 文章元数据（frontmatter）至少包含 `title`、`date`、`categories`、`id`
- 文章 URL 由 frontmatter 的 `id` 决定，修改文件名不会改变文章地址，因此 `id` 必须全局唯一且 URL 安全

示例：

```yaml
---
title: 示例文章
date: 2026-01-01 10:00:00
categories: 技术随笔
tags:
  - Astro
id: example-post
---
```

友链、朋友圈、说说与公告从后端 `/blog/public/*` 接口读取；后端地址在 `src/config.ts` 的 `BlogApi` 中配置。接口不可用时页面会显示明确的加载失败状态，不会静默留空。

## 目录结构

```text
src/
├─ components/   # 页面组件、文章卡片、搜索、评论等
├─ content/      # Markdown / MDX 文章
├─ layouts/      # 页面布局
├─ pages/        # 文件路由
├─ plugins/      # Markdown 自定义插件
├─ scripts/      # 搜索、主题、评论、列表等交互脚本
├─ styles/       # 全局样式与主题
├─ type/         # 类型定义
└─ utils/        # 工具函数

public/          # 图片、图标、字体等静态资源
script/          # 新建文章等维护脚本
```

## 部署

### Cloudflare Pages

1. 在 Cloudflare Pages 中连接 Git 仓库
2. 构建命令填写 `npm run build`
3. 输出目录填写 `dist`
4. 在域名与 DNS 中完成自定义域名配置

`wrangler.jsonc` 也可用于 Workers 静态资源部署；生产环境请按实际使用的 Cloudflare 产品选择部署方式。

## 发布前检查

- 修改 `src/config.ts` 中的站点域名、作者与社交链接
- 确认 Waline 评论服务已部署且 `serverURL` 可访问
- 确认后端 `BlogApi.baseURL` 可访问，且已配置 CORS
- 检查 `public/` 中的图片、favicon 与分享封面
- 确认文章 `id` 全局唯一，frontmatter 字段完整
- 执行 `npm run build`，确认静态构建无报错

## 相关项目

- [howe-system](https://github.com/howello/howe-system)：博客后台、文章同步与公开接口
- [meal-ui](https://github.com/howello/meal-ui)：家庭点餐端

## License

内容版权归作者所有。站点主题基于 vhAstro-Theme 二次开发，主题代码遵循其 MIT License。
