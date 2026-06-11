---
title: Vite 构建优化小记
date: 2026-05-10
category: 技术
description: 记录 Vite 项目从开发到生产部署过程中遇到的问题和优化策略。
tags: [Vite, 构建, 性能, 测试]
---

# Vite 构建优化小记

Vite 的开发体验很好，快到让人忘了 webpack 时代的等待。但生产构建有时会有些意外，这里记几个优化点。

## 分包策略

默认配置下，Vite 会把第三方库和你写的代码打包到一起，导致单个 chunk 很大。用 `manualChunks` 分一下：

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router'],
        utils: ['markdown-it'],
      },
    },
  },
},
```

## 图片处理

小图（< 4KB）直接用 base64 内联节省请求，大图用 `import.meta.url` 获取路径：

```ts
const imgUrl = new URL('./hero.png', import.meta.url).href
```

或者用 `?url` 后缀显式获取 URL，不经过编译处理。

## Tree Shaking

Vite 基于 esbuild 做预构建，Tree Shaking 已经很好了。要注意的是：

- 使用 ESM 版本的库（大多数现代库默认就是）
- 避免 `import * as` 的大范围导入
- 善用 `define` 替换环境变量，让死代码消除更彻底

## 总结

配置完之后，构建体积从 280KB 降到了 150KB 左右，首屏加载时间压缩在 1s 以内。成果还算满意。
