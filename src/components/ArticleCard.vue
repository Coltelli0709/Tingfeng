<template>
  <article ref="cardRef" class="article-card" @mouseenter="onEnter" @mouseleave="onLeave" @click="goPost">
    <!-- 封面图（加载失败时隐藏） -->
    <div v-if="showCover" class="article-card__cover">
      <img
        :src="post.cover"
        :alt="post.title"
        loading="lazy"
        @error="coverBroken = true"
      />
    </div>

    <!-- 文字信息 -->
    <div class="article-card__body">
      <div class="article-card__meta">
        <time class="article-card__date">{{ post.date }}</time>
        <span class="article-card__category">{{ post.category }}</span>
      </div>
      <h2 ref="titleRef" class="article-card__title">{{ post.title }}</h2>
      <p v-if="post.description" class="article-card__desc">
        {{ post.description }}
      </p>
      <div v-if="post.tags && post.tags.length" class="article-card__tags">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="article-card__tag"
        >{{ tag }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import type { PostWithContent } from '@/utils/posts'

const props = defineProps<{
  post: PostWithContent
}>()

const router = useRouter()
const coverBroken = ref(false)
const cardRef = ref<HTMLElement>()
const titleRef = ref<HTMLElement>()

const showCover = computed(() => !!props.post.cover && !coverBroken.value)

function goPost() {
  router.push(`/post/${props.post.slug}`)
}

let hoverTween: gsap.core.Tween | null = null
let titleTween: gsap.core.Tween | null = null

function onEnter() {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    hoverTween = gsap.to(cardRef.value, {
      y: -3,
      boxShadow: '0 6px 28px rgba(37, 99, 235, 0.10)',
      borderColor: '#60a5fa',
      duration: 0.3,
      ease: 'power2.out',
    })
    titleTween = gsap.to(titleRef.value, {
      color: '#2563eb',
      duration: 0.3,
      ease: 'power1.out',
    })
    return () => {
      hoverTween?.kill()
      titleTween?.kill()
    }
  })
}

function onLeave() {
  gsap.to(cardRef.value, {
    y: 0,
    boxShadow: '0 0 0 rgba(0,0,0,0)',
    borderColor: '#e2e8f0',
    duration: 0.3,
    ease: 'power2.out',
  })
  gsap.to(titleRef.value, {
    color: '#0f172a',
    duration: 0.3,
    ease: 'power1.out',
  })
}
</script>

<style scoped>
.article-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
}

.article-card__cover {
  width: 100%;
  max-height: 220px;
  overflow: hidden;
  background: var(--gray-100);
}

.article-card__cover img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.article-card__body {
  padding: 20px 24px 24px;
}

.article-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.article-card__date {
  font-size: 0.8125rem;
  color: var(--gray-400);
  font-feature-settings: 'tnum';
}

.article-card__category {
  display: inline-block;
  padding: 1px 10px;
  font-size: 0.75rem;
  color: var(--blue-700);
  background: var(--blue-50);
  border-radius: 100px;
  font-weight: 500;
}

.article-card__title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.4;
  margin-bottom: 8px;
}

.article-card__desc {
  font-size: 0.9rem;
  color: var(--gray-500);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.article-card__tag {
  padding: 2px 8px;
  font-size: 0.75rem;
  color: var(--gray-500);
  background: var(--gray-100);
  border-radius: 4px;
}
</style>
