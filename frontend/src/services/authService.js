import { appConfig } from '../config/env'
import { mockUser } from '../mocks/mockData'
import { mockResponse } from './mockUtils'
import { apiRequest, setAccessToken } from './apiClient'

const DEVELOPMENT_SESSION_KEY = 'e-safe-development-session'
const DEVELOPMENT_ADMIN_EMAIL = 'admin@e-safe.dev'

function readDevelopmentSession() {
  try {
    const storedSession = window.localStorage.getItem(DEVELOPMENT_SESSION_KEY)
    return storedSession ? JSON.parse(storedSession) : null
  } catch {
    return null
  }
}

function saveDevelopmentSession(user) {
  // DEVELOPMENT ONLY: this deliberately excludes passwords and authentication tokens.
  const safeSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    preferredLanguage: user.preferredLanguage,
  }

  try {
    window.localStorage.setItem(DEVELOPMENT_SESSION_KEY, JSON.stringify(safeSession))
  } catch {
    // The mock flow continues even if a browser blocks local storage.
  }

  return safeSession
}

export async function getCurrentUser() {
  if (appConfig.useMockApi) return mockResponse(readDevelopmentSession())
  return apiRequest('/auth/me')
}

export async function login({ email, password }) {
  if (appConfig.useMockApi) {
    const isAdmin = email.trim().toLowerCase() === DEVELOPMENT_ADMIN_EMAIL
    return mockResponse(saveDevelopmentSession({
      ...mockUser,
      id: isAdmin ? 'admin-001' : mockUser.id,
      name: isAdmin ? 'E-Safe Admin' : mockUser.name,
      email,
      role: isAdmin ? 'admin' : 'worker',
    }))
  }
  const response = await apiRequest('/auth/login', { method: 'POST', body: { email, password } })
  setAccessToken(response.accessToken)
  return response.user
}

export async function signup({ name, email, password, preferredLanguage }) {
  if (appConfig.useMockApi) {
    return mockResponse(saveDevelopmentSession({
      ...mockUser,
      id: `worker-${Date.now()}`,
      name,
      email,
      preferredLanguage,
    }))
  }
  const response = await apiRequest('/auth/signup', { method: 'POST', body: { fullName: name, email, password, preferredLanguage } })
  setAccessToken(response.accessToken)
  return response.user
}

export async function logout() {
  if (appConfig.useMockApi) {
    try {
      window.localStorage.removeItem(DEVELOPMENT_SESSION_KEY)
    } catch {
      // Nothing else is needed when storage is unavailable.
    }
    return mockResponse({ success: true })
  }
  setAccessToken(null)
  return { success: true }
}
