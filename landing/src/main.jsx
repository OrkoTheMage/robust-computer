import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LocaleProvider } from './context/LocaleContext'
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
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>
)
