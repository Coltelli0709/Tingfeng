<template>
  <div class="home">
    <!-- 鱼群背景 -->
    <FishSwarm />

    <div ref="pageRef" class="container home__content">
      <!-- 页面标题 -->
      <div ref="heroRef" class="home__hero">
        <h1 class="home__title">文章</h1>
        <p class="home__subtitle">
          共 {{ filteredPosts.length }} 篇
          <template v-if="activeSection"> · {{ activeSection }}</template>
          <template v-if="activeCategory !== '全部'">
            / {{ activeCategory }}
          </template>
        </p>
      </div>

      <!-- 分类筛选 -->
      <div ref="tabsRef" class="home__tabs-wrap">
        <CategoryTabs
          :categories="categoriesWithinSection"
          :active="activeCategory"
          :count-map="countMap"
          @select="onCategorySelect"
        />
      </div>

      <!-- 时间筛选 -->
      <div ref="dateFilterRef" class="home__date-filter">
        <button class="home__date-toggle" @click="showDateFilter = !showDateFilter">
          {{ showDateFilter ? '收起时间' : '时间筛选' }}
        </button>

        <div v-if="showDateFilter" class="home__date-panel">
          <div class="home__date-row">
            <label class="home__date-label">
              <span>从</span>
              <input
                v-model="dateStart"
                class="home__date-input"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="YYMMDD"
              />
            </label>
            <span class="home__date-sep">—</span>
            <label class="home__date-label">
              <span>到</span>
              <input
                v-model="dateEnd"
                class="home__date-input"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="YYMMDD"
              />
            </label>
            <button
              v-if="dateStart || dateEnd"
              class="home__date-clear"
              @click="clearDate"
            >
              清除
            </button>
          </div>
          <p class="home__date-hint">时间格式为 yymmdd，例如：070407</p>
        </div>
      </div>

      <!-- 文章列表 -->
      <TransitionGroup
        name="post-list"
        tag="div"
        ref="listRef"
        class="home__list"
      >
        <ArticleCard
          v-for="post in filteredPosts"
          :key="post.slug"
          :post="post"
        />
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-if="filteredPosts.length === 0" class="home__empty">
        <p>暂无文章</p>
      </div>

      <!-- 访客统计 -->
      <footer ref="footerRef" class="home__footer">
        <p class="home__footer-text">
          湿润的风，已拂过
          <span id="busuanzi_value_site_pv" class="home__footer-count" />
          张脸。
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { allPosts, filterByDateRange } from '@/utils/posts'
import CategoryTabs from '@/components/CategoryTabs.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import FishSwarm from '@/components/FishSwarm.vue'

const route = useRoute()
const router = useRouter()

const pageRef = ref<HTMLElement>()
const heroRef = ref<HTMLElement>()
const tabsRef = ref<HTMLElement>()
const dateFilterRef = ref<HTMLElement>()
const listRef = ref<InstanceType<typeof TransitionGroup>>()
const footerRef = ref<HTMLElement>()

/* ---- 版块（来自导航栏 /?section=）---- */
const activeSection = ref<string>('')

watch(
  () => route.query.section as string | undefined,
  (s) => { activeSection.value = s ?? '' },
  { immediate: true },
)

/* 当前版块下的文章 */
const sectionPosts = computed(() => {
  if (!activeSection.value) return allPosts
  return allPosts.filter((p) => p.section === activeSection.value)
})

/* ---- 子分类标签（来自 frontmatter category）---- */
const activeCategory = ref<string>('全部')

// 版块切换时重置子分类
watch(activeSection, () => { activeCategory.value = '全部' })

const categoriesWithinSection = computed(() => {
  const set = new Set<string>()
  for (const p of sectionPosts.value) {
    if (p.category) set.add(p.category)
  }
  return ['全部', ...Array.from(set)]
})

const countMap = computed(() => {
  const map: Record<string, number> = { 全部: sectionPosts.value.length }
  for (const p of sectionPosts.value) {
    const c = p.category || '未分类'
    map[c] = (map[c] || 0) + 1
  }
  return map
})

/* ---- 组合筛选 ---- */
const dateStart = ref('')
const dateEnd = ref('')
const showDateFilter = ref(false)

const filteredPosts = computed(() => {
  // 先按子分类筛
  let posts = activeCategory.value === '全部'
    ? sectionPosts.value
    : sectionPosts.value.filter((p) => p.category === activeCategory.value)

  // 再按时间筛
  if (dateStart.value || dateEnd.value) {
    posts = filterByDateRange(posts, dateStart.value, dateEnd.value)
  }
  return posts
})

function onCategorySelect(cat: string) {
  activeCategory.value = cat
  const q: Record<string, string> = {}
  if (activeSection.value) q.section = activeSection.value
  if (cat !== '全部') q.cat = cat
  router.replace({ query: q })
}

watch(dateStart, (v) => {
  const cleaned = v.replace(/\D/g, '').slice(0, 6)
  if (v !== cleaned) dateStart.value = cleaned
})
watch(dateEnd, (v) => {
  const cleaned = v.replace(/\D/g, '').slice(0, 6)
  if (v !== cleaned) dateEnd.value = cleaned
})

function clearDate() {
  dateStart.value = ''
  dateEnd.value = ''
}

onMounted(async () => {
  await nextTick()

  const mm = gsap.matchMedia()

  // 桌面端：更大位移；移动端：更温和
  mm.add(
    {
      isDesktop: '(min-width: 768px)',
      isMobile: '(max-width: 767px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions!

      if (reduceMotion) {
        // 仅淡入，无位移
        gsap.set([heroRef.value, tabsRef.value, dateFilterRef.value, footerRef.value], { autoAlpha: 1 })
        gsap.set(listRef.value?.$el?.children ?? [], { autoAlpha: 1 })
        return
      }

      const dist = isDesktop ? 24 : 14
      const staggerTime = isDesktop ? 0.08 : 0.06
      const children = listRef.value?.$el ? gsap.utils.toArray(listRef.value.$el.children) : []

      // 先设初始态
      gsap.set(heroRef.value, { y: dist, autoAlpha: 0 })
      gsap.set(tabsRef.value, { y: dist * 0.6, autoAlpha: 0 })
      gsap.set(dateFilterRef.value, { y: dist * 0.5, autoAlpha: 0 })
      gsap.set(children, { y: dist, autoAlpha: 0 })
      gsap.set(footerRef.value, { autoAlpha: 0 })

      // 依次入场
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.55 } })
      tl.to(heroRef.value, { y: 0, autoAlpha: 1 })
        .to(tabsRef.value, { y: 0, autoAlpha: 1 }, '-=0.35')
        .to(dateFilterRef.value, { y: 0, autoAlpha: 1 }, '-=0.3')
        .to(children, { y: 0, autoAlpha: 1, stagger: staggerTime }, '-=0.25')
        .to(footerRef.value, { autoAlpha: 1 }, '-=0.15')

      return () => tl.kill()
    },
  )
})
</script>

<style scoped>
.home {
  position: relative;
  z-index: 1;
  padding-top: 32px;
  padding-bottom: 64px;
  min-height: calc(100vh - var(--header-height));
}

.home__content {
  position: relative;
  z-index: 2;
}

.home__hero {
  margin-bottom: 28px;
}

.home__title {
  font-family: var(--font-sans);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 6px;
}

.home__subtitle {
  font-size: 0.9rem;
  color: var(--gray-500);
}

/* 文章列表 */
.home__list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 空状态 */
.home__empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--gray-400);
  font-size: 0.95rem;
}

/* 列表出现动画（分类筛选时） */
.post-list-enter-active {
  transition: all 0.35s ease;
}
.post-list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

/* 时间筛选 */
.home__date-filter {
  margin-bottom: 20px;
}

.home__date-toggle {
  padding: 5px 14px;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--gray-500);
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.home__date-toggle:hover {
  color: var(--blue-700);
  border-color: var(--blue-500);
}

.home__date-panel {
  margin-top: 10px;
  padding: 14px 16px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.home__date-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.home__date-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--gray-500);
}

.home__date-input {
  width: 80px;
  padding: 5px 8px;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--gray-800);
  background: var(--gray-50);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  text-align: center;
  letter-spacing: 0.08em;
  transition: border-color 0.2s;
}

.home__date-input:focus {
  border-color: var(--blue-600);
  box-shadow: 0 0 0 2px var(--blue-100);
  background: var(--white);
}

.home__date-input::placeholder {
  color: var(--gray-300);
}

.home__date-sep {
  color: var(--gray-400);
  font-size: 0.9rem;
}

.home__date-clear {
  padding: 4px 10px;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--gray-400);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.home__date-clear:hover {
  color: var(--blue-700);
  border-color: var(--blue-500);
}

.home__date-hint {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--gray-400);
}

/* 访客统计 */
.home__footer {
  margin-top: 64px;
  padding: 24px 0 12px;
  text-align: center;
  border-top: 1px solid var(--border);
}

.home__footer-text {
  font-size: 0.8rem;
  color: var(--gray-400);
  letter-spacing: 0.03em;
}

.home__footer-count {
  color: var(--blue-500);
  font-weight: 600;
}
</style>
