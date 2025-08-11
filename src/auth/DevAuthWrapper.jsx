import { useEffect, useState } from 'react'
import { OidcConfigProvider, OidcTokenBridge, debugStorageState } from './OidcProvider'
import AuthWall from './AuthWall'
import { setAuthTokenGetter } from '../lib/api'
import Cookies from 'js-cookie'

// Dev mode authentication bypass
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.MODE === 'development'

// Debug component for development
function DebugPanel() {
  const [cookieState, setCookieState] = useState({})

  const refreshCookieState = () => {
    try {
      const allCookies = Cookies.get()
      setCookieState(allCookies)
    } catch (error) {
      console.error('Error reading cookies:', error)
    }
  }

  useEffect(() => {
    refreshCookieState()
    const interval = setInterval(refreshCookieState, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium">🔧 Debug Panel</span>
        <div className="flex gap-2">
          <button 
            onClick={debugStorageState}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Debug Storage
          </button>
          <button 
            onClick={refreshCookieState}
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-medium">Cookies:</div>
        <div className="max-h-20 overflow-y-auto">
          {Object.keys(cookieState).length === 0 ? (
            <span className="text-gray-500">No cookies found</span>
          ) : (
            Object.entries(cookieState).map(([key, value]) => (
              <div key={key} className="text-gray-600">
                <span className="font-mono">{key}:</span> {value ? 'present' : 'null'}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Dev mode wrapper that bypasses OIDC
function DevModeWrapper({ children }) {
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    if (DEV_MODE) {
      // In dev mode, bypass authentication
      console.log('🔧 Running in DEV MODE - Authentication bypassed')
      console.log('🔧 Environment variables:', {
        VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
        MODE: import.meta.env.MODE,
        VITE_API_URL: import.meta.env.VITE_API_URL
      })
      
      // Set mock token for API calls
      setAuthTokenGetter(() => {
        console.log('🔧 Dev mode: Returning mock token')
        return Promise.resolve('dev-mock-token')
      })
    } else {
      console.log('🔐 Running in PRODUCTION MODE - Using OIDC authentication')
    }
  }, [])

  if (DEV_MODE) {
    return (
      <div className="min-h-screen">
        {/* Dev mode indicator */}
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800">
          <div className="flex items-center justify-between">
            <span>🔧 Development Mode - Authentication bypassed</span>
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
          </div>
        </div>
        {showDebug && <DebugPanel />}
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