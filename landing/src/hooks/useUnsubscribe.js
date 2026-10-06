/**
 * useUnsubscribe
 *
 * Reads the `?email=…` query string from the current URL and
 * fires `POST /api/unsubscribe` once on mount. The page renders
 * one of four `status` states:
 *
 *   'loading' — request in flight. Render a "Unsubscribing…"
 *               card so the page doesn't flash the success copy
 *               before the network call has actually returned.
 *   'success' — server returned 200 (whether the address was on
 *               the list or not). Render the "you're off the
 *               list" confirmation.
 *   'error'   — request failed or the server rejected the
 *               payload. `errorMessage` carries the user-facing
 *               string from the server, or the api.js network
 *               failure message, or a generic fallback.
 *   'idle'    — no `?email=` in the URL at all. Render the
 *               "this link is broken" card instead of firing a
 *               request with an empty body.
 *
 * `email` is exposed on the binding so the confirmation card
 * can show which address was unsubscribed (the user just
 * clicked a link in an email — confirming the address back to
 * them is reassuring).
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../api'

export function useUnsubscribe() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (!email) {
      // No email in the URL — there's nothing to send. Skip the
      // request entirely so the server doesn't see a 400.
      setStatus('idle')
      return
    }

    let cancelled = false
    setStatus('loading')
    setErrorMessage(null)

    api
      .post('/unsubscribe', { email })
      .then(() => {
        if (!cancelled) setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError) {
          setErrorMessage(err.message)
        } else {
          setErrorMessage('Could not unsubscribe right now. Try again in a moment.')
        }
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [email])

  return { email, status, errorMessage }
}
