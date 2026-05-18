import { createRouter, createWebHistory } from 'vue-router'
import MainRoom from '@/views/MainRoom.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'MainRoom',
      component: MainRoom,
      meta: { transition: 'bamboo-fade' },
    },
    {
      path: '/projects',
      name: 'Projects',
      component: () => import('@/views/ProjectView.vue'),
      meta: { transition: 'bamboo-slide' },
    },
    {
      path: '/blog',
      name: 'Blog',
      component: () => import('@/views/BlogView.vue'),
      meta: { transition: 'bamboo-slide' },
    },
    {
      path: '/blog/:slug',
      name: 'BlogPost',
      component: () => import('@/views/BlogView.vue'),
      meta: { transition: 'bamboo-slide' },
    },
    {
      path: '/game',
      name: 'Game',
      component: () => import('@/views/GameView.vue'),
      meta: { transition: 'bamboo-slide' },
    },
    {
      // 404 回竹屋
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
