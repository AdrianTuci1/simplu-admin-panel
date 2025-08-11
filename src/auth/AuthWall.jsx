import { useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'

export default function AuthWall({ children }) {
  const auth = useAuth()
  const redirectingRef = useRef(false)

  useEffect(() => {
    if (auth.isLoading) return
    if (!auth.isAuthenticated && !auth.activeNavigator && !redirectingRef.current) {
      redirectingRef.current = true
      auth.signinRedirect()
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator])

  if (auth.isLoading || (!auth.isAuthenticated && auth.activeNavigator)) return null
  if (!auth.isAuthenticated) return null
  return children
}

