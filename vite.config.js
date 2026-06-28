import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost'

  return {
    base: './',
    plugins: [vue()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(projectRoot, 'index.html'),
          cetPractice2026: resolve(projectRoot, 'cet-practice-2026.html'),
          cetWriting2026: resolve(projectRoot, 'cet-writing-2026.html')
        }
      }
    },
    server: {
      proxy: {
        '/h5': {
          target: proxyTarget,
          changeOrigin: true
        }
      }
    }
  }
})
