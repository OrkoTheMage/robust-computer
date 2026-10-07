import { useState } from 'react'
import { api, ApiError } from '../api'
import { useLocale } from '../context/LocaleContext'

/**
 * useContactForm
 *
 * Owns the state for the project enquiry form on the contact page:
 * field values, the multi-select chip groups, the submission
 * lifecycle, and server-error surfacing.
 *
 * Returns a single binding object the page destructures directly.
 * The chip group options (`projectTypes`, `budgets`) come from
 * the locale dictionary, accessed via the page's own `useLocale()`
 * call — keeping them out of this hook's return value avoids a
 * locale change re-running the form's effect cycle for unrelated
 * reasons. The error fallback likewise reads from the dictionary
 * so a network failure renders the locale-appropriate message.
 *
 * Defaults
 *   `projectType` defaults to the first chip option (the
 *   dictionary's first entry), and `budget` defaults to the
 *   second (the "5k–15k" / "De 5k a 15k" middle range) — the
 *   same defaults the form had before the i18n split. Reading
 *   them off the dictionary at mount time keeps a future
 *   reordering of the chip arrays consistent with the form's
 *   initial state, and lets a locale re-order its chips
 *   without breaking that contract.
 */

export function useContactForm() {
  const { formErrors, projectTypes, budgets } = useLocale()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: projectTypes[0]?.value || '',
    budget: budgets[1]?.value || budgets[0]?.value || '',
    message: '',
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

  const handleChip = (group, value) => {
    setFormData((d) => ({ ...d, [group]: value }))
    if (fieldErrors[group]) {
      setFieldErrors((fe) => {
        const next = { ...fe }
        delete next[group]
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
      await api.post('/contact', formData)
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
        setError(formErrors.contactFallback)
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
    handleChip,
    handleSubmit,
  }
}
