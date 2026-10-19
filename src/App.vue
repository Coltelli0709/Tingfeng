<template>
  <div class="app-shell">
    <SiteHeader />
    <SideRail />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import SiteHeader from '@/components/SiteHeader.vue'
import SideRail from '@/components/SideRail.vue'
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}

/* 宽屏：为左侧列表式功能栏预留空间，避免压住正文 */
@media (min-width: 1024px) {
  .app-main {
    padding-left: 184px;
  }
}

@media (min-width: 1280px) {
  .app-main {
    padding-left: 208px;
  }
}
</style>
