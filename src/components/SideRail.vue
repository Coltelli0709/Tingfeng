<template>
  <div class="side-rail" :class="{ 'side-rail--open': showFriends || showAbout }">
    <!-- 功能栏 -->
    <nav class="side-rail__bar" aria-label="快捷功能">
      <RouterLink
        to="/"
        class="side-rail__btn"
        :class="{ 'side-rail__btn--active': isHome }"
        title="总览"
      >
        <svg
          class="side-rail__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span class="side-rail__label">总览</span>
      </RouterLink>

      <button
        type="button"
        class="side-rail__btn"
        :class="{ 'side-rail__btn--active': showFriends }"
        :aria-expanded="showFriends"
        title="友链"
        @click="toggleFriends"
      >
        <svg
          class="side-rail__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span class="side-rail__label">友链</span>
      </button>

      <button
        type="button"
        class="side-rail__btn"
        :class="{ 'side-rail__btn--active': showAbout }"
        :aria-expanded="showAbout"
        title="关于"
        @click="toggleAbout"
      >
        <svg
          class="side-rail__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
        <span class="side-rail__label">关于</span>
      </button>

      <button
        type="button"
        class="side-rail__btn"
        title="回到顶部"
        @click="toTop"
      >
        <svg
          class="side-rail__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
        <span class="side-rail__label">顶部</span>
      </button>
    </nav>

    <!-- 友链卡片面板 -->
    <transition name="friends-pop">
      <section v-if="showFriends" class="friends-panel" aria-label="友链">
        <header class="friends-panel__head">
          <h2 class="friends-panel__title">友链</h2>
          <button
            type="button"
            class="friends-panel__close"
            title="关闭"
            @click="showFriends = false"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <p v-if="friends.length === 0" class="friends-panel__empty">
          还没有友链。<br />在 <code>code/friends.md</code> 里添加第一条吧。
        </p>

        <ul v-else class="friends-panel__list">
          <li v-for="f in friends" :key="f.name" class="friend-card">
            <a
              class="friend-card__link"
              :href="f.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="friend-card__avatar">
                <img
                  v-if="f.avatar && !isBroken(f.name)"
                  :src="f.avatar"
                  :alt="f.name"
                  loading="lazy"
                  @error="markBroken(f.name)"
                />
                <span v-else class="friend-card__initial">{{ f.name.slice(0, 1) }}</span>
              </span>
              <span class="friend-card__info">
                <span class="friend-card__name">{{ f.name }}</span>
                <span v-if="f.desc" class="friend-card__desc">{{ f.desc }}</span>
                <span class="friend-card__host">{{ hostOf(f.url) }}</span>
              </span>
            </a>
          </li>
        </ul>
      </section>
    </transition>

    <!-- 关于我 / About me 面板 -->
    <transition name="friends-pop">
      <section v-if="showAbout" class="about-panel" aria-label="关于我">
        <header class="friends-panel__head">
          <h2 class="friends-panel__title">About me</h2>
          <button
            type="button"
            class="friends-panel__close"
            title="关闭"
            @click="showAbout = false"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <p v-if="about.bio" class="about-panel__bio">{{ about.bio }}</p>

        <ul class="about-panel__list">
          <li v-if="about.githubUrl" class="about-item">
            <span class="about-item__label">GitHub</span>
            <a
              class="about-item__value"
              :href="about.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
            >{{ about.github }}</a>
          </li>
          <li v-if="about.email" class="about-item">
            <span class="about-item__label">Email</span>
            <a class="about-item__value" :href="`mailto:${about.email}`">
              {{ about.email }}
            </a>
          </li>
        </ul>
      </section>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { friends } from '@/utils/friends'
import { about } from '@/utils/about'

const route = useRoute()

/* 无 section 参数时首页是卡片总览，「总览」高亮 */
const isHome = computed(
  () => route.path === '/' && !route.query.section,
)

const showFriends = ref(false)
const showAbout = ref(false)
const broken = ref<string[]>([])

// 路由变化时收起面板
watch(
  () => route.fullPath,
  () => {
    showFriends.value = false
    showAbout.value = false
  },
)

function toggleFriends() {
  showFriends.value = !showFriends.value
  if (showFriends.value) showAbout.value = false
}

function toggleAbout() {
  showAbout.value = !showAbout.value
  if (showAbout.value) showFriends.value = false
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function markBroken(name: string) {
  if (!broken.value.includes(name)) broken.value = [...broken.value, name]
}
function isBroken(name: string) {
  return broken.value.includes(name)
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function onDocClick(e: MouseEvent) {
  if (!showFriends.value && !showAbout.value) return
  const el = e.target as HTMLElement | null
  if (!el?.closest('.side-rail')) {
    showFriends.value = false
    showAbout.value = false
  }
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    showFriends.value = false
    showAbout.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.side-rail {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 200;
}

.side-rail__bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 128px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 8px 28px rgba(30, 58, 95, 0.1);
}

.side-rail__btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  font-family: var(--font-sans);
  font-size: 0.82rem;
  color: var(--gray-500);
  background: transparent;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, transform 0.2s;
}

.side-rail__btn:hover {
  color: var(--blue-700);
  background: var(--blue-50);
  transform: translateX(2px);
}

.side-rail__btn--active {
  color: var(--white);
  background: var(--blue-700);
}

.side-rail__btn--active:hover {
  color: var(--white);
  background: var(--accent-hover);
  transform: none;
}

.side-rail__icon {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
}

.side-rail__label {
  font-size: 0.82rem;
  line-height: 1;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* ===== 友链面板 ===== */
.friends-panel {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 12px;
  width: 300px;
  max-height: min(70vh, 560px);
  overflow-y: auto;
  padding: 16px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 12px 40px rgba(30, 58, 95, 0.14);
}

.friends-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.friends-panel__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-900);
}

.friends-panel__close {
  display: flex;
  padding: 4px;
  color: var(--gray-400);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.friends-panel__close svg {
  width: 16px;
  height: 16px;
}

.friends-panel__close:hover {
  color: var(--blue-700);
  background: var(--blue-50);
}

.friends-panel__empty {
  font-size: 0.85rem;
  color: var(--gray-400);
  line-height: 1.8;
}

.friends-panel__empty code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 1px 5px;
  background: var(--gray-100);
  border-radius: 4px;
  color: var(--blue-800);
}

.friends-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
}

.friend-card__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}

.friend-card__link:hover {
  border-color: var(--blue-500);
  background: var(--blue-50);
  transform: translateX(2px);
}

.friend-card__avatar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  background: var(--blue-100);
  color: var(--blue-700);
  border-radius: 50%;
  font-weight: 600;
  font-size: 1rem;
}

.friend-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-card__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.friend-card__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-900);
}

.friend-card__desc {
  overflow: hidden;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--gray-500);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-card__host {
  font-size: 0.72rem;
  color: var(--blue-500);
}

/* ===== 关于我面板 ===== */
.about-panel {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 12px;
  width: 300px;
  max-height: min(70vh, 560px);
  overflow-y: auto;
  padding: 16px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 12px 40px rgba(30, 58, 95, 0.14);
}

.about-panel__bio {
  margin-bottom: 12px;
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--gray-500);
}

.about-panel__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
}

.about-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.about-item__label {
  flex: 0 0 auto;
  min-width: 52px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gray-400);
}

.about-item__value {
  min-width: 0;
  overflow: hidden;
  font-size: 0.88rem;
  color: var(--blue-700);
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.about-item__value:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

/* 过渡 */
.friends-pop-enter-active,
.friends-pop-leave-active {
  transition: opacity 0.2s ease;
}
.friends-pop-enter-from,
.friends-pop-leave-to {
  opacity: 0;
}

/* ===== 较窄屏幕：功能栏移到屏幕底部中间，保证正文居中 ===== */
@media (max-width: 1239px) {
  .side-rail {
    left: 50%;
    top: auto;
    bottom: 16px;
    transform: translateX(-50%);
  }

  .side-rail__bar {
    width: auto;
    flex-direction: row;
  }

  .side-rail__btn {
    width: auto;
    flex-direction: column;
    gap: 3px;
    padding: 7px 10px;
  }

  .side-rail__btn:hover {
    transform: none;
  }

  .side-rail__label {
    font-size: 0.66rem;
  }

  .friends-panel,
  .about-panel {
    left: 50%;
    top: auto;
    bottom: calc(100% + 10px);
    transform: translateX(-50%);
    margin-left: 0;
    width: min(340px, calc(100vw - 24px));
    max-height: 60vh;
  }
}
</style>
