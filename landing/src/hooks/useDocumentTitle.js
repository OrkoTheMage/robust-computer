/**
 * useDocumentTitle
 *
 * Sets `document.title` for the lifetime of the calling component
 * and restores the previous title on unmount. Page components call
 * it once with their full title — the hook handles the " | Robust
 * Computer" suffix so each call site only states its own bit.
 *
 *   useDocumentTitle('About')   // → "Robust Computer | About"
 *   useDocumentTitle('Contact') // → "Robust Computer | Contact"
 *
 * Pass an empty string to set just the base title (e.g. the home
 * page). SSR-safe: no-op on the server.
 */

import { useEffect } from 'react'

const BASE = 'Robust Computer'
const SEP = ' | '

export function useDocumentTitle(suffix) {
  useEffect(() => {
    const previous = document.title
    const next = suffix ? `${BASE}${SEP}${suffix}` : BASE
    if (next !== previous) document.title = next
    return () => {
      if (document.title === next) document.title = previous
    }
  }, [suffix])
}
