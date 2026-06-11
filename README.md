# 听风 · Coltelli 的一隅自留地

蓝白配色的个人博客，基于 Vue 3 + Vite，支持 Markdown 文章、专栏分类、时间筛选。

## 目录结构

```
code/
├── post/                      # ← 所有博客文章放这里
│   ├── 专栏A/                 #    文件夹名 = 专栏名
│   │   ├── 文章1.md
│   │   └── 文章2.md
│   ├── 专栏B/
│   │   └── 文章3.md
│   └── ...                    #    想加专栏就建新文件夹
├── src/                       # 源码（不用动）
│   ├── components/
│   ├── views/
│   ├── utils/posts.ts         # 自动扫描 post/ 下的 .md
│   └── ...
├── public/
│   └── images/                # 博客文章引用的图片放这里
├── package.json
├── vite.config.ts
└── README.md
```

## 写文章

1. 在 `post/` 下找到对应的专栏文件夹，没有就新建一个
2. 在里面创建 `.md` 文件，开头写 frontmatter：

```markdown
---
title: 文章标题
date: 2026-06-01
cover: /images/xxx.jpg        # 可选，文章封面图
description: 一句话简介
tags: [标签1, 标签2]
---

正文写在这里，支持 Markdown 语法。
图片用 ![](/images/xxx.jpg)。
```

3. `git add && git commit && git push`，自动部署

## 图片

放在 `public/images/` 下，文章里引用路径为 `/images/xxx.jpg`。

## 本地开发

```bash
npm install
npm run dev       # 本地预览
npm run build     # 构建产物在 dist/
```

## 技术栈

- Vue 3 + Composition API
- Vite 5
- vue-router (createWebHistory)
- markdown-it
- GSAP（页面动画）
- Canvas（鱼群背景动画）
- 不蒜子（访客统计）
- GitHub Pages 部署 + GitHub Actions

## 专栏

`post/` 下的每个文件夹自动成为一个专栏（分类）。文章无需在 frontmatter 中写 `category`，专栏名即文件夹名。

## 时间筛选

访问首页时，可用「从 YYMMDD — 到 YYMMDD」按日期范围筛选文章，与专栏筛选叠加使用。
