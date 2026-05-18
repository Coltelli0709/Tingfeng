import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { title: '听风 · Coltelli的一隅自留地' },
    },
    {
      path: '/post/:slug',
      name: 'Post',
      component: () => import('@/views/Post.vue'),
      meta: { title: '听风 · 文章' },
    },
    {
      // 404 重定向到首页
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// 动态更新页面标题（post 详情页由 Post.vue 自行管理）
router.afterEach((to) => {
  if (to.name === 'Post') return
  document.title = (to.meta.title as string) || '听风 · Coltelli的一隅自留地'
})

export default router
