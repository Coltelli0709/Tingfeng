<template>
  <header ref="headerRef" class="site-header">
    <div class="site-header__inner container">
      <router-link to="/" class="site-header__logo">
        <span ref="brandRef" class="site-header__brand">听风</span>
        <span ref="sepRef" class="site-header__sep">·</span>
        <span ref="taglineRef" class="site-header__tagline">Coltelli 的一隅自留地</span>
      </router-link>

      <!-- 右上角：RSS 订阅入口 -->
      <div ref="rssWrapRef" class="site-header__rss">
        <button
          type="button"
          class="site-header__rss-btn"
          :aria-expanded="showRss"
          aria-haspopup="dialog"
          title="RSS 订阅"
          @click="toggleRss"
        >
          <svg
            class="site-header__rss-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M4 11a9 9 0 0 1 9 9" />
            <path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span class="site-header__rss-label">RSS</span>
        </button>

        <transition name="rss-pop">
          <div v-if="showRss" class="rss-panel" role="dialog" aria-label="RSS 订阅">
            <p class="rss-panel__title">订阅「听风」</p>
            <p class="rss-panel__desc">
              新文章写入后自动更新，用任意 RSS 阅读器添加下面这个地址即可。
            </p>

            <div class="rss-panel__row">
              <code class="rss-panel__url">{{ feedUrl }}</code>
              <button type="button" class="rss-panel__copy" @click="copyFeed">
                {{ copied ? '已复制' : '复制' }}
              </button>
            </div>

            <a
              class="rss-panel__link"
              :href="feedUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              在浏览器中打开 feed.xml →
            </a>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const headerRef = ref<HTMLElement>()
const brandRef = ref<HTMLElement>()
const sepRef = ref<HTMLElement>()
const taglineRef = ref<HTMLElement>()
const rssWrapRef = ref<HTMLElement>()

/* ---- RSS 订阅面板 ---- */
const showRss = ref(false)
const copied = ref(false)
const feedUrl = ref('/feed.xml')
let copyTimer: number | undefined

function toggleRss() {
  showRss.value = !showRss.value
  if (!showRss.value) copied.value = false
}

async function copyFeed() {
  const url = feedUrl.value.startsWith('http')
    ? feedUrl.value
    : `${window.location.origin}/feed.xml`

  try {
    await navigator.clipboard.writeText(url)
  } catch {
    // 非安全上下文 / 旧浏览器：textarea 兜底
    const ta = document.createElement('textarea')
    ta.value = url
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }

  copied.value = true
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => (copied.value = false), 1600)
}

function onDocClick(e: MouseEvent) {
  if (!showRss.value) return
  const el = e.target as HTMLElement | null
  if (!el?.closest('.site-header__rss')) showRss.value = false
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') showRss.value = false
}

onMounted(() => {
  feedUrl.value = `${window.location.origin}/feed.xml`
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)

  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // 标题区内部元素依次滑入
    const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } })
    tl.from(brandRef.value, { y: -12, autoAlpha: 0 })
      .from(sepRef.value, { autoAlpha: 0 }, '-=0.3')
      .from(taglineRef.value, { x: -8, autoAlpha: 0 }, '-=0.25')
      .from(rssWrapRef.value, { autoAlpha: 0, y: -8 }, '-=0.25')

    return () => tl.kill()
  })

  // header 底部边框淡入
  gsap.fromTo(
    headerRef.value,
    { borderBottomColor: 'rgba(226, 232, 240, 0)' },
    { borderBottomColor: 'rgba(226, 232, 240, 1)', duration: 0.6, ease: 'power1.out' },
  )
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
  window.clearTimeout(copyTimer)
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
  gap: 16px;
  max-width: 920px;
  height: 100%;
}

.site-header__logo {
  display: flex;
  flex: 0 0 auto;
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

/* ===== 右上角 RSS 入口 ===== */
.site-header__rss {
  position: relative;
  flex: 0 0 auto;
  margin-left: auto;
}

.site-header__rss-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--gray-500);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 100px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.site-header__rss-btn:hover,
.site-header__rss-btn[aria-expanded='true'] {
  color: var(--blue-700);
  border-color: var(--blue-500);
  background: var(--blue-50);
}

.site-header__rss-icon {
  width: 15px;
  height: 15px;
}

/* 订阅面板 */
.rss-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 292px;
  padding: 16px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 12px 40px rgba(30, 58, 95, 0.14);
}

.rss-panel__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray-900);
}

.rss-panel__desc {
  margin-top: 6px;
  font-size: 0.78rem;
  line-height: 1.7;
  color: var(--gray-500);
}

.rss-panel__row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 10px;
  background: var(--gray-50);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.rss-panel__url {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  color: var(--blue-800);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rss-panel__copy {
  flex: 0 0 auto;
  padding: 3px 8px;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  color: var(--blue-700);
  background: var(--white);
  border: 1px solid var(--blue-100);
  border-radius: 5px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.rss-panel__copy:hover {
  color: var(--accent-hover);
  border-color: var(--blue-500);
}

.rss-panel__link {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.76rem;
  color: var(--blue-700);
  text-decoration: none;
  transition: color 0.2s;
}

.rss-panel__link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

/* 淡入 */
.rss-pop-enter-active,
.rss-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.rss-pop-enter-from,
.rss-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 900px) {
  .site-header__tagline {
    display: none;
  }
}

@media (max-width: 600px) {
  .site-header__rss-label {
    display: none;
  }

  .site-header__rss-btn {
    padding: 7px 9px;
  }

  .rss-panel {
    width: min(292px, calc(100vw - 32px));
  }
}
</style>
