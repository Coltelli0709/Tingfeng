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
      <!-- 文件夹根目录 cover.jpg 自动渲染为封面，比例 4:3 -->
      <div v-if="hasCover" ref="coverRef" class="folder-card__cover">
        <img
          ref="coverImgRef"
          :src="section.cover"
          :alt="section.name"
          loading="lazy"
          @error="coverBroken = true"
        />
      </div>

      <div ref="panelRef" class="folder-card__body">
        <!-- 鼠标跟随光晕 -->
        <span ref="glowRef" class="folder-card__glow" aria-hidden="true" />
        <!-- 无封面时的大号首字母 / 装饰字 -->
        <span
          v-if="!hasCover"
          ref="ghostRef"
          class="folder-card__ghost"
          aria-hidden="true"
        >{{ ghost }}</span>

        <div class="folder-card__top">
          <span class="folder-card__index">{{ indexLabel }}</span>
          <span ref="arrowRef" class="folder-card__arrow" aria-hidden="true">→</span>
        </div>

        <h2 class="folder-card__name">
          {{ nameParts.main }}<span
            v-if="nameParts.suffix"
            class="folder-card__suffix"
          >/ {{ nameParts.suffix }}</span>
        </h2>

        <p class="folder-card__latest">
          <span class="folder-card__latest-label">最新文章：</span>{{ section.latestTitle }}
        </p>

        <div v-if="section.categories.length" class="folder-card__tags">
          <span
            v-for="cat in section.categories.slice(0, 3)"
            :key="cat"
            class="folder-card__tag"
          >{{ cat }}</span>
        </div>

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
  index: number
}>()

const cardRef = ref<HTMLElement>()
const coverRef = ref<HTMLElement>()
const coverImgRef = ref<HTMLImageElement>()
const panelRef = ref<HTMLElement>()
const glowRef = ref<HTMLElement>()
const arrowRef = ref<HTMLElement>()
const ghostRef = ref<HTMLElement>()
const coverBroken = ref(false)

const hasCover = computed(() => !!props.section.cover && !coverBroken.value)

const to = computed(() => ({
  path: '/',
  query: { section: props.section.name },
}))

const indexLabel = computed(() => String(props.index + 1).padStart(2, '0'))

const nameParts = computed(() => {
  const i = props.section.name.indexOf('-')
  if (i <= 0) return { main: props.section.name, suffix: '' }
  return {
    main: props.section.name.slice(0, i),
    suffix: props.section.name.slice(i + 1),
  }
})

const ghost = computed(() => nameParts.value.main.charAt(0))

const dateLabel = computed(() =>
  props.section.updatedAt ? props.section.updatedAt.replace(/-/g, '.') : '—',
)

/* ===== GSAP 交互 =====
 * - 只在前台支持动效时创建 quickTo / 光晕
 * - 悬浮：卡片抬升 + 封面缩放 + 箭头位移 + 光晕跟随
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
    coverRef.value,
    coverImgRef.value,
    panelRef.value,
    glowRef.value,
    arrowRef.value,
    ghostRef.value,
  ].filter((el): el is HTMLElement => !!el)
  gsap.killTweensOf(els)
  mm?.revert()
})

function onMove(e: PointerEvent) {
  if (!glowX || !glowY || !panelRef.value) return
  const rect = panelRef.value.getBoundingClientRect()
  glowX(e.clientX - rect.left)
  glowY(e.clientY - rect.top)
}

function onEnter(e: PointerEvent) {
  if (reducedMotion()) return
  onMove(e)

  // 整张卡片轻微抬升
  gsap.to(cardRef.value, {
    y: -6,
    duration: 0.35,
    ease: 'power2.out',
    overwrite: 'auto',
  })

  // 下方白框的描边与投影
  if (panelRef.value) {
    gsap.to(panelRef.value, {
      borderColor: '#93c5fd',
      boxShadow: '0 18px 40px -18px rgba(37, 99, 235, 0.42)',
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  // 封面投影加深
  if (coverRef.value) {
    gsap.to(coverRef.value, {
      boxShadow: '0 18px 36px -16px rgba(30, 58, 95, 0.5)',
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  if (coverImgRef.value) {
    gsap.to(coverImgRef.value, {
      scale: 1.06,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  if (arrowRef.value) {
    gsap.to(arrowRef.value, {
      x: 5,
      color: '#2563eb',
      duration: 0.3,
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

  if (ghostRef.value) {
    gsap.to(ghostRef.value, {
      x: 8,
      y: -6,
      color: '#dbeafe',
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }
}

function onLeave() {
  if (reducedMotion()) return

  gsap.to(cardRef.value, {
    y: 0,
    duration: 0.45,
    ease: 'power2.out',
    overwrite: 'auto',
  })

  if (panelRef.value) {
    gsap.to(panelRef.value, {
      borderColor: '#e2e8f0',
      boxShadow: '0 8px 26px -18px rgba(30, 58, 95, 0.18)',
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  if (coverRef.value) {
    gsap.to(coverRef.value, {
      boxShadow: '0 12px 28px -18px rgba(30, 58, 95, 0.35)',
      duration: 0.45,
      ease: 'power2.out',
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
      color: '#94a3b8',
      duration: 0.35,
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

  if (ghostRef.value) {
    gsap.to(ghostRef.value, {
      x: 0,
      y: 0,
      color: '#f1f5f9',
      duration: 0.45,
      ease: 'power2.out',
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
  gap: 12px;
  height: 100%;
  background: transparent;
  cursor: pointer;
  will-change: transform;
}

/* 无封面时，白框本身撑起卡片高度 */
.folder-card--text .folder-card__body {
  min-height: 288px;
}

/* ===== 封面（宽 4:高 3） ===== */
.folder-card__cover {
  position: relative;
  flex: 0 0 auto;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--gray-100);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 28px -18px rgba(30, 58, 95, 0.35);
}

.folder-card__cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.32),
    rgba(15, 23, 42, 0) 58%
  );
  pointer-events: none;
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
  z-index: 0;
  width: 320px;
  height: 320px;
  background: radial-gradient(
    circle,
    rgba(37, 99, 235, 0.16),
    rgba(37, 99, 235, 0) 65%
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
  gap: 8px;
  padding: 20px 22px;
  overflow: hidden;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 26px -18px rgba(30, 58, 95, 0.18);
}

.folder-card__top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.folder-card__index {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  color: var(--gray-400);
}

.folder-card__arrow {
  color: var(--gray-400);
  font-size: 1.05rem;
  line-height: 1;
}

.folder-card__name {
  position: relative;
  z-index: 1;
  font-family: var(--font-sans);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.03em;
  color: var(--gray-900);
  word-break: break-word;
}

.folder-card__suffix {
  margin-left: 8px;
  font-weight: 400;
  letter-spacing: 0.01em;
  color: var(--gray-400);
}

.folder-card__latest {
  position: relative;
  z-index: 1;
  overflow: hidden;
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--gray-500);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-card__latest-label {
  color: var(--gray-400);
}

.folder-card__tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.folder-card__tag {
  padding: 1px 8px;
  font-size: 0.7rem;
  color: var(--gray-500);
  background: var(--gray-50);
  border: 1px solid var(--gray-100);
  border-radius: 100px;
}

.folder-card__foot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 14px;
  font-size: 0.75rem;
  color: var(--gray-400);
  border-top: 1px solid var(--gray-100);
}

.folder-card__date {
  color: var(--blue-500);
  font-feature-settings: 'tnum';
}

/* 无封面时的装饰首字母 */
.folder-card__ghost {
  position: absolute;
  right: 14px;
  bottom: 44px;
  z-index: 0;
  font-size: 6.5rem;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: -0.05em;
  color: var(--gray-100);
  pointer-events: none;
  user-select: none;
}

@media (max-width: 640px) {
  .folder-card {
    gap: 10px;
  }

  .folder-card__body {
    padding: 18px;
  }

  .folder-card__name {
    font-size: 1.2rem;
  }
}
</style>
