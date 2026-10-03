/**
 * useNewsletterForm
 *
 * Owns the state for the Field Notes newsletter signup. Just an
 * email + submission status — the section renders the status string
 * itself.
 */

import { useState } from 'react'
import { api, ApiError } from '../api'

export function useNewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle' | 'success' | 'error'

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (status !== 'idle') setStatus('idle')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setStatus('idle')
    setSubmitting(true)
    try {
      await api.post('/newsletter', { email })
      setStatus('success')
      setEmail('')
    } catch (err) {
      if (err instanceof ApiError) {
        setStatus('error')
      } else {
        setStatus('error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return { email, submitting, status, handleChange, handleSubmit }
}
