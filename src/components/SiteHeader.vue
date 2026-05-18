<template>
  <header class="site-header">
    <div class="site-header__inner container">
      <router-link to="/" class="site-header__logo">
        <span class="site-header__brand">听风</span>
        <span class="site-header__sep">·</span>
        <span class="site-header__tagline">Coltelli 的一隅自留地</span>
      </router-link>
      <nav class="site-header__nav">
        <router-link to="/" class="site-header__link" active-class="site-header__link--active">
          文章
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
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
  transition: all 0.2s;
  text-decoration: none;
}

.site-header__link:hover {
  color: var(--blue-700);
  background: var(--blue-50);
}

.site-header__link--active {
  color: var(--blue-700);
  background: var(--blue-50);
  font-weight: 600;
}
</style>
