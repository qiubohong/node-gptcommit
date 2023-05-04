import { defineConfig } from 'vite'
import { viteExternalsPlugin } from 'vite-plugin-externals'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    viteExternalsPlugin({
      vue: 'Vue',
      'tdesign-vue-next': 'TDesign',
    })
  ],
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        background: 'src/background.ts',
      },
      output: {
        entryFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
        chunkFileNames: `[name].js`,
      },
    },
  },
})
