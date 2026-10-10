import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../context/LocaleContext'

/**
 * useLanguageMenu
 *
 * Open state + select action for the language control. The
 * dropdown variant closes on Escape and on an outside click;
 * the modal variant leaves that to the Modal primitive.
 *
 * `select(code, isAvailable)` calls `setLocale(code)` and
 * closes the menu. The caller (LanguageButton's row
 * renderer) is responsible for guarding unavailable
 * languages before calling — the guard sits in the row so
 * the section body stays a clean JSX return.
 *
 * The hook owns open / close / toggle / select; the section
 * is left with the renderRow JSX composition. The
 * `onAfterSelect` callback (used by the mobile panel to
 * dismiss itself) is the section's concern, not the
 * hook's.
 */

export function useLanguageMenu(variant) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const isModal = variant === 'modal'
  const { setLocale } = useLocale()

  useEffect(() => {
    if (!open || isModal) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e) => {
      if (wrapRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open, isModal])

  const close = () => setOpen(false)
  const toggle = () => setOpen((current) => !current)
  const select = (code) => {
    setLocale(code)
    close()
  }

  return {
    open,
    wrapRef,
    isModal,
    close,
    toggle,
    select,
  }
}
