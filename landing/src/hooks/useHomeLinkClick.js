import { useLocation } from 'react-router-dom'

/**
 * useHomeLinkClick
 *
 * On the home route, a Home link should scroll to the top
 * instead of navigating to the same URL. Other routes keep
 * the default <Link> navigation. ScrollToTop covers the
 * navigate case; this only handles the already-there case.
 */

export function useHomeLinkClick() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const onHomeClick = (e) => {
    if (!isHome) return
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return { isHome, onHomeClick }
}
