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
  // 匹配 GitHub 仓库名，部署后访问路径为 /Tingfeng/
  // 等自定义域名 DNS 生效后改回 '/'
  base: '/Tingfeng/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      // 确保 Markdown 文件被正确处理
      external: [],
    },
  },
})
