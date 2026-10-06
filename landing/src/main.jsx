/**
 * main
 *
 * ReactDOM root. Loads the global CSS, mounts <App /> inside a
 * BrowserRouter. No providers yet — auth/theme/toast context can
 * be added here as needed, outermost-first.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
