import { useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'

export default function AuthWall({ children }) {
  const auth = useAuth()
  const redirectingRef = useRef(false)

  useEffect(() => {
    if (auth.isLoading) {
      console.log('⏳ Auth is loading...')
      return
    }

    if (auth.error) {
      console.error('❌ Auth error:', auth.error)
    }

    if (!auth.isAuthenticated && !auth.activeNavigator && !redirectingRef.current) {
      console.log('🔄 Redirecting to sign in...')
      redirectingRef.current = true
      auth.signinRedirect().catch((error) => {
        console.error('❌ Failed to redirect to sign in:', error)
        redirectingRef.current = false
      })
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, auth.error, auth.user])

  // Reset redirecting flag when authentication state changes
  useEffect(() => {
    if (auth.isAuthenticated) {
      redirectingRef.current = false
    }
  }, [auth.isAuthenticated])

  if (auth.isLoading || (!auth.isAuthenticated && auth.activeNavigator)) {
    console.log('⏳ AuthWall: Loading or redirecting...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            {auth.isLoading ? 'Se încarcă autentificarea...' : 'Se redirecționează...'}
          </p>
        </div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    console.log('🚫 AuthWall: Not authenticated')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Redirecționare către pagina de autentificare...
          </p>
          {auth.error && (
            <p className="text-sm text-red-600">
              Eroare: {auth.error.message}
            </p>
          )}
        </div>
      </div>
    )
  }

  console.log('✅ AuthWall: User authenticated, rendering children')
  return children
}

