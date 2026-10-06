/**
 * landing/src/utils/ScrollToTop.jsx
 *
 * Snaps the window to the top of the page on every navigation —
 * including clicks on a link to the page the user is already on.
 * React Router v6 keeps the same component instance across route
 * changes, so without this the viewport keeps its previous scroll
 * position when navigating between pages.
 *
 * Watches `location.key` (not `pathname`) so same-page clicks
 * also fire the snap. React Router generates a new `key` for
 * every navigation entry, even when the pathname is unchanged.
 * This makes the "click a link to the page you're on, get
 * scrolled to the top" behavior work for every page, not just
 * home.
 *
 * Skips the snap when `location.hash` is set, so hash anchors
 * (e.g. `/about#team`) still scroll to the anchored element via
 * the browser's native handling. Without this guard, the snap
 * to top would race the browser's hash-scroll and the anchored
 * element would never be in view.
 *
 * `behavior: 'smooth'` is the explicit pass-through of the page's
 * CSS `scroll-behavior: smooth`. The animation is desired here —
 * clicking a link (including a same-page link) should glide the
 * viewport to the top rather than snap. Hash anchors continue to
 * use the browser's native jump (also smooth, via the same CSS).
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const location = useLocation()
  useEffect(() => {
    if (location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [location.key])
  return null
}

export default ScrollToTop
