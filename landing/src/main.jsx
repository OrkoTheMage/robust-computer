import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LocaleProvider } from './context/LocaleContext'
import ImagePreloader from './components/ImagePreloader'
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
 * `<ImagePreloader />` is mounted as a sibling of `App` — it
 * doesn't need the locale or any router context, just the
 * DOM, so it sits outside both wrappers. The preloader runs
 * once at startup to warm the browser's image cache with
 * every navbar icon variant; see the component doc for why.
 *
 * `<html lang>` is managed by the provider itself — the initial
 * value in `index.html` matches `DEFAULT_LOCALE` ('en'); the
 * provider updates `document.documentElement.lang` on every
 * locale change so screen readers and search engines see the
 * correct attribute without each page having to touch it.
 */

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <BrowserRouter>
      <ImagePreloader />
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>
)
