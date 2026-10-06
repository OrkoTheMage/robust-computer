import { useEffect, useRef, useState } from 'react'

/**
 * useNavbar
 *
 * Owns the site-menu modal and the mobile panel. The mobile
 * scrim does not take hits, so an outside press both closes
 * the panel and would activate whatever sits under the dim.
 * That one click is swallowed.
 */

export function useNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const stickyRef = useRef(null)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    const onPointerDown = (e) => {
      if (stickyRef.current?.contains(e.target)) return
      setMobileOpen(false)
      const swallow = (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        document.removeEventListener('click', swallow, true)
      }
      document.addEventListener('click', swallow, true)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [mobileOpen])

  return {
    menuOpen,
    mobileOpen,
    stickyRef,
    openMenu: () => {
      setMobileOpen(false)
      setMenuOpen(true)
    },
    closeMenu: () => setMenuOpen(false),
    toggleMobile: () => setMobileOpen((open) => !open),
    closeMobile: () => setMobileOpen(false),
  }
}
