# GitHub Pages 部署指南（自定义域名）

## 前提

- 一个 GitHub 账号
- 一个域名（你在其他平台注册的那个）
- 代码已经提交到 GitHub 仓库

---

## 第一步：在 GitHub 上建仓库

1. 打开 [github.com/new](https://github.com/new)
2. 仓库名建议用 `你的用户名.github.io`（比如 `Coltelli.github.io`），这是 GitHub Pages 的惯例；也可以用其他名字
3. 建好仓库后，把本地代码推上去：

```bash
cd L:\LLITECOL\CSdiy\PersonalWebsite\code

git init
git add .
git commit -m "init: yllite blog"

git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

---

## 第二步：构建项目

在本地运行构建：

```bash
npm install
npm run build
```

这会在 `dist/` 目录下生成静态文件。后面 CI 会自动构建，但第一次可以先手动确认能跑。

---

## 第三步：在 GitHub 仓库设置 Pages

1. 进到 GitHub 仓库 → **Settings** → **Pages**
2. **Source** 选 **GitHub Actions**（稍后有更省心的方案）
3. 先在 repo 里建一个 GitHub Actions 工作流，自动构建和部署

在 `.github/workflows/deploy.yml` 里放以下内容（我帮你创建好）：

<details>
<summary>点击展开 deploy.yml</summary>

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

</details>

---

## 第四步：绑定自定义域名

### 4.1 在 GitHub 仓库设置域名

1. 仓库 → **Settings** → **Pages**
2. 在 **Custom domain** 输入你的域名（如 `yllite.com` 或 `blog.yllite.com`）
3. 点击 **Save**
4. GitHub 会自动创建一个 DNS 记录检查，先不要关这个页面

### 4.2 去你的域名注册商配置 DNS

登录你买域名的平台（其他平台），添加以下 DNS 记录：

| 记录类型 | 主机记录 | 值 |
|---------|---------|----|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |
| CNAME | www | `你的用户名.github.io` |

如果你用的是子域名（如 `blog.yllite.com`），改成：

| 记录类型 | 主机记录 | 值 |
|---------|---------|----|
| CNAME | blog | `你的用户名.github.io` |

DNS 生效可能需要几分钟到几十分钟。

### 4.3 回到 GitHub 点 **Enforce HTTPS**

等 DNS 生效后，GitHub 的 **Enforce HTTPS** 会亮起，勾选它，自动签发 SSL 证书。

---

## 第五步：验证

等几分钟后，打开你的域名，应该就能看到博客了。

后续每次往 `main` 分支推送代码，GitHub Actions 会自动构建并部署，不需要手动操作。

---

## 常见问题

**Q：刷新文章页显示 404？**
我在 index.html 和 404.html 里已经加了 SPA 修复脚本，应该不会出现。如果还出现，检查 `public/404.html` 是否存在。

**Q：图片路径不对？**
图片放在 `public/images/` 下，Markdown 里用 `/images/xxx.jpg` 引用。不要用相对路径 `./images/xxx.jpg`。

**Q：域名带 www 打不开？**
加上 CNAME 记录 `www → 你的用户名.github.io` 即可。
