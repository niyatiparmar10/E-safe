import { appConfig } from '../config/env'

let accessToken = null

export class ApiError extends Error {
  constructor({ status = 0, code = 'NETWORK_ERROR', message = 'Unable to complete the request.', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function setAccessToken(token) {
  // Real token persistence is intentionally not implemented in this prototype.
  accessToken = token || null
}

export async function apiRequest(path, { method = 'GET', body, formData, headers = {} } = {}) {
  const requestHeaders = { ...headers }
  if (accessToken) requestHeaders.Authorization = `Bearer ${accessToken}`
  let requestBody

  if (formData) {
    requestBody = formData
  } else if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
    requestBody = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${appConfig.apiBaseUrl}${path}`, { method, headers: requestHeaders, body: requestBody, credentials: 'include' })
  } catch {
    throw new ApiError()
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null
  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: payload?.error?.code || 'REQUEST_FAILED',
      message: payload?.error?.message || 'Unable to complete the request.',
      details: payload?.error?.details || null,
    })
  }
  return payload
}
