import { useEffect } from 'react'
import { preloadImages } from '../utils/preloadImages'
import { ALL_NAVBAR_ICON_URLS } from '../hooks/usePageIcon'

// Extra URL the body renders besides the navbar. Lives here —
// not in the hook — because the navbar doesn't know about it
// and the hook's variant map only tracks navbar icons.
const EXTRA_ICON_URLS = [
  '/icons/icon-var-404.svg',
]

const URLS_TO_PRELOAD = [
  ...ALL_NAVBAR_ICON_URLS,
  ...EXTRA_ICON_URLS,
]

/**
 * ImagePreloader
 *
 * Renders nothing. Mount once at the top of the app (in
 * `main.jsx`, outside the route tree) to warm the browser's
 * image cache with every per-route navbar icon plus the
 * site's other small-but-ubiquitous icon assets. The navbar
 * then swaps icons instantly from cache instead of fetching
 * on first navigation.
 *
 * The effect runs on mount only — the URL list is static for
 * the lifetime of the app, so re-running on every render
 * would just re-prime requests the browser is already
 * satisfying from cache. In dev (StrictMode) the effect will
 * fire twice; the browser dedupes by URL, so the second pass
 * is a no-op rather than a duplicate download.
 */

export default function ImagePreloader() {
  useEffect(() => {
    preloadImages(URLS_TO_PRELOAD)
  }, [])
  return null
}
