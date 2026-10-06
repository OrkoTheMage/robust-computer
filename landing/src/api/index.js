/**
 * landing/src/api/index.js
 *
 * JSON `fetch` wrapper. One file, one shape. Pages and hooks consume
 * `api.get/post/put/del` and an `ApiError` class for typed catches.
 */

import config from '../config'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(endpoint, options = {}) {
  const init = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  }

  if (options.body && !(options.body instanceof FormData)) {
    init.body = JSON.stringify(options.body)
  }

  let response
  try {
    response = await fetch(`${config.apiUrl}/api${endpoint}`, init)
  } catch (err) {
    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
      0,
      null
    )
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // non-JSON response — fine, leave data as null
  }

  if (!response.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed (${response.status})`
    throw new ApiError(message, response.status, data)
  }

  return data
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  del: (endpoint) => request(endpoint, { method: 'DELETE' }),
}

export { ApiError }
