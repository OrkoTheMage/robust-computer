import { useState } from 'react'
import { api, ApiError } from '../api'

/**
 * useContactForm
 *
 * Owns the state for the project enquiry form on the contact page:
 * field values, the multi-select chip groups, the submission
 * lifecycle, and server-error surfacing.
 *
 * Returns a single binding object the page destructures directly.
 */

const PROJECT_TYPES = [
  { value: 'landing', label: 'Landing page' },
  { value: 'webapp', label: 'Web app' },
  { value: 'saas', label: 'SaaS platform' },
  { value: 'unsure', label: 'Not sure yet' },
]

const BUDGETS = [
  { value: 'under_5k', label: 'Under 5k' },
  { value: '5k_15k', label: '5k to 15k' },
  { value: '15k_50k', label: '15k to 50k' },
  { value: '50k_plus', label: '50k+' },
]

export { PROJECT_TYPES, BUDGETS }

export function useContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: 'landing',
    budget: '5k_15k',
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
        setError('Could not send the enquiry. Please try again.')
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
