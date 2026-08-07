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
    // public/ 下的文件（含 public/html）会在构建时原样拷贝到 dist/
    // 访问路径为：域名/html/xxx.html
    build: {
      rollupOptions: {
        input: {
          main: resolve(projectRoot, 'index.html')
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
