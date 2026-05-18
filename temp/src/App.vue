<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'bamboo-fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 处理浏览器后退：竹屋内物件状态与路由同步
  if (window.location.hash) {
    const hash = window.location.hash.slice(1)
    const target = document.querySelector(`[data-room-object="${hash}"]`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})
</script>

<style>
/* 全局样式 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: 'FangSong', '仿宋', 'FZShuTi', 'STFangsong', serif;
  color: #3a3a3a;
  background: #2d4a22;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 路由过渡动画 */
.bamboo-fade-enter-active,
.bamboo-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.bamboo-fade-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.bamboo-fade-leave-to {
  opacity: 0;
  transform: scale(1.04);
}

/* 页面滑入动画（从竹屋到子页面） */
.bamboo-slide-enter-active,
.bamboo-slide-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.bamboo-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.bamboo-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(45, 74, 34, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(45, 74, 34, 0.5);
}
</style>
