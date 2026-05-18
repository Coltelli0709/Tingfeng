<template>
  <div class="post-page">
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="loading" class="post-page__loading">
        <div class="post-page__spinner" />
        <p>加载中…</p>
      </div>

      <!-- 错误 / 不存在 -->
      <div v-else-if="!post" class="post-page__error">
        <h2>未找到文章</h2>
        <p>可能已被删除，或链接有误。</p>
        <router-link to="/" class="post-page__back-link">← 返回首页</router-link>
      </div>

      <!-- 文章正文 -->
      <template v-else>
        <article class="post-article">
          <!-- 标题区 -->
          <header class="post-article__header">
            <div class="post-article__meta">
              <time>{{ post.date }}</time>
              <span class="post-article__category">{{ post.category }}</span>
            </div>
            <h1 class="post-article__title">{{ post.title }}</h1>
            <div
              v-if="post.tags && post.tags.length"
              class="post-article__tags"
            >
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="post-article__tag"
              >{{ tag }}</span>
            </div>
            <!-- 封面图（加载失败时隐藏） -->
            <img
              v-if="showPostCover"
              :src="post.cover"
              :alt="post.title"
              class="post-article__cover"
              @error="postCoverBroken = true"
            />
          </header>

          <!-- Markdown 正文 -->
          <section class="post-article__body">
            <MarkdownRenderer :content="post.content" />
          </section>

          <!-- 底部导航 -->
          <footer class="post-article__footer">
            <router-link to="/" class="post-article__back-link">
              ← 返回文章列表
            </router-link>
            <router-link
              v-if="prevPost"
              :to="`/post/${prevPost.slug}`"
              class="post-article__adjacent"
            >
              ← {{ prevPost.title }}
            </router-link>
            <router-link
              v-if="nextPost"
              :to="`/post/${nextPost.slug}`"
              class="post-article__adjacent post-article__adjacent--next"
            >
              {{ nextPost.title }} →
            </router-link>
          </footer>
        </article>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { allPosts, getPostBySlug } from '@/utils/posts'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const route = useRoute()

const loading = ref(true)
const post = ref<(typeof allPosts)[number] | null>(null)
const postCoverBroken = ref(false)

const showPostCover = computed(
  () => !!post.value?.cover && !postCoverBroken.value,
)

// 上下篇导航
const currentIndex = computed(() =>
  post.value ? allPosts.findIndex((p) => p.slug === post.value!.slug) : -1,
)
const prevPost = computed(() =>
  currentIndex.value > 0 ? allPosts[currentIndex.value - 1] : null,
)
const nextPost = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < allPosts.length - 1
    ? allPosts[currentIndex.value + 1]
    : null,
)

function loadPost(slug: string | string[]) {
  loading.value = true
  postCoverBroken.value = false
  const s = Array.isArray(slug) ? slug[0] : slug
  post.value = getPostBySlug(s) ?? null
  if (post.value) {
    document.title = `${post.value.title} · 听风`
  }
  loading.value = false
}

watch(
  () => route.params.slug,
  (slug) => {
    if (slug) loadPost(slug)
  },
  { immediate: true },
)
</script>

<style scoped>
.post-page {
  padding-top: 32px;
  padding-bottom: 64px;
  min-height: calc(100vh - var(--header-height));
}

/* 加载状态 */
.post-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 20px;
  color: var(--gray-400);
}

.post-page__spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--gray-200);
  border-top-color: var(--blue-700);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误 */
.post-page__error {
  text-align: center;
  padding: 80px 20px;
}

.post-page__error h2 {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  color: var(--gray-800);
  margin-bottom: 8px;
}

.post-page__error p {
  color: var(--gray-500);
  margin-bottom: 20px;
}

/* 文章主体 */
.post-article {
  max-width: var(--max-width);
  margin: 0 auto;
}

/* 标题区 */
.post-article__header {
  margin-bottom: 40px;
}

.post-article__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: var(--gray-400);
}

.post-article__category {
  padding: 1px 10px;
  font-size: 0.75rem;
  color: var(--blue-700);
  background: var(--blue-50);
  border-radius: 100px;
}

.post-article__title {
  font-family: var(--font-sans);
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.3;
  margin-bottom: 14px;
  letter-spacing: -0.01em;
}

.post-article__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.post-article__tag {
  padding: 2px 8px;
  font-size: 0.75rem;
  color: var(--gray-500);
  background: var(--gray-100);
  border-radius: 4px;
}

.post-article__cover {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

/* 正文区 */
.post-article__body {
  background: var(--white);
  padding: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  margin-bottom: 32px;
}

/* 底部 */
.post-article__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.post-article__back-link {
  flex: 0 0 auto;
  font-size: 0.9rem;
  color: var(--gray-500);
  text-decoration: none;
  transition: color 0.2s;
}

.post-article__back-link:hover {
  color: var(--blue-700);
}

.post-article__adjacent {
  flex: 0 0 auto;
  font-size: 0.85rem;
  color: var(--blue-700);
  text-decoration: none;
  transition: color 0.2s;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-article__adjacent:hover {
  color: var(--accent-hover);
}

.post-article__adjacent--next {
  margin-left: auto;
}

/* 响应式 */
@media (max-width: 640px) {
  .post-article__title {
    font-size: 1.5rem;
  }
  .post-article__body {
    padding: 24px 20px;
  }
}
</style>
