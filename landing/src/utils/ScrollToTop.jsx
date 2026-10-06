/**
 * landing/src/utils/ScrollToTop.jsx
 *
 * Watches the current pathname and snaps the window to the top of
 * the page on every navigation. React Router v6 keeps the same
 * component instance across route changes, so without this the
 * viewport keeps its previous scroll position when navigating
 * between pages.
 *
 * `behavior: 'instant'` overrides the page's CSS `scroll-behavior:
 * smooth` so the snap is immediate rather than animated. If you
 * later add a hash anchor (e.g. /about#team), the browser handles
 * that natively; this component only fires on pathname changes.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default ScrollToTop
