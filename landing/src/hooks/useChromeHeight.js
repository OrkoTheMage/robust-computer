import { useEffect, useState } from 'react'

/**
 * useChromeHeight
 *
 * Sum of the fixed page chrome (TopBar + Navbar) above any
 * scrollable section. Used by the home page to size the first
 * viewport so a band pinned to the bottom of the opening is
 * actually visible on page load.
 *
 * Looks up the two elements by their data-chrome attribute, so
 * the components don't need to know about this hook. Falls back
 * to a sensible estimate on the server and on the first render,
 * which keeps the layout from jumping once the real value lands.
 */

const FALLBACK = 145

const measure = () => {
  if (typeof document === 'undefined') return FALLBACK
  const top = document.querySelector('[data-chrome="top"]')
  const nav = document.querySelector('[data-chrome="nav"]')
  const h = (top?.offsetHeight || 0) + (nav?.offsetHeight || 0)
  return h || FALLBACK
}

export function useChromeHeight() {
  const [height, setHeight] = useState(FALLBACK)

  useEffect(() => {
    const update = () => setHeight(measure())
    update()
    const onResize = () => update()
    window.addEventListener('resize', onResize)
    // The two chrome elements can change height (mobile panel
    // open, font load, etc.), so watch them individually.
    const elements = document.querySelectorAll('[data-chrome]')
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(update)
      : null
    elements.forEach((el) => observer?.observe(el))
    return () => {
      window.removeEventListener('resize', onResize)
      observer?.disconnect()
    }
  }, [])

  return height
}
