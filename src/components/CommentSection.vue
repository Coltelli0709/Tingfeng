<template>
  <section v-if="enabled" class="comments">
    <header class="comments__head">
      <h2 class="comments__title">评论</h2>
      <span class="comments__meta">留下一点痕迹</span>
    </header>
    <div ref="elRef" class="comments__body" />
  </section>

  <!-- 开发时提醒：还没填服务端地址 -->
  <p v-else-if="isDev" class="comments__setup">
    评论区未启用：部署 Waline 后，把服务端地址填到
    <code>src/utils/comments.ts</code> 的 <code>WALINE_SERVER_URL</code>。
  </p>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { init } from '@waline/client'
import '@waline/client/style'
import { WALINE_SERVER_URL } from '@/utils/comments'

const props = defineProps<{
  /** 评论归属路径，例如 /blog/261113 */
  path: string
}>()

const enabled = WALINE_SERVER_URL.trim().length > 0
const isDev = import.meta.env.DEV

const elRef = ref<HTMLElement | null>(null)
let instance: ReturnType<typeof init> | null = null

function mount() {
  if (!enabled || !elRef.value) return

  instance?.destroy()
  instance = null
  elRef.value.innerHTML = ''

  instance = init({
    el: elRef.value,
    serverURL: WALINE_SERVER_URL.replace(/\/+$/, ''),
    path: props.path,
    lang: 'zh-CN',
    // 不强制登录：填个昵称就能留言，朋友和路人都方便
    login: 'disable',
    requiredMeta: ['nick'],
    reaction: true,
    // 没配图床时先关掉上传，免得点一下报错
    imageUploader: false,
  })
}

onMounted(mount)

// 文章间跳转时组件复用，换 path 要重建评论框
watch(() => props.path, mount)

onUnmounted(() => {
  instance?.destroy()
  instance = null
})
</script>

<style scoped>
.comments {
  position: relative;
  z-index: 1;
  max-width: var(--max-width);
  margin: 64px auto 0;
  padding-top: 28px;
  border-top: 1px solid var(--border);
}

.comments__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.comments__title {
  font-family: var(--font-sans);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gray-800);
}

.comments__meta {
  font-size: 0.74rem;
  color: var(--gray-400);
}

/* 跟随站点的蓝白配色 */
.comments__body {
  --waline-theme-color: #4f779e;
  --waline-active-color: #3f6488;
  --waline-color: #1e293b;
  --waline-bg-color: #ffffff;
  --waline-bg-color-light: #f8fafc;
  --waline-bg-color-hover: #f2f7fb;
  --waline-border-color: #e2e8f0;
  --waline-disable-bg-color: #f8fafc;
  --waline-info-bg-color: #f8fafc;
  --waline-info-color: #94a3b8;
  --waline-font-size: 0.92rem;
  --waline-border-radius: 10px;
}

.comments__setup {
  max-width: var(--max-width);
  margin: 56px auto 0;
  padding-top: 20px;
  font-size: 0.78rem;
  color: var(--gray-400);
  border-top: 1px dashed var(--border);
}

.comments__setup code {
  padding: 1px 5px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--blue-800);
  background: var(--gray-100);
  border-radius: 4px;
}
</style>
