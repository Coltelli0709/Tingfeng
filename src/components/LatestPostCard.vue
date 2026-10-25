<template>
  <RouterLink class="latest-card-link" :to="`/blog/${post.slug}`">
    <article
      ref="cardRef"
      class="latest-card"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
    >
      <div class="latest-card__content">
        <span class="latest-card__badge">最新文章</span>

        <h2 ref="titleRef" class="latest-card__title">{{ displayTitle }}</h2>

        <p v-if="showDescription" class="latest-card__desc">
          {{ post.description }}
        </p>

        <div class="latest-card__meta">
          <time :datetime="post.date">{{ post.date }}</time>
          <span>{{ post.section }}</span>
          <span v-if="showCategory">{{ post.category }}</span>
        </div>

        <span class="latest-card__more">
          阅读全文 <span ref="arrowRef" class="latest-card__arrow" aria-hidden="true">→</span>
        </span>
      </div>

      <div v-if="hasCover" class="latest-card__cover">
        <img
          ref="coverImgRef"
          :src="post.cover"
          :alt="displayTitle"
          @error="coverBroken = true"
        />
      </div>
    </article>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import type { PostWithContent } from '@/utils/posts'

const props = defineProps<{
  post: PostWithContent
}>()

const cardRef = ref<HTMLElement>()
const titleRef = ref<HTMLElement>()
const coverImgRef = ref<HTMLImageElement>()
const arrowRef = ref<HTMLElement>()
const coverBroken = ref(false)

const hasCover = computed(() => !!props.post.cover && !coverBroken.value)
const showCategory = computed(
  () => !!props.post.category && props.post.category !== props.post.section,
)

// frontmatter 没写 title 时 posts.ts 会退回 slug；这种情况下用简介顶上
const titleMissing = computed(() => props.post.title === props.post.slug)
const displayTitle = computed(() =>
  titleMissing.value
    ? props.post.description || props.post.title
    : props.post.title,
)
const showDescription = computed(
  () => !!props.post.description && !titleMissing.value,
)

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function onEnter() {
  if (reducedMotion()) return

  gsap.to(cardRef.value, {
    y: -4,
    borderColor: '#9db8d0',
    boxShadow: '0 18px 36px -16px rgba(31, 61, 96, 0.32)',
    duration: 0.3,
    ease: 'power2.out',
    overwrite: 'auto',
  })

  if (titleRef.value) {
    gsap.to(titleRef.value, {
      color: '#4f779e',
      duration: 0.25,
      ease: 'power1.out',
      overwrite: 'auto',
    })
  }

  if (coverImgRef.value) {
    gsap.to(coverImgRef.value, {
      scale: 1.04,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  if (arrowRef.value) {
    gsap.to(arrowRef.value, {
      x: 4,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }
}

function onLeave() {
  if (reducedMotion()) return

  gsap.to(cardRef.value, {
    y: 0,
    borderColor: '#c8d7e4',
    boxShadow: '0 8px 22px -16px rgba(30, 58, 95, 0.28)',
    duration: 0.4,
    ease: 'power2.out',
    overwrite: 'auto',
  })

  if (titleRef.value) {
    gsap.to(titleRef.value, {
      color: '#0f172a',
      duration: 0.3,
      ease: 'power1.out',
      overwrite: 'auto',
    })
  }

  if (coverImgRef.value) {
    gsap.to(coverImgRef.value, {
      scale: 1,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  if (arrowRef.value) {
    gsap.to(arrowRef.value, {
      x: 0,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }
}

onBeforeUnmount(() => {
  const els = [
    cardRef.value,
    titleRef.value,
    coverImgRef.value,
    arrowRef.value,
  ].filter((el): el is HTMLElement => !!el)
  gsap.killTweensOf(els)
})
</script>

<style scoped>
.latest-card-link {
  display: block;
  margin-bottom: 22px;
  color: inherit;
  text-decoration: none;
}

.latest-card {
  position: relative;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background: var(--white);
  border: 1px solid #c8d7e4;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 22px -16px rgba(30, 58, 95, 0.28);
  will-change: transform;
}

.latest-card__content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  padding: 20px 24px;
}

.latest-card__badge {
  align-self: flex-start;
  margin-bottom: 8px;
  padding: 3px 10px;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  color: var(--blue-700);
  background: var(--blue-50);
  border: 1px solid var(--blue-100);
  border-radius: 100px;
}

.latest-card__title {
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 6px;
  font-family: var(--font-sans);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--gray-900);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.latest-card__desc {
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 10px;
  font-size: 0.84rem;
  line-height: 1.6;
  color: var(--gray-500);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.latest-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.74rem;
  color: var(--gray-400);
}

.latest-card__meta > * + *::before {
  content: '·';
  margin-right: 8px;
  color: var(--gray-300);
}

.latest-card__more {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: auto;
  padding-top: 10px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--blue-700);
}

.latest-card__arrow {
  line-height: 1;
}

.latest-card__cover {
  position: relative;
  flex: 0 0 38%;
  min-width: 240px;
  max-width: 360px;
  overflow: hidden;
  background: var(--gray-100);
}

.latest-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

@media (max-width: 760px) {
  .latest-card-link {
    margin-bottom: 18px;
  }

  .latest-card {
    flex-direction: column;
  }

  .latest-card__content {
    padding: 18px 18px 20px;
  }

  .latest-card__title {
    font-size: 1.2rem;
  }

  .latest-card__cover {
    flex: 0 0 auto;
    width: 100%;
    min-width: 0;
    max-width: none;
    aspect-ratio: 16 / 9;
  }
}
</style>
