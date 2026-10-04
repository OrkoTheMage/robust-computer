/**
 * Modal
 *
 * Centered dialog with a dimmed backdrop. Closes on:
 *   - backdrop click
 *   - close button click
 *   - Escape key
 *   - the consumer calling onClose
 *
 * Renders nothing when `open` is false. Traps focus at mount via
 * the `dialog` role + autoFocus on the close button. The body
 * scroll is locked while the modal is open.
 *
 * Visual: matches the rest of the brand — thick black borders,
 * hard offset shadow, mono uppercase close button.
 */

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled from '@emotion/styled'
import { X } from 'lucide-react'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
`

const Card = styled.div`
  background: var(--paper);
  border: 4px solid #000;
  box-shadow: 10px 10px 0 var(--gold);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  position: relative;
  font-family: var(--body);
  color: #000;
`

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border: 3px solid #000;
  background: #000;
  color: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 14px;
  padding: 0;
  line-height: 1;
  transition: transform 80ms ease, box-shadow 80ms ease;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 var(--gold);
  }
  &:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 var(--gold);
  }
  &:focus-visible {
    outline: 3px solid var(--gold-deep);
    outline-offset: 3px;
  }
`

const Modal = ({ open, onClose, ariaLabel, children }) => {
  const cardRef = useRef(null)
  const closeBtnRef = useRef(null)

  // Escape key + body scroll lock
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Focus the close button on open for keyboard users
    closeBtnRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <Overlay
      onMouseDown={(e) => {
        // Close only when the click started on the overlay itself,
        // not when the user moused-down inside the card and dragged
        // out (which would otherwise close the modal mid-text-select).
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <Card
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <CloseBtn
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <X size={20} strokeWidth={2.5} />
        </CloseBtn>
        {children}
      </Card>
    </Overlay>,
    document.body
  )
}

export default Modal
