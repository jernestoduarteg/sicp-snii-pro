import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  publicDir: false,
  base: './',
  build: {
    outDir: 'dist-standalone',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, 'js/main.js'),
      formats: ['iife'],
      name: 'SICP',
      fileName: () => 'bundle.js'
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        globals: {}
      }
    }
  },
  resolve: {
    alias: { '@': '/js' }
  }
});
