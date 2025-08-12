import { AuthProvider, useAuth } from 'react-oidc-context'
import { useEffect } from 'react'
import { setAuthTokenGetter } from '../lib/api'
import Cookies from 'js-cookie'

export function OidcConfigProvider({ children }) {
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN
  

  const cognitoAuthConfig = {
    authority: cognitoDomain,
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_APP_URL || window.location.origin,
    response_type: 'code',
    scope: 'phone openid email',
    // Add session management configuration
    monitorSession: true,
    checkSessionIntervalInSeconds: 60,
    // Add token management
    automaticSilentRenew: true,
    silent_redirect_uri: import.meta.env.VITE_APP_URL || window.location.origin,
    // Add state management configuration
    loadUserInfo: true,
    // Add PKCE for better security
    code_challenge_method: 'S256',

    // Manual configuration for AWS Cognito endpoints
    metadata: {
      issuer: cognitoDomain,
      authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
      token_endpoint: `${cognitoDomain}/oauth2/token`,
      userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
      jwks_uri: `${cognitoDomain}/.well-known/jwks.json`,
      end_session_endpoint: `${cognitoDomain}/logout`
    }
  }

  console.log('🔐 OIDC Config:', {
    authority: cognitoDomain,
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
    redirect_uri: cognitoAuthConfig.redirect_uri,
    scope: cognitoAuthConfig.scope
  })

  return (
    <AuthProvider
      {...cognitoAuthConfig}
      onSigninCallback={(user) => {
        console.log('✅ User signed in:', user?.profile?.email)
        
        // Remove OIDC artifacts from callback url
        const url = new URL(window.location.href)
        url.searchParams.delete('code')
        url.searchParams.delete('state')
        url.searchParams.delete('session_state')
        window.history.replaceState({}, document.title, url.pathname)
      }}
      onSignoutCallback={() => {
        console.log('🚪 User signed out')
      }}
      onSilentRenewError={(error) => {
        console.error('❌ Silent renew error:', error)
      }}
    >
      {children}
    </AuthProvider>
  )
}

export function OidcTokenBridge({ children }) {
  const auth = useAuth()
  
  useEffect(() => {
    console.log('🔗 OidcTokenBridge: Auth state changed', {
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      hasUser: !!auth.user,
      error: auth.error?.message
    })
  }, [auth.isLoading, auth.isAuthenticated, auth.user, auth.error])
  
  // Set up token getter with better error handling
  useEffect(() => {
    console.log('🔗 OidcTokenBridge: Setting up token getter')
    console.log('🔗 OidcTokenBridge: Auth state:', {
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      hasUser: !!auth.user,
      user: auth.user
    })
    
    setAuthTokenGetter(async () => {
      try {
        if (!auth.user) {
          console.warn('⚠️ No user found in auth context')
          return null
        }
        
        console.log('🔍 Available tokens in user object:', {
          hasAccessToken: !!auth.user.access_token,
          hasIdToken: !!auth.user.id_token,
          hasRefreshToken: !!auth.user.refresh_token,
          tokenExpiresAt: auth.user.expires_at
        })
        
        // For Cognito, we should use access_token for API calls, not id_token
        const token = auth.user.access_token
        console.log('🔑 Token type being used:', token ? 'access_token' : 'no token')
        console.log('🔑 Available tokens:', {
          access_token: !!auth.user.access_token,
          id_token: !!auth.user.id_token,
          refresh_token: !!auth.user.refresh_token
        })
        if (!token) {
          console.warn('⚠️ No access_token found in user object')
          return null
        }
        
        // Check if token is expired
        if (auth.user.expires_at) {
          const now = Math.floor(Date.now() / 1000)
          if (auth.user.expires_at < now) {
            console.warn('⚠️ Token is expired, expires_at:', auth.user.expires_at, 'current time:', now)
            // Try to trigger token refresh
            try {
              await auth.signinSilent()
              console.log('🔄 Token refreshed successfully')
              return auth.user.access_token
            } catch (refreshError) {
              console.error('❌ Failed to refresh token:', refreshError)
              return null
            }
          }
        }
        
        console.log('🔑 Token retrieved successfully')
        console.log('🔑 Token type:', auth.user.access_token ? 'access_token' : 'id_token')
        console.log('🔑 Token length:', token.length)
        console.log('🔑 Token preview:', token.substring(0, 20) + '...')
        
        // Check if token is in valid JWT format (should have 3 parts separated by dots)
        const tokenParts = token.split('.')
        if (tokenParts.length !== 3) {
          console.warn('⚠️ Token does not appear to be in valid JWT format')
        } else {
          console.log('✅ Token appears to be in valid JWT format')
        }
        
        return token
      } catch (error) {
        console.error('❌ Error getting auth token:', error)
        return null
      }
    })
    
    // Cleanup function to clear token getter when component unmounts
    return () => {
      console.log('🧹 Cleaning up token getter')
      setAuthTokenGetter(null)
    }
  }, [auth.user])
  
  return children
}

export function signOutRedirect() {
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  const logoutUri = import.meta.env.VITE_APP_URL || window.location.origin
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN 
  
  console.log('🚪 Signing out, redirecting to:', `${cognitoDomain}/logout`)
  
  // Clear any stored tokens and cookies
  try {
    // Clear OIDC cookies
    const allCookies = Cookies.get()
    Object.keys(allCookies).forEach(key => {
      if (key.includes('oidc') || key.includes('user_')) {
        Cookies.remove(key, { path: '/' })
      }
    })
  } catch (e) {
    console.warn('Failed to clear stored tokens:', e)
  }
  
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
}

// Debug function to check storage state
export function debugStorageState() {
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

