import { useEffect } from 'react'
import { OidcConfigProvider, OidcTokenBridge } from './OidcProvider'
import AuthWall from './AuthWall'
import { setAuthTokenGetter } from '../lib/api'

// Dev mode authentication bypass
const DEV_MODE = false // Force production mode



// Dev mode wrapper that bypasses OIDC
function DevModeWrapper({ children }) {

  useEffect(() => {
    if (DEV_MODE) {
      // In dev mode, bypass authentication
      // Set mock token for API calls
      setAuthTokenGetter(() => {
        return Promise.resolve('dev-mock-token')
      })
    }
    // In production mode, let OidcTokenBridge handle it
  }, [])

  if (DEV_MODE) {
    return (
      <div className="min-h-screen">
        {/* Dev mode indicator */}
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800">
          <span>🔧 Development Mode - Authentication bypassed</span>
        </div>
        {children}
      </div>
    )
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