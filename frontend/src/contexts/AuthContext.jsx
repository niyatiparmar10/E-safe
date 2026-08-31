import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import * as authService from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authService
      .getCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false))
  }, [])

  async function login(credentials) {
    const nextUser = await authService.login(credentials)
    setUser(nextUser)
    return nextUser
  }

  async function signup(accountDetails) {
    const nextUser = await authService.signup(accountDetails)
    setUser(nextUser)
    return nextUser
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
