import {defineConfig} from 'vite'
import type {PluginOption, UserConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {resolve, dirname} from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const buildType = process.env.BUILD_TYPE


const sharedOutput = {
    entryFileNames: `[name].js`,
    chunkFileNames: `[name].js`,
    assetFileNames: `[name].[ext]`,
}

const plugins: PluginOption[] = [react()]

const resolveInput = (name: string, path: string) => ({
    build: {
        outDir: 'dist',
        emptyOutDir: name === 'popup',
        rollupOptions: {
            input: {
                [name]: resolve(__dirname, path)
            },
            output: {
                format: name === 'serviceWorker' ? 'esm' : 'iife',
                ...sharedOutput
            }
        }
    },
    plugins
} satisfies UserConfig)

export default defineConfig((): UserConfig => {
    switch (buildType) {
        case 'serviceWorker':
            return resolveInput('serviceWorker', 'src/vehicle-extension/scripts/serviceWorker/serviceWorker.ts')
        case 'content-content':
            return resolveInput('content', 'src/vehicle-extension/scripts/content/content.ts')
        case 'content-chooseLanguage':
            return resolveInput('chooseLanguage', 'src/vehicle-extension/scripts/content/chooseLanguage.ts')
        default:
            return resolveInput('popup', 'index.html')
    }
})