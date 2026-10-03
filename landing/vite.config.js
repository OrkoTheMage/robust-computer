import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Landing config — env files live at the repo root, NOT here. The
// dev wrapper boots this with the right --mode and PORT injected, so
// the proxy target reads from process.env.PORT.
export default defineConfig({
  plugins: [react()],
  envDir: '../',
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 5000}`,
        changeOrigin: true,
      },
    },
  },
})
