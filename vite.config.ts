import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/scripts/content/content.ts'),
        chooseLanguage: resolve(__dirname, 'src/scripts/content/chooseLanguage.ts'),
        serviceWorker: resolve(__dirname, 'src/scripts/serviceWorker/serviceWorker.ts'),
      },
      output: {
        format: 'esm',
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    },
    emptyOutDir: true
  },
  plugins: [react()]
})