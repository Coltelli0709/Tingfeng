<template>
  <div class="project-view">
    <header class="bamboo-header">
      <router-link to="/" class="bamboo-back-btn">
        ← 回竹屋
      </router-link>
      <h1 class="bamboo-page-title">竹简架 · 项目</h1>
    </header>

    <div class="bamboo-content">
      <!-- 私库概览卡片 -->
      <div class="bamboo-card stats-card">
        <div class="stats-card__row">
          <div class="stats-card__item">
            <span class="stats-card__label">公开竹简</span>
            <span class="stats-card__value">{{ publicCount }}</span>
            <span class="stats-card__unit">卷</span>
          </div>
          <div class="stats-card__divider" />
          <div class="stats-card__item stats-card__item--private">
            <span class="stats-card__label">私库珍藏</span>
            <span class="stats-card__value">{{ privateCount }}</span>
            <span class="stats-card__unit">卷</span>
            <span class="stats-card__seal">常闭</span>
          </div>
        </div>
      </div>

      <!-- 加载 / 错误状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-state__spinner" />
        <p>正在展阅竹简…</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p>竹简暂不可阅，请稍后再试。</p>
        <button class="bamboo-back-btn" @click="fetchRepos">重新取简</button>
      </div>

      <!-- 公开项目列表 -->
      <template v-else>
        <TransitionGroup name="repo-list" tag="div" class="repo-grid">
          <article
            v-for="repo in repos"
            :key="repo.id"
            class="bamboo-card repo-card"
          >
            <div class="repo-card__header">
              <h3 class="repo-card__name">
                <a :href="repo.html_url" target="_blank" rel="noopener">
                  {{ repo.name }}
                </a>
              </h3>
              <span v-if="repo.language" class="repo-card__lang">
                {{ repo.language }}
              </span>
            </div>
            <p v-if="repo.description" class="repo-card__desc">
              {{ repo.description }}
            </p>
            <div class="repo-card__meta">
              <span v-if="repo.stargazers_count > 0" class="repo-card__stat">
                ★ {{ repo.stargazers_count }}
              </span>
              <span v-if="repo.forks_count > 0" class="repo-card__stat">
                ⑂ {{ repo.forks_count }}
              </span>
              <span class="repo-card__stat repo-card__stat--time">
                {{ formatDate(repo.updated_at) }}
              </span>
            </div>
          </article>
        </TransitionGroup>

        <p v-if="repos.length === 0" class="empty-state">
          架上尚无竹简。
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Repo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
}

const repos = ref<Repo[]>([])
const loading = ref(true)
const error = ref(false)
const privateCount = ref(0)
const publicCount = ref(0)

function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function fetchRepos() {
  loading.value = true
  error.value = false

  try {
    // 公开仓库从 GitHub API 获取
    const resp = await fetch('https://api.github.com/users/Coltelli/repos?per_page=100&sort=updated')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data: Repo[] = await resp.json()
    repos.value = data.filter(r => !r.name.startsWith('.')) // 过滤隐藏仓库
    publicCount.value = repos.value.length
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }

  // 私有仓库数从静态 JSON 读取
  try {
    const statsResp = await fetch('/src/data/github_stats.json')
    if (statsResp.ok) {
      const stats = await statsResp.json()
      privateCount.value = stats.private_repos ?? 0
    }
  } catch {
    privateCount.value = 0
  }
}

onMounted(fetchRepos)
</script>

<style scoped>
.project-view {
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    175deg,
    #f5f0e1 0%,
    #efe8d5 30%,
    #e8dfc8 100%
  );
  overflow: hidden;
}

/* 私库卡片 */
.stats-card {
  margin-bottom: 24px;
}

.stats-card__row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 6vw, 48px);
  padding: 12px 0;
}

.stats-card__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.stats-card__item--private .stats-card__label,
.stats-card__item--private .stats-card__value {
  opacity: 0.7;
}

.stats-card__seal {
  position: absolute;
  bottom: -14px;
  right: -12px;
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: 10px;
  color: #8b7750;
  opacity: 0.5;
  transform: rotate(-12deg);
  background: rgba(245, 240, 225, 0.8);
  padding: 1px 4px;
  border-radius: 2px;
}

.stats-card__label {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(12px, 1.4vw, 15px);
  color: #5a6b4a;
  opacity: 0.8;
}

.stats-card__value {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: bold;
  color: #3a4a2a;
  line-height: 1;
}

.stats-card__unit {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(10px, 1.2vw, 13px);
  color: #5a6b4a;
  opacity: 0.6;
}

.stats-card__divider {
  width: 1px;
  height: 48px;
  background: rgba(139, 119, 80, 0.2);
}

/* 仓库网格 */
.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: clamp(12px, 2vw, 18px);
}

.repo-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.repo-card__name a {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(15px, 1.6vw, 18px);
  color: #3a4a2a;
  text-decoration: none;
  font-weight: normal;
  transition: color 0.2s;
}

.repo-card__name a:hover {
  color: #5a8a3a;
}

.repo-card__lang {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: 11px;
  color: #6b7a5a;
  background: rgba(45, 74, 34, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.repo-card__desc {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(12px, 1.3vw, 14px);
  color: #5a5a5a;
  line-height: 1.6;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.repo-card__meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.repo-card__stat {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(11px, 1.2vw, 13px);
  color: #7a6b5a;
}

.repo-card__stat--time {
  margin-left: auto;
  opacity: 0.6;
}

/* 加载与错误状态 */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: clamp(40px, 10vw, 80px) 20px;
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  color: #5a6b4a;
}

.loading-state__spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 16px;
  border: 2px solid rgba(45, 74, 34, 0.15);
  border-top-color: #3a5a2a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 列表过渡动画 */
.repo-list-enter-active {
  transition: all 0.4s ease;
}

.repo-list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
</style>
