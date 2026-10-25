# 听风 · Coltelli 的一隅自留地

蓝白配色的个人博客，基于 Vue 3 + Vite。首页以「文件夹卡片」总览所有版块，点击卡片进入该版块的文章列表；支持 Markdown 文章、分类/时间筛选、文章目录、友链。

## 目录结构

```
code/
├── blog/                      # ← 所有博客文章放这里
│   ├── 版块A/                 #    文件夹名 = 版块 = 首页的一张卡片
│   │   ├── cover.jpg          #    可选：该版块卡片封面（根目录）
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
- Canvas（鱼群背景动画，鱼群会缓慢向鼠标靠拢）
- 不蒜子（访客统计）
- GitHub Pages 部署 + GitHub Actions

## 首页分类卡片

打开网站时，首页中间展示 `blog/` 下每个文件夹对应的卡片：

- 卡片区上方是全站**最新文章**卡片，点击直接进入最新发布的那篇文章（不分文件夹）
- 一个文件夹 = 一张卡片，按文件夹内**最新文章的日期**降序排列
- 卡片只显示文件夹名、最新文章标题、文章数与最后更新日期
- 点击卡片进入该文件夹的文章列表（地址形如 `/?section=版块A`），可继续按分类/时间筛选
- 列表页左上角的「← 全部分类」返回卡片总览

左侧栏是列表式功能导航：「总览」回到卡片页，「友链」「关于」打开悬浮面板，「顶部」回到页首。

## 文件夹封面

想让某个版块的卡片显示封面，把图片命名为 `cover.jpg` 放到该版块文件夹的**根目录**即可，例如：

```
blog/DIARY-new/cover.jpg
```

构建时会自动扫描并作为卡片封面，按 **4:3（宽:高）** 裁切显示在文字白框上方；没有封面时显示纯文字卡片。也兼容 `cover.jpeg` / `cover.png` / `cover.webp`。

## 文章目录

文章页宽屏时右侧显示粘性目录，点击标题跳转、滚动时高亮当前小节；窄屏自动隐藏。

## 阅读页背景

文章阅读页在页面两侧渲染灰蓝色线条风格的竹影（`src/components/BambooShadow.vue`），宽屏可见，较窄屏幕自动淡化或隐藏，不影响正文可读性。

## 时间筛选

进入某个版块的文章列表后，可用「从 YYMMDD — 到 YYMMDD」按日期范围筛选文章，与分类筛选叠加使用。
