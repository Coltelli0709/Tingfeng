<template>
  <div class="home">
    <!-- 鱼群背景 -->
    <FishSwarm />

    <div
      class="container home__content"
      :class="{ 'home__content--wide': viewMode === 'folders' }"
    >
      <!-- ================= 总览：一个 blog 文件夹一张卡片 ================= -->
      <template v-if="viewMode === 'folders'">
        <div ref="heroRef" class="home__hero">
          <h1 class="home__title">文章</h1>
          <p class="home__subtitle">
            {{ allSectionMeta.length }} 个分类 · 共 {{ allPosts.length }} 篇
            <span class="home__subtitle-note">按最后更新排序</span>
          </p>
        </div>

        <div ref="foldersRef" class="folder-grid">
          <FolderCard
            v-for="(section, i) in allSectionMeta"
            :key="section.name"
            :section="section"
            :index="i"
          />
        </div>
      </template>

      <!-- ================= 某个文件夹下的文章列表 ================= -->
      <template v-else>
        <div ref="heroRef" class="home__hero">
          <RouterLink to="/" class="home__back">← 全部分类</RouterLink>
          <h1 class="home__title">{{ sectionLabel }}</h1>
          <p class="home__subtitle">
            共 {{ filteredPosts.length }} 篇
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
      </template>

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
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  TransitionGroup,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import {
  allPosts,
  allSectionMeta,
  filterByDateRange,
  DEFAULT_SECTION,
  ALL_SECTIONS,
} from '@/utils/posts'
import CategoryTabs from '@/components/CategoryTabs.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import FolderCard from '@/components/FolderCard.vue'
import FishSwarm from '@/components/FishSwarm.vue'

const route = useRoute()
const router = useRouter()

const heroRef = ref<HTMLElement>()
const tabsRef = ref<HTMLElement>()
const dateFilterRef = ref<HTMLElement>()
const listRef = ref<InstanceType<typeof TransitionGroup>>()
const foldersRef = ref<HTMLElement>()
const footerRef = ref<HTMLElement>()

/* ---- 视图模式：无 section 参数 → 文件夹卡片总览；有 → 文章列表 ---- */
const sectionQuery = computed(() => {
  const raw = route.query.section
  return Array.isArray(raw) ? raw[0] : raw
})

const viewMode = computed<'folders' | 'list'>(() =>
  sectionQuery.value ? 'list' : 'folders',
)

/* ---- 版块（来自导航栏 /?section=）---- */
const activeSection = ref<string>(DEFAULT_SECTION)

watch(
  sectionQuery,
  (s) => { activeSection.value = s || DEFAULT_SECTION },
  { immediate: true },
)

/* 当前版块下的文章 */
const sectionPosts = computed(() => {
  if (activeSection.value === ALL_SECTIONS) return allPosts
  return allPosts.filter((p) => p.section === activeSection.value)
})

/* 标题区展示文案（all → 所有） */
const sectionLabel = computed(() =>
  activeSection.value === ALL_SECTIONS ? '所有' : activeSection.value,
)

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
  // 列表模式下 section 必须始终保留在 URL 中，否则会跳回卡片总览
  const q: Record<string, string> = { section: activeSection.value }
  if (cat !== '全部') q.cat = cat
  router.replace({ query: q })
}

// 归一化输入：全角数字转半角，非数字一律剔除，最多保留 6 位
function toYymmdd(v: string): string {
  return v
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\D/g, '')
    .slice(0, 6)
}

watch(dateStart, (v) => {
  const cleaned = toYymmdd(v)
  if (v !== cleaned) dateStart.value = cleaned
})
watch(dateEnd, (v) => {
  const cleaned = toYymmdd(v)
  if (v !== cleaned) dateEnd.value = cleaned
})

function clearDate() {
  dateStart.value = ''
  dateEnd.value = ''
}

/* ---- 入场动画 ---- */
let entrance: gsap.core.Timeline | null = null

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function animateIn() {
  entrance?.kill()
  entrance = null

  const hero = heroRef.value
  if (!hero) return

  const tabs = tabsRef.value
  const dateFilter = dateFilterRef.value
  const footer = footerRef.value
  const items: HTMLElement[] = foldersRef.value
    ? (Array.from(foldersRef.value.children) as HTMLElement[])
    : listRef.value?.$el
      ? (Array.from(listRef.value.$el.children) as HTMLElement[])
      : []

  if (prefersReducedMotion()) {
    gsap.set(
      [hero, tabs, dateFilter, footer, ...items].filter(Boolean),
      { autoAlpha: 1, y: 0 },
    )
    return
  }

  const dist = 22

  gsap.set(hero, { y: dist, autoAlpha: 0 })
  if (tabs) gsap.set(tabs, { y: dist * 0.6, autoAlpha: 0 })
  if (dateFilter) gsap.set(dateFilter, { y: dist * 0.5, autoAlpha: 0 })
  if (footer) gsap.set(footer, { autoAlpha: 0 })
  if (items.length) gsap.set(items, { y: dist, autoAlpha: 0 })

  const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.55 } })
  tl.to(hero, { y: 0, autoAlpha: 1 })
  if (tabs) tl.to(tabs, { y: 0, autoAlpha: 1 }, '-=0.35')
  if (dateFilter) tl.to(dateFilter, { y: 0, autoAlpha: 1 }, '-=0.3')
  if (items.length) tl.to(items, { y: 0, autoAlpha: 1, stagger: 0.07 }, '-=0.28')
  if (footer) tl.to(footer, { autoAlpha: 1 }, '-=0.12')

  entrance = tl
}

onMounted(async () => {
  await nextTick()
  animateIn()
})

// 卡片总览 ↔ 文章列表、以及版块之间切换时重新播放
watch([viewMode, sectionQuery], async () => {
  await nextTick()
  animateIn()
})

onUnmounted(() => {
  entrance?.kill()
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

/* 卡片总览用更宽的容器 */
.home__content--wide {
  max-width: 1040px;
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

.home__subtitle-note {
  margin-left: 10px;
  padding-left: 10px;
  font-size: 0.8rem;
  color: var(--gray-400);
  border-left: 1px solid var(--border);
}

.home__back {
  display: inline-block;
  margin-bottom: 14px;
  font-size: 0.8rem;
  color: var(--gray-500);
  text-decoration: none;
  transition: color 0.2s;
}

.home__back:hover {
  color: var(--blue-700);
}

/* ===== 文件夹卡片网格 ===== */
.folder-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

@media (max-width: 760px) {
  .folder-grid {
    grid-template-columns: 1fr;
  }
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
