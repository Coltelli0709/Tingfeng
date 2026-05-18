<template>
  <div class="game-view">
    <header class="bamboo-header">
      <router-link to="/" class="bamboo-back-btn">
        ← 回竹屋
      </router-link>
      <h1 class="bamboo-page-title">镜中世界</h1>
    </header>

    <div class="bamboo-content">
      <div class="bamboo-card game-placeholder">
        <div class="game-placeholder__mirror">
          <div class="game-placeholder__mist" />
          <div class="game-placeholder__text">
            <p class="game-placeholder__title">镜中自有天地</p>
            <p class="game-placeholder__desc">
              此间尚未开辟。<br />
              待他日采撷星辉、浇灌竹根，<br />
              镜中世界自会显现。
            </p>
            <p class="game-placeholder__hint">
              — 小游戏模块，静待构筑 —
            </p>
          </div>
        </div>
      </div>

      <!-- localStorage 收集进度示意 -->
      <div v-if="shardsCollected > 0" class="bamboo-card shards-card">
        <p class="shards-card__label">已收集古籍碎片</p>
        <p class="shards-card__count">{{ shardsCollected }}</p>
        <p class="shards-card__hint">
          这些碎片会影响竹屋的外观，回到竹屋看看吧。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const shardsCollected = ref(0)

onMounted(() => {
  try {
    const saved = localStorage.getItem('bamboo-house-shards')
    if (saved) {
      shardsCollected.value = JSON.parse(saved).length ?? 0
    }
  } catch {
    shardsCollected.value = 0
  }
})
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    175deg,
    #e8e4d8 0%,
    #ddd8c8 30%,
    #d5cfbd 100%
  );
  overflow: hidden;
}

.game-placeholder {
  text-align: center;
  padding: clamp(40px, 8vw, 80px) clamp(20px, 5vw, 40px);
  cursor: default;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-placeholder__mirror {
  position: relative;
  max-width: 360px;
  margin: 0 auto;
  padding: clamp(40px, 8vw, 60px) clamp(20px, 4vw, 32px);
  background: radial-gradient(
    ellipse at center,
    rgba(192, 192, 192, 0.08) 0%,
    rgba(180, 180, 180, 0.04) 50%,
    transparent 70%
  );
  border: 1px solid rgba(139, 119, 80, 0.15);
  border-radius: 12px;
}

.game-placeholder__mist {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 30% 50%,
    rgba(180, 180, 180, 0.1) 0%,
    transparent 60%
  );
  border-radius: 12px;
  animation: mist-drift 5s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes mist-drift {
  0% { opacity: 0.4; }
  100% { opacity: 0.8; }
}

.game-placeholder__title {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(18px, 2.2vw, 26px);
  color: #3a4a2a;
  margin: 0 0 24px;
  letter-spacing: 0.2em;
}

.game-placeholder__desc {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(13px, 1.4vw, 16px);
  color: #6a6a6a;
  line-height: 2;
  margin: 0 0 24px;
}

.game-placeholder__hint {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(11px, 1.2vw, 13px);
  color: #8b7750;
  opacity: 0.6;
  margin: 0;
}

/* 碎片收集卡片 */
.shards-card {
  text-align: center;
}

.shards-card__label {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(12px, 1.3vw, 15px);
  color: #5a6b4a;
  margin: 0 0 8px;
}

.shards-card__count {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: bold;
  color: #3a4a2a;
  margin: 0 0 8px;
}

.shards-card__hint {
  font-family: 'FangSong', '仿宋', 'STFangsong', serif;
  font-size: clamp(11px, 1.2vw, 13px);
  color: #8b7750;
  opacity: 0.6;
  margin: 0;
}
</style>
