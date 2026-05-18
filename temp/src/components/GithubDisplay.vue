<template>
  <div class="github-display">
    <span class="github-display__label">私库</span>
    <span class="github-display__count">{{ privateCount }}</span>
    <span class="github-display__unit">卷</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// 静态导入 CI 注入的 JSON（Vite 在构建时内联）
import stats from '@/data/github_stats.json'

const privateCount = computed(() => stats.private_repos ?? 0)
</script>

<style scoped>
.github-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  color: #4a5a3a;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.github-display__label {
  font-size: clamp(10px, 1.2vw, 14px);
  opacity: 0.8;
  letter-spacing: 0.15em;
}

.github-display__count {
  font-size: clamp(24px, 3.5vw, 42px);
  font-weight: bold;
  line-height: 1;
}

.github-display__unit {
  font-size: clamp(10px, 1.2vw, 14px);
  opacity: 0.6;
}
</style>
