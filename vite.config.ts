import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // 自定义域名下部署在根路径
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      // 确保 Markdown 文件被正确处理
      external: [],
    },
  },
})
