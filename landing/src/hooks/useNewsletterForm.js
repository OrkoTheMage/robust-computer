import { useState } from 'react'
import { api, ApiError } from '../api'

/**
 * useNewsletterForm
 *
 * Owns the state for the Field Notes newsletter signup. Just an
 * email + submission status — the section renders the status string
 * itself.
 *
 * `status` shape:
 *   'idle'    — initial / after edit
 *   'success' — new signup, sent the welcome email
 *   'already' — already on the list, no new email sent (different
 *               message so we don't pretend a fresh welcome is in
 *               the user's inbox)
 *   'error'   — request failed; see `errorMessage` for what to show
 *
 * `errorMessage` is populated from the server's response body
 * (validation, rate limit, etc.) when available, or from the
 * `api.js` network-failure message when the request didn't reach
 * the server at all. Both messages are already user-facing, so
 * they're rendered verbatim instead of being bucketed into a
 * generic "Something went wrong" string.
 */

export function useNewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState(null)

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (status !== 'idle') {
      setStatus('idle')
      setErrorMessage(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setStatus('idle')
    setErrorMessage(null)
    setSubmitting(true)
    try {
      const res = await api.post('/newsletter', { email })
      // Server returns { ok: true, alreadySubscribed: true } for an
      // address that's already on the list. Don't claim a new
      // welcome email is on the way in that case.
      setStatus(res?.alreadySubscribed ? 'already' : 'success')
      setEmail('')
    } catch (err) {
      if (err instanceof ApiError) {
        // The message is already user-facing: "Please enter a valid
        // email address." for a 400, "Too many subscribe attempts..."
        // for a 429, or "Could not reach the server. Check your
        // connection and try again." for a network failure.
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Something went wrong. Please try again.')
      }
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    email,
    submitting,
    status,
    errorMessage,
    handleChange,
    handleSubmit,
  }
}
