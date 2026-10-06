/**
 * usePagination
 *
 * Minimal client-side pagination over an array. Caller hands
 * in the full list and a page size; the hook owns `page` and
 * returns the slice for the current page plus prev/next/goTo
 * handlers and the total page count.
 *
 * `page` is 1-indexed (more natural in UI — "page 1 of 3", not
 * "page 0 of 2"). The slice is recomputed via `useMemo` on
 * every render so a caller that mutates `items` upstream (e.g.
 * a sort, a filter, an async reload) gets the right slice
 * without having to reset the page.
 *
 * `page` is clamped to `[1, totalPages]` on every render, so a
 * caller that hands in a smaller array (or shrinks the array
 * after the user is already past the end) gets the last valid
 * page back without a stale-state render. The clamp is
 * computed from the current `page` state, not the previous
 * render's, so consecutive `setPage` calls in the same event
 * still stack correctly.
 *
 * Page state lives in the hook, not the URL, so:
 *   - reloads land on page 1 (the most common case — the list
 *     isn't usually deep-linked)
 *   - no router config to maintain for a feature that's purely
 *     about chunking a static list
 * If deep links become a real requirement, swap the
 * `useState` for `useSearchParams` — the rest of the hook
 * doesn't need to change.
 */

import { useCallback, useMemo, useState } from 'react'

export function usePagination(items, pageSize) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, safePage, pageSize])

  const next = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages))
  }, [totalPages])

  const prev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1))
  }, [])

  const goTo = useCallback(
    (p) => {
      setPage(Math.min(Math.max(1, p), totalPages))
    },
    [totalPages]
  )

  return {
    page: safePage,
    totalPages,
    pageItems,
    next,
    prev,
    goTo,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  }
}
