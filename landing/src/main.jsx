import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LocaleProvider } from './context/LocaleContext'
import { useImagePreloader } from './hooks/useImagePreloader'
import './styles/index.css'

/**
 * main
 *
 * ReactDOM root. Loads the global CSS and mounts <App /> inside
 * the BrowserRouter + LocaleProvider. The LocaleProvider sits
 * inside the router (so a future page-level translation override
 * could read the route) but outside App, so the entire page tree
 * reads the same locale.
 *
 * `<ImagePreloaderHost />` is mounted as a sibling of `App` —
 * it just calls the `useImagePreloader` hook, which only needs
 * the DOM. The host sits inside the BrowserRouter (so React
 * doesn't complain about context boundaries) and beside the
 * LocaleProvider; the preloader doesn't read either context.
 * The preloader runs once at startup to warm the browser's
 * image cache with every navbar icon variant; see
 * `hooks/useImagePreloader.js` for the rationale.
 *
 * `<html lang>` is managed by the provider itself — the initial
 * value in `index.html` matches `DEFAULT_LOCALE` ('en'); the
 * provider updates `document.documentElement.lang` on every
 * locale change so screen readers and search engines see the
 * correct attribute without each page having to touch it.
 */

const ImagePreloaderHost = () => {
  useImagePreloader()
  return null
}

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <BrowserRouter>
      <ImagePreloaderHost />
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>
)
