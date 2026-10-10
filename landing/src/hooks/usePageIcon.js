import { useLocation, useParams } from 'react-router-dom'
import { getPostBySlug } from '../data/feed'

/**
 * usePageIcon
 *
 * Returns the navbar-icon src for the current route. The mapping
 * lives in one place here (a single `route → variant` map) so the
 * navbar doesn't have to know which icon goes with which page —
 * adding a new "this page gets this icon" rule is a one-line edit.
 *
 * The navbar icon is the brand mark. It only swaps to a thematic
 * variant on routes that have a meaningful one (about, contact,
 * rss, …). Home, the catch-all NotFound page, and any path that
 * doesn't match a known route all fall back to the default brand
 * icon — the 404 page already has its own illustration in the
 * body of `NotFound.jsx`, so the navbar should stay on-brand
 * instead of doubling up.
 *
 * Resolution order:
 *   1. Defensive — outside a router, `pathname` can be undefined.
 *      Returns the brand icon instead of crashing.
 *   2. Field-notes section — the index and every valid slug
 *      post share the rss icon. An invalid slug falls through
 *      to the brand default because the NotFound page takes
 *      over (see `pages/Post.jsx`).
 *   3. Exact match against ROUTE_VARIANT for every defined
 *      route. A `null` variant means "use the default brand
 *      icon" (the home route).
 *   4. Fallback — anything not matched (including the catch-all
 *      `<Route path="*">` NotFound page) returns the default
 *      brand icon.
 */

// Single source of truth: pathname → variant key. `null`
// resolves to the default brand icon.
const ROUTE_VARIANT = {
  '/':            null,
  '/about':       'about',
  '/bug-report':  'bug',
  '/contact':     'contact',
  '/privacy':     'legal',
  '/terms':       'legal',
  '/unsubscribe': 'unsub',
}

// Variant key → asset src. All assets live under
// `/public/icons/` and are referenced as absolute paths so the
// hook doesn't need to know Vite's public base.
const VARIANT_SRC = {
  about:    '/icons/icon-var-about.svg',
  bug:      '/icons/icon-var-bug.svg',
  contact:  '/icons/icon-var-contact.svg',
  rss:      '/icons/icon-var-rss.svg',
  legal:    '/icons/icon-var-legal.svg',
  unsub:    '/icons/icon-var-unsub.svg',
}

const DEFAULT_SRC = '/icons/icon.svg'

// Every navbar icon URL in one place. Used by
// `<ImagePreloader />` to warm the browser's image cache at
// startup so swapping icons never has to fetch on first
// paint. Derived from the variant map and the default
// instead of being hand-listed, so adding a new variant
// in `VARIANT_SRC` automatically extends the preload set.
export const ALL_NAVBAR_ICON_URLS = [
  DEFAULT_SRC,
  ...Object.values(VARIANT_SRC),
]

export function usePageIcon() {
  const { pathname } = useLocation()
  const params = useParams()

  // Defensive: outside a router, `pathname` can be undefined.
  if (typeof pathname !== 'string') return DEFAULT_SRC

  // Field-notes section. The /field-notes index and every
  // valid slug post share the rss icon. A slug that doesn't
  // resolve to a real post is on the NotFound page rendered
  // by Post.jsx (which falls through to <NotFound/> when
  // getPostBySlug returns null), so the navbar should stay
  // on the brand default — matching the rule for every 404.
  if (pathname === '/field-notes' || pathname.startsWith('/field-notes/')) {
    if (params.slug && !getPostBySlug(params.slug)) return DEFAULT_SRC
    return VARIANT_SRC.rss
  }

  if (Object.prototype.hasOwnProperty.call(ROUTE_VARIANT, pathname)) {
    const variant = ROUTE_VARIANT[pathname]
    return variant ? VARIANT_SRC[variant] : DEFAULT_SRC
  }

  // Anything not matched (including the catch-all <Route
  // path="*"> NotFound page) stays on the default brand icon.
  return DEFAULT_SRC
}
