<template>
  <header ref="headerRef" class="site-header">
    <div class="site-header__inner container">
      <router-link to="/" class="site-header__logo">
        <span ref="brandRef" class="site-header__brand">听风</span>
        <span ref="sepRef" class="site-header__sep">·</span>
        <span ref="taglineRef" class="site-header__tagline">Coltelli 的一隅自留地</span>
      </router-link>
      <nav ref="navRef" class="site-header__nav">
        <router-link
          v-for="cat in navCategories"
          :key="cat"
          :to="cat === allLink ? '/' : `/?cat=${cat}`"
          class="site-header__link"
          :class="{ 'site-header__link--active': isActive(cat) }"
        >
          {{ cat }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'
import { allCategories } from '@/utils/posts'

const allLink = '所有'

const navCategories = computed(() => {
  return [allLink, ...allCategories.filter((c) => c !== '全部')]
})

const route = useRoute()

function isActive(cat: string): boolean {
  if (cat === allLink) return !route.query.cat
  return route.query.cat === cat
}

const headerRef = ref<HTMLElement>()
const brandRef = ref<HTMLElement>()
const sepRef = ref<HTMLElement>()
const taglineRef = ref<HTMLElement>()
const navRef = ref<HTMLElement>()

onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // 导航栏内部元素依次滑入
    const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } })
    tl.from(brandRef.value, { y: -12, autoAlpha: 0 })
      .from(sepRef.value, { autoAlpha: 0 }, '-=0.3')
      .from(taglineRef.value, { x: -8, autoAlpha: 0 }, '-=0.25')
      .from(navRef.value, { y: -8, autoAlpha: 0 }, '-=0.3')

    return () => tl.kill()
  })

  // header 底部边框淡入
  gsap.fromTo(
    headerRef.value,
    { borderBottomColor: 'rgba(226, 232, 240, 0)' },
    { borderBottomColor: 'rgba(226, 232, 240, 1)', duration: 0.6, ease: 'power1.out' },
  )
})
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-height);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.site-header__logo {
  display: flex;
  align-items: baseline;
  gap: 6px;
  text-decoration: none;
}

.site-header__brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--blue-800);
  letter-spacing: -0.02em;
}

.site-header__sep {
  color: var(--gray-400);
  font-size: 1rem;
}

.site-header__tagline {
  font-size: 0.9rem;
  color: var(--gray-500);
  font-weight: 400;
}

.site-header__nav {
  display: flex;
  gap: 8px;
}

.site-header__link {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--gray-600);
  text-decoration: none;
}

.site-header__link:hover {
  color: var(--blue-700);
  background: var(--blue-50);
}
</style>
