import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ── shutdown logging ──────────────────────────────────────────────────
// Vite handles SIGINT/SIGTERM silently. Register here so the landing's
// shutdown is visible alongside the server's in the wrapper.
//
// Idempotent: a second signal during shutdown is a no-op, so we don't
// log twice if concurrently or the user sends another signal.
//
// Force-exit after a short grace period. Vite's cleanup closes the dev
// server, but open HMR sockets / file watchers can keep the process
// alive past the point where the port should be released — which then
// blocks the next `yarn dev` from binding 3000.
let shuttingDown = false

const handleSignal = (signal) => {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`🛑 Received ${signal}, shutting down landing...`)
  setTimeout(() => process.exit(0), 500).unref()
}

process.on('SIGINT', () => handleSignal('SIGINT'))
process.on('SIGTERM', () => handleSignal('SIGTERM'))

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
