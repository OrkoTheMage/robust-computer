/**
 * preloadImages
 *
 * Pre-populates the browser's image cache with every URL in the
 * list. Triggered by assigning each URL to a fresh `Image()`
 * instance's `src` — the browser fetches the resource as soon
 * as `src` is set and stores the decoded image in its image
 * cache. Subsequent `<img src=…>` renders with the same URL
 * hit the cache instead of the network, so there's no visible
 * "pop in" when the navbar swaps to a different per-route icon.
 *
 * The function returns immediately — it does NOT await the
 * requests. Callers fire-and-forget; the cache fills in the
 * background while the rest of the app continues to mount.
 *
 * The `Image()` instances are intentionally not retained:
 * once the browser has started the fetch, holding a JS
 * reference would only pin them in memory without any
 * measurable benefit (the cache lives in the browser, not in
 * the JS heap).
 *
 * Idempotent in the cache sense — calling this twice doesn't
 * re-download anything, the browser just reuses the cache entry.
 *
 * Pair with `<ImagePreloader />` so this runs once at app
 * startup instead of per-component.
 */

export function preloadImages(urls) {
  for (const url of urls) {
    const img = new Image()
    img.src = url
  }
}
