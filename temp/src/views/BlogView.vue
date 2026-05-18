<template>
  <div class="blog-view">
    <header class="bamboo-header">
      <router-link to="/" class="bamboo-back-btn">
        ← 回竹屋
      </router-link>
      <h1 class="bamboo-page-title">
        {{ isPost ? postTitle : '日记 · 博客' }}
      </h1>
    </header>

    <div class="bamboo-content">
      <!-- 博客列表 -->
      <template v-if="!isPost">
        <div v-if="loading" class="loading-state">
          <p>正展卷…</p>
        </div>

        <TransitionGroup
          v-else
          name="post-list"
          tag="div"
          class="post-list"
        >
          <article
            v-for="post in posts"
            :key="post.slug"
            class="bamboo-card post-card"
            @click="openPost(post.slug)"
          >
            <time class="post-card__date">{{ post.date }}</time>
            <h2 class="post-card__title">{{ post.title }}</h2>
            <p v-if="post.excerpt" class="post-card__excerpt">
              {{ post.excerpt }}
            </p>
          </article>
        </TransitionGroup>

        <p v-if="!loading && posts.length === 0" class="empty-state">
          日记本尚是空白，待墨落纸间。
        </p>
      </template>

      <!-- 单篇博客详情 -->
      <template v-else>
        <div v-if="postLoading" class="loading-state">
          <p>翻页中…</p>
        </div>

        <article
          v-else-if="postContent"
          class="bamboo-card post-content"
        >
          <div class="markdown-body" v-html="postContent" />
        </article>

        <div v-else class="error-state">
          <p>此页乃无字天书。</p>
          <router-link to="/blog" class="bamboo-back-btn">
            返回日记列表
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'

const route = useRoute()
const router = useRouter()

interface Post {
  slug: string
  title: string
  date: string
  excerpt?: string
}

const posts = ref<Post[]>([])
const loading = ref(true)
const postContent = ref('')
const postLoading = ref(false)

const isPost = computed(() => !!route.params.slug)
const postTitle = computed(() => {
  if (!route.params.slug) return ''
  const p = posts.value.find(p => p.slug === route.params.slug)
  return p?.title ?? ''
})

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// 博客文章索引（实际项目中从文件系统或 API 获取）
// 此处展示数据结构；实际博客文章放在 src/content/posts/ 下
const postsIndex: Post[] = [
  {
    slug: 'hello-world',
    title: 'Hello, 竹屋',
    date: '2026-05-01',
    excerpt: '这是第一篇博客，欢迎来到我的竹屋。',
  },
]

// 模拟加载文章列表
async function loadPosts() {
  loading.value = true
  // 实际部署时，通过 Vite 的 import.meta.glob 动态加载 MD 文件
  // 这里使用静态索引
  posts.value = postsIndex
  loading.value = false
}

async function loadPost(slug: string) {
  postLoading.value = true
  postContent.value = ''

  try {
    // 尝试动态导入 Markdown 文件
    const module = await import(`@/content/posts/${slug}.md`)
    const raw = (module as any).default ?? ''
    postContent.value = md.render(typeof raw === 'string' ? raw : '')
  } catch {
    // fallback: 直接 fetch
    try {
      const resp = await fetch(`/src/content/posts/${slug}.md`)
      if (resp.ok) {
        const raw = await resp.text()
        postContent.value = md.render(raw)
      }
    } catch {
      postContent.value = ''
    }
  } finally {
    postLoading.value = false
  }
}

function openPost(slug: string) {
  router.push(`/blog/${slug}`)
}

// 响应式加载
loadPosts()

watch(
  () => route.params.slug,
  (slug) => {
    if (slug && typeof slug === 'string') {
      loadPost(slug)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.blog-view {
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    175deg,
    #f5f0e1 0%,
    #efe8d5 30%,
    #e8dfc8 100%
  );
  overflow: hidden;
}

/* 文章列表 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 2vw, 18px);
}

.post-card {
  cursor: pointer;
}

.post-card__date {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: 12px;
  color: #8b7750;
  opacity: 0.7;
  display: block;
  margin-bottom: 6px;
}

.post-card__title {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(16px, 2vw, 22px);
  font-weight: normal;
  color: #3a4a2a;
  margin: 0 0 8px;
  transition: color 0.2s;
}

.post-card:hover .post-card__title {
  color: #5a8a3a;
}

.post-card__excerpt {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(12px, 1.3vw, 14px);
  color: #6a6a6a;
  line-height: 1.6;
  margin: 0;
}

/* 博客正文 */
.post-content {
  cursor: default;
}

/* Markdown 渲染样式 */
.markdown-body {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(14px, 1.5vw, 16px);
  color: #3a3a3a;
  line-height: 1.9;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  font-weight: normal;
  color: #2d3a1a;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-body :deep(h1) {
  font-size: clamp(20px, 2.5vw, 28px);
}

.markdown-body :deep(h2) {
  font-size: clamp(16px, 2vw, 22px);
}

.markdown-body :deep(p) {
  margin: 0.8em 0;
}

.markdown-body :deep(code) {
  background: rgba(45, 74, 34, 0.06);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background: rgba(45, 74, 34, 0.06);
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid rgba(45, 74, 34, 0.25);
  margin: 1em 0;
  padding: 0.5em 1em;
  color: #5a6b4a;
  background: rgba(45, 74, 34, 0.04);
  border-radius: 0 4px 4px 0;
}

.markdown-body :deep(a) {
  color: #4a7a2a;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

/* 加载 / 空状态 */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: clamp(40px, 10vw, 80px) 20px;
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  color: #5a6b4a;
}

/* 列表过渡动画 */
.post-list-enter-active {
  transition: all 0.4s ease;
}

.post-list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
</style>
