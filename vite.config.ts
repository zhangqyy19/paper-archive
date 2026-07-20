import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// For GitHub Pages: base './' keeps assets relative so it works under any subpath.
// Combined with HashRouter, refreshes never 404.
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
})