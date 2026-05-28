<template>
  <div ref="pageRef" class="home">
    <div class="container">
      <!-- 页面标题 -->
      <div ref="heroRef" class="home__hero">
        <h1 class="home__title">文章</h1>
        <p class="home__subtitle">
          共 {{ filteredPosts.length }} 篇
          <template v-if="activeCategory !== '全部'">
            · {{ activeCategory }}
          </template>
        </p>
      </div>

      <!-- 分类筛选 -->
      <div ref="tabsRef" class="home__tabs-wrap">
        <CategoryTabs
          :categories="allCategories"
          :active="activeCategory"
          :count-map="countMap"
          @select="onCategorySelect"
        />
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { allPosts, allCategories } from '@/utils/posts'
import CategoryTabs from '@/components/CategoryTabs.vue'
import ArticleCard from '@/components/ArticleCard.vue'

const route = useRoute()
const router = useRouter()

const pageRef = ref<HTMLElement>()
const heroRef = ref<HTMLElement>()
const tabsRef = ref<HTMLElement>()
const listRef = ref<InstanceType<typeof TransitionGroup>>()
const footerRef = ref<HTMLElement>()

const activeCategory = ref<string>(
  (route.query.cat as string) || '全部',
)

const filteredPosts = computed(() => {
  if (activeCategory.value === '全部') return allPosts
  return allPosts.filter((p) => p.category === activeCategory.value)
})

const countMap = computed(() => {
  const map: Record<string, number> = { 全部: allPosts.length }
  for (const p of allPosts) {
    const c = p.category || '未分类'
    map[c] = (map[c] || 0) + 1
  }
  return map
})

function onCategorySelect(cat: string) {
  activeCategory.value = cat
  router.replace({ query: cat === '全部' ? {} : { cat } })
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
        gsap.set([heroRef.value, tabsRef.value, footerRef.value], { autoAlpha: 1 })
        gsap.set(listRef.value?.$el?.children ?? [], { autoAlpha: 1 })
        return
      }

      const dist = isDesktop ? 24 : 14
      const staggerTime = isDesktop ? 0.08 : 0.06
      const children = listRef.value?.$el ? gsap.utils.toArray(listRef.value.$el.children) : []

      // 先设初始态
      gsap.set(heroRef.value, { y: dist, autoAlpha: 0 })
      gsap.set(tabsRef.value, { y: dist * 0.6, autoAlpha: 0 })
      gsap.set(children, { y: dist, autoAlpha: 0 })
      gsap.set(footerRef.value, { autoAlpha: 0 })

      // 依次入场
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.55 } })
      tl.to(heroRef.value, { y: 0, autoAlpha: 1 })
        .to(tabsRef.value, { y: 0, autoAlpha: 1 }, '-=0.35')
        .to(children, { y: 0, autoAlpha: 1, stagger: staggerTime }, '-=0.25')
        .to(footerRef.value, { autoAlpha: 1 }, '-=0.15')

      return () => tl.kill()
    },
  )
})
</script>

<style scoped>
.home {
  padding-top: 32px;
  padding-bottom: 64px;
  min-height: calc(100vh - var(--header-height));
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
