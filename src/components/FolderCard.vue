<template>
  <RouterLink class="folder-card-link" :to="to">
    <article
      ref="cardRef"
      class="folder-card"
      :class="{ 'folder-card--text': !hasCover }"
      @pointerenter="onEnter"
      @pointermove="onMove"
      @pointerleave="onLeave"
    >
      <!-- 鼠标跟随光晕 -->
      <span ref="glowRef" class="folder-card__glow" aria-hidden="true" />

      <!-- 文件夹根目录 cover.jpg 自动渲染为封面，比例 4:3 -->
      <div v-if="hasCover" class="folder-card__cover">
        <img
          ref="coverImgRef"
          :src="section.cover"
          :alt="section.name"
          loading="lazy"
          @error="coverBroken = true"
        />
      </div>

      <div class="folder-card__body">
        <h2 class="folder-card__name">{{ section.name }}</h2>

        <p class="folder-card__latest">
          <span class="folder-card__latest-label">最新文章：</span>{{ section.latestTitle }}
        </p>

        <div class="folder-card__foot">
          <span>{{ section.postCount }} 篇</span>
          <time class="folder-card__date" :datetime="section.updatedAt">
            更新 {{ dateLabel }}
          </time>
        </div>
      </div>
    </article>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import type { SectionMeta } from '@/utils/posts'

const props = defineProps<{
  section: SectionMeta
}>()

const cardRef = ref<HTMLElement>()
const coverImgRef = ref<HTMLImageElement>()
const glowRef = ref<HTMLElement>()
const coverBroken = ref(false)

const hasCover = computed(() => !!props.section.cover && !coverBroken.value)

const to = computed(() => ({
  path: '/',
  query: { section: props.section.name },
}))

const dateLabel = computed(() =>
  props.section.updatedAt ? props.section.updatedAt.replace(/-/g, '.') : '—',
)

/* ===== GSAP 交互 =====
 * - 只在前台支持动效时创建 quickTo / 光晕
 * - 悬浮：卡片抬升 + 封面缩放 + 光晕跟随
 */
let mm: ReturnType<typeof gsap.matchMedia> | null = null
let glowX: ((value: number) => unknown) | null = null
let glowY: ((value: number) => unknown) | null = null

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    if (!glowRef.value) return
    gsap.set(glowRef.value, { xPercent: -50, yPercent: -50, x: 0, y: 0 })
    glowX = gsap.quickTo(glowRef.value, 'x', {
      duration: 0.45,
      ease: 'power3',
    })
    glowY = gsap.quickTo(glowRef.value, 'y', {
      duration: 0.45,
      ease: 'power3',
    })
    return () => {
      glowX = null
      glowY = null
    }
  })
})

onBeforeUnmount(() => {
  const els = [
    cardRef.value,
    coverImgRef.value,
    glowRef.value,
  ].filter((el): el is HTMLElement => !!el)
  gsap.killTweensOf(els)
  mm?.revert()
})

function onMove(e: PointerEvent) {
  if (!glowX || !glowY || !cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  glowX(e.clientX - rect.left)
  glowY(e.clientY - rect.top)
}

function onEnter(e: PointerEvent) {
  if (reducedMotion()) return
  onMove(e)

  // 整张卡片轻微抬升，并加强描边与投影
  gsap.to(cardRef.value, {
    y: -5,
    borderColor: '#a9c4dc',
    boxShadow: '0 18px 36px -16px rgba(61, 111, 159, 0.28)',
    duration: 0.3,
    ease: 'power2.out',
    overwrite: 'auto',
  })

  if (coverImgRef.value) {
    gsap.to(coverImgRef.value, {
      scale: 1.06,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  if (glowRef.value) {
    gsap.to(glowRef.value, {
      opacity: 1,
      duration: 0.35,
      ease: 'power1.out',
      overwrite: 'auto',
    })
  }
}

function onLeave() {
  if (reducedMotion()) return

  gsap.to(cardRef.value, {
    y: 0,
    borderColor: '#e2e8f0',
    boxShadow: '0 8px 22px -16px rgba(30, 58, 95, 0.28)',
    duration: 0.4,
    ease: 'power2.out',
    overwrite: 'auto',
  })

  if (coverImgRef.value) {
    gsap.to(coverImgRef.value, {
      scale: 1,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  if (glowRef.value) {
    gsap.to(glowRef.value, {
      opacity: 0,
      duration: 0.4,
      ease: 'power1.out',
      overwrite: 'auto',
    })
  }
}
</script>

<style scoped>
.folder-card-link {
  display: block;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.folder-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 22px -16px rgba(30, 58, 95, 0.28);
  cursor: pointer;
  will-change: transform;
}

/* 无封面时，文字区撑起卡片高度 */
.folder-card--text .folder-card__body {
  min-height: 128px;
}

/* ===== 封面（宽 4:高 3，与文字同属一张卡） ===== */
.folder-card__cover {
  position: relative;
  flex: 0 0 auto;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--gray-100);
}

.folder-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

/* ===== 鼠标跟随光晕 ===== */
.folder-card__glow {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 320px;
  height: 320px;
  background: radial-gradient(
    circle,
    rgba(85, 120, 156, 0.18),
    rgba(85, 120, 156, 0) 65%
  );
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
}

/* ===== 正文 ===== */
.folder-card__body {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  padding: 14px 16px 12px;
  overflow: hidden;
}

.folder-card__name {
  position: relative;
  z-index: 1;
  overflow: hidden;
  font-family: var(--font-sans);
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.04em;
  color: var(--gray-900);
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.folder-card__latest {
  position: relative;
  z-index: 1;
  overflow: hidden;
  font-size: 0.84rem;
  font-weight: 400;
  line-height: 1.35;
  color: var(--gray-500);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-card__latest-label {
  color: var(--gray-400);
}

.folder-card__foot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  font-size: 0.66rem;
  color: var(--gray-400);
  border-top: 1px solid var(--gray-100);
}

.folder-card__date {
  color: #7f9cbb;
  font-feature-settings: 'tnum';
}

@media (max-width: 640px) {
  .folder-card__body {
    padding: 12px 14px;
  }
}
</style>
