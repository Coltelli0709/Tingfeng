# 听风 · Coltelli 的一隅自留地

蓝白配色的个人博客，基于 Vue 3 + Vite，支持 Markdown 文章、版块导航、分类/时间筛选、文章目录、友链。

## 目录结构

```
code/
├── blog/                      # ← 所有博客文章放这里
│   ├── 版块A/                 #    文件夹名 = 导航栏版块
│   │   ├── 文章1.md
│   │   └── 文章2.md
│   ├── 版块B/
│   │   └── 文章3.md
│   └── ...                    #    想加版块就建新文件夹
├── friends.md                 # ← 友链清单（左侧功能栏「友链」读取）
├── src/                       # 源码（不用动）
│   ├── components/
│   ├── views/
│   ├── utils/posts.ts         # 自动扫描 blog/ 下的 .md
│   ├── utils/friends.ts       # 解析 friends.md
│   ├── utils/toc.ts           # 文章目录
│   └── ...
├── public/
│   └── images/                # 博客文章引用的图片放这里
├── package.json
├── vite.config.ts
└── README.md
```

## 写文章

1. 在 `blog/` 下找到对应的版块文件夹，没有就新建一个
2. 在里面创建 `.md` 文件，开头写 frontmatter：

```markdown
---
title: 文章标题
date: 2026-06-01
cover: /images/xxx.jpg        # 可选，文章封面图
description: 一句话简介
tags: [标签1, 标签2]
category: 随笔                # 可选，子分类标签，不写则用版块名
---

正文写在这里，支持 Markdown 语法。
图片用 ![](/images/xxx.jpg)。
```

3. `git add && git commit && git push`，自动部署

## 友链

左侧功能栏的「友链」按钮读取根目录的 `friends.md`。新增友链时往该文件末尾追加一段：

```markdown
## 名字
url: https://对方的网站
avatar: https://头像图片地址     # 可留空，留空显示名字首字
desc: 一句话介绍                  # 可留空
```

一条友链以 `## 名字` 开头，其下的 `url / avatar / desc` 归属于它；段与段之间空一行即可。

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

## 版块

`blog/` 下的每个文件夹自动成为一个版块（导航栏）。首页默认展示 `DIARY-new` 版块，点导航栏「所有」才展示全部文章。

## 文章目录

文章页宽屏时右侧显示粘性目录，点击标题跳转、滚动时高亮当前小节；窄屏自动隐藏。

## 时间筛选

访问首页时，可用「从 YYMMDD — 到 YYMMDD」按日期范围筛选文章，与版块/分类筛选叠加使用。
