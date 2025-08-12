import { useEffect } from 'react'
import { OidcConfigProvider, OidcTokenBridge } from './OidcProvider'
import AuthWall from './AuthWall'
import { setAuthTokenGetter } from '../lib/api'

// Dev mode authentication bypass
const DEV_MODE = false // Force production mode
console.log('🔧 DevAuthWrapper: VITE_DEV_MODE =', import.meta.env.VITE_DEV_MODE)
console.log('🔧 DevAuthWrapper: DEV_MODE =', DEV_MODE)
console.log('🔧 DevAuthWrapper: FORCED PRODUCTION MODE')



// Dev mode wrapper that bypasses OIDC
function DevModeWrapper({ children }) {

  useEffect(() => {
    console.log('🔧 DevAuthWrapper: DEV_MODE =', DEV_MODE)
    
    if (DEV_MODE) {
      // In dev mode, bypass authentication
      console.log('🔧 Running in DEV MODE - Authentication bypassed')
      
      // Set mock token for API calls
      setAuthTokenGetter(() => {
        console.log('🔧 Dev mode: Returning mock token')
        return Promise.resolve('dev-mock-token')
      })
    } else {
      console.log('🔐 Running in PRODUCTION MODE - Using OIDC authentication')
      
      // Don't clear the token getter here - let OidcTokenBridge handle it
      // setAuthTokenGetter(null)
    }
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