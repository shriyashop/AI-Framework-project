import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Build-only config. The console is compiled in a throwaway Docker step and served
// as static files by the Studio API; Node never runs at runtime.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { outDir: 'dist', sourcemap: false },
})
