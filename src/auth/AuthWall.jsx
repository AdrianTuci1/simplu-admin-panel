import { useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'
import Cookies from 'js-cookie'

// Debug function to check storage state
function debugStorageState() {
  console.log('🔍 Debug Storage State:')
  
  try {
    const allCookies = Cookies.get()
    console.log('🍪 All cookies:', allCookies)
    
    // Check for OIDC related keys
    const oidcKeys = Object.keys(allCookies).filter(key => key.includes('oidc'))
    console.log('🔐 OIDC keys in cookies:', oidcKeys)
    
    if (oidcKeys.length > 0) {
      oidcKeys.forEach(key => {
        try {
          const value = Cookies.get(key)
          console.log(`🔐 ${key}:`, value ? 'present' : 'null')
        } catch (e) {
          console.log(`🔐 ${key}: error reading`)
        }
      })
    }
    
    // Check for user related keys
    const userKeys = Object.keys(allCookies).filter(key => key.includes('user_'))
    console.log('👤 User keys in cookies:', userKeys)
    
    if (userKeys.length > 0) {
      userKeys.forEach(key => {
        try {
          const value = Cookies.get(key)
          console.log(`👤 ${key}:`, value ? 'present' : 'null')
        } catch (e) {
          console.log(`👤 ${key}: error reading`)
        }
      })
    }
  } catch (error) {
    console.error('❌ Error checking storage state:', error)
  }
}

export default function AuthWall({ children }) {
  const auth = useAuth()
  const redirectingRef = useRef(false)

  useEffect(() => {
    console.log('🔐 AuthWall state:', {
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      activeNavigator: auth.activeNavigator,
      user: auth.user ? 'present' : 'null',
      error: auth.error?.message
    })

    // Debug storage state if there are authentication issues
    if (auth.error || (!auth.isAuthenticated && !auth.isLoading)) {
      debugStorageState()
    }

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

