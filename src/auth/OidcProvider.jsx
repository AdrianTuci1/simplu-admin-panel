import { AuthProvider, useAuth } from 'react-oidc-context'
import { setAuthTokenGetter } from '../lib/api'

export function OidcConfigProvider({ children }) {
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN
  const cognitoAuthConfig = {
    authority: cognitoDomain,
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_APP_URL || window.location.origin,
    response_type: 'code',
    scope: 'phone openid email',
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
  return (
    <AuthProvider
      {...cognitoAuthConfig}
      onSigninCallback={(user) => {
        // remove OIDC artifacts from callback url
        const url = new URL(window.location.href)
        url.searchParams.delete('code')
        url.searchParams.delete('state')
        url.searchParams.delete('session_state')
        window.history.replaceState({}, document.title, url.pathname + (url.search ? `?${url.searchParams.toString()}` : ''))
      }}
    >
      {children}
    </AuthProvider>
  )
}

export function OidcTokenBridge({ children }) {
  const auth = useAuth()
  setAuthTokenGetter(async () => auth.user?.access_token || auth.user?.id_token)
  return children
}

export function signOutRedirect() {
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
  const logoutUri = import.meta.env.VITE_APP_URL || window.location.origin
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN 
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`
}

