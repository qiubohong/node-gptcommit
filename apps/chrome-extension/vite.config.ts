import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    // viteExternalsPlugin({
    //   vue: 'Vue',
    //   'tdesign-vue-next': 'TDesign',
    // })
  ],
  resolve: {
    alias: {
      'child_process': path.resolve(__dirname, 'src/utils/node.ts'),
    },
  },
  build: {
    target: 'es2015',
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
