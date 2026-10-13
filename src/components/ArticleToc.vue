<template>
  <aside class="article-toc" aria-label="目录">
    <p class="article-toc__title">目录</p>
    <nav class="article-toc__nav">
      <a
        v-for="h in headings"
        :key="h.id"
        :href="`#${h.id}`"
        class="article-toc__link"
        :class="[
          `article-toc__link--h${Math.min(h.level, 4)}`,
          { 'article-toc__link--active': h.id === activeId },
        ]"
        @click.prevent="jump(h.id)"
      >
        {{ h.text }}
      </a>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { TocHeading } from '@/utils/toc'

const props = defineProps<{
  headings: TocHeading[]
}>()

const activeId = ref('')

/** 平滑滚动到对应标题（预留导航栏高度） */
function jump(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 76
  window.scrollTo({ top, behavior: 'smooth' })
  activeId.value = id
}

/** 依据滚动位置高亮当前小节 */
function onScroll() {
  const offset = 100
  let current = ''
  for (const h of props.headings) {
    const el = document.getElementById(h.id)
    if (!el) continue
    if (el.getBoundingClientRect().top - offset <= 0) current = h.id
    else break
  }
  activeId.value = current
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  nextTick(onScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

watch(
  () => props.headings,
  () => nextTick(onScroll),
)
</script>

<style scoped>
.article-toc {
  position: sticky;
  top: 84px;
  align-self: flex-start;
  width: 100%;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-left: 16px;
  border-left: 1px solid var(--border);
}

.article-toc__title {
  margin-bottom: 10px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray-400);
}

.article-toc__nav {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.article-toc__link {
  display: block;
  padding: 4px 8px;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--gray-500);
  text-decoration: none;
  border-left: 2px solid transparent;
  border-radius: 0 4px 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.article-toc__link:hover {
  color: var(--blue-700);
  background: var(--blue-50);
}

.article-toc__link--h1 {
  font-weight: 600;
  color: var(--gray-700);
}

.article-toc__link--h3 {
  padding-left: 20px;
  font-size: 0.78rem;
}

.article-toc__link--h4 {
  padding-left: 32px;
  font-size: 0.76rem;
  color: var(--gray-400);
}

.article-toc__link--active {
  color: var(--blue-700);
  border-left-color: var(--blue-700);
  background: var(--blue-50);
}
</style>
