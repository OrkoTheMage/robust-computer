import { useState } from 'react'
import { api, ApiError } from '../api'

/**
 * useBugReportForm
 *
 * Owns the state for the bug-report form on the /bug-report page:
 * field values, submission lifecycle, and server-error surfacing.
 *
 * The form is anonymous-friendly — name + email are optional, the
 * three repro fields (what you were doing / what you expected /
 * what happened) are required. Mirrors the useContactForm API
 * (returns one binding object the page destructures).
 */

export function useBugReportForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatWereYouDoing: '',
    whatExpected: '',
    whatHappened: '',
    browserDevice: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((d) => ({ ...d, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((fe) => {
        const next = { ...fe }
        delete next[name]
        return next
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSubmitting(true)
    try {
      await api.post('/bug-report', formData)
      setSubmitted(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.data && Array.isArray(err.data.details)) {
          const fe = {}
          for (const d of err.data.details) {
            if (d.field) fe[d.field] = d.message
          }
          setFieldErrors(fe)
        }
      } else {
        setError('Could not send the report. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    formData,
    submitting,
    submitted,
    error,
    fieldErrors,
    handleChange,
    handleSubmit,
  }
}
