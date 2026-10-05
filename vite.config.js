import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // 某些编辑器/同步工具在保存文件时会触发文件监控器的 EBUSY 崩溃；
    // 遇到时可用 VITE_NO_WATCH=1 禁用文件监控（改动后手动刷新页面）。
    watch: process.env.VITE_NO_WATCH ? null : {},
    // 开发环境下把 /api 请求代理到后端服务，前端代码里统一使用相对路径 /api/...
    // 部署时也可以用 Nginx 等反向代理实现同样的效果，或用 VITE_API_BASE_URL 指定后端地址。
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
