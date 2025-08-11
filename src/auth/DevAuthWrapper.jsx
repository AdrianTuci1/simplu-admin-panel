import { useEffect } from 'react'
import { OidcConfigProvider, OidcTokenBridge } from './OidcProvider'
import AuthWall from './AuthWall'
import { setAuthTokenGetter } from '../lib/api'

// Dev mode authentication bypass
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.MODE === 'development'

// Dev mode wrapper that bypasses OIDC
function DevModeWrapper({ children }) {
  useEffect(() => {
    if (DEV_MODE) {
      // In dev mode, bypass authentication
      console.log('🔧 Running in DEV MODE - Authentication bypassed')
      
      // Set mock token for API calls
      setAuthTokenGetter(() => Promise.resolve('dev-mock-token'))
    }
  }, [])

  if (DEV_MODE) {
    return children
  }
  
  // Production mode - use full OIDC flow
  return (
    <OidcConfigProvider>
      <OidcTokenBridge>
        <AuthWall>
          {children}
        </AuthWall>
      </OidcTokenBridge>
    </OidcConfigProvider>
  )
}

export default DevModeWrapper