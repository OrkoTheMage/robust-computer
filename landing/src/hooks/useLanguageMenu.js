import { useEffect, useRef, useState } from 'react'

/**
 * useLanguageMenu
 *
 * Open state for the language control. The dropdown variant
 * closes on Escape and on an outside click. The modal variant
 * leaves that to the Modal primitive.
 */

export function useLanguageMenu(variant) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const isModal = variant === 'modal'

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

  return {
    open,
    wrapRef,
    isModal,
    close: () => setOpen(false),
    toggle: () => setOpen((current) => !current),
  }
}
