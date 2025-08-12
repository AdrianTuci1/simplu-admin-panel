const API_BASE_URL = import.meta.env.VITE_API_URL

let tokenGetter = null

// Helper function to decode JWT token (without verification)
function decodeJWT(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch (error) {
    console.error('❌ Error decoding JWT:', error)
    return null
  }
}

export function setAuthTokenGetter(getterFn) {
  tokenGetter = getterFn
}

// Helper function to make API requests with fetch
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  console.log('🌐 Making API request:', options.method || 'GET', endpoint)
  console.log('🌐 Full URL:', url)
  console.log('🔧 Token getter type:', typeof tokenGetter)
  console.log('🔧 Token getter is function:', typeof tokenGetter === 'function')
  console.log('🔧 Token getter value:', tokenGetter)
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (typeof tokenGetter === 'function') {
    try {
      console.log('🔧 Calling token getter...')
      const token = await tokenGetter()
      console.log('🔧 Token getter returned:', token ? 'token present' : 'no token')
      
      if (token) {
        // Try different authorization header formats
        headers.Authorization = `Bearer ${token}`

        
        console.log('🔑 Request authorized with token:', options.method || 'GET', endpoint)
        console.log('🔑 Authorization header preview:', `${token.substring(0, 20)}...`)
        console.log('🔑 Full headers:', headers)
        
        // Decode and log JWT payload
        const decoded = decodeJWT(token)
        if (decoded) {
          console.log('🔑 JWT Payload:', {
            iss: decoded.iss,
            aud: decoded.aud,
            exp: decoded.exp,
            iat: decoded.iat,
            sub: decoded.sub,
            token_use: decoded.token_use,
            scope: decoded.scope
          })
          console.log('🔑 Token expires at:', new Date(decoded.exp * 1000).toISOString())
          console.log('🔑 Current time:', new Date().toISOString())
          console.log('🔑 Token is expired:', decoded.exp < Math.floor(Date.now() / 1000))
        }
      } else {
        console.warn('⚠️ No token available for request:', options.method || 'GET', endpoint)
      }
    } catch (error) {
      console.error('❌ Error getting auth token for request:', error)
    }
  } else {
    console.warn('⚠️ No token getter configured for request:', options.method || 'GET', endpoint)
  }
  
  const config = {
    method: options.method || 'GET',
    headers,
    ...options
  }
  
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }
  
      try {
      console.log('🌐 Sending request with config:', {
        method: config.method,
        url: url,
        headers: config.headers
      })
      console.log('🌐 Authorization header value:', config.headers.Authorization)
      
      const response = await fetch(url, config)
      console.log('✅ API Response:', config.method, endpoint, response.status)
      console.log('✅ Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error:', {
          method: config.method,
          url: endpoint,
          status: response.status,
          message: errorData.message || response.statusText
        })
        
        if (response.status === 401) {
          console.error('🔐 Authentication error - token may be invalid or expired')
          console.error('🔐 Response headers:', Object.fromEntries(response.headers.entries()))
          console.error('🔐 Response data:', errorData)
          console.error('🔐 Request headers that were sent:', config.headers)
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('❌ Fetch error:', error)
      throw error
    }
}

export const BusinessAPI = {
  createBusiness: (payload) => apiRequest('/businesses', { method: 'POST', body: payload }),
  listBusinesses: () => apiRequest('/businesses'),
  getBusiness: (id) => apiRequest(`/businesses/${id}`),
  updateBusiness: (id, payload) => apiRequest(`/businesses/${id}`, { method: 'PUT', body: payload }),
  getBusinessStatus: (id) => apiRequest(`/businesses/${id}/status`),
  getSubscription: (id) => apiRequest(`/businesses/${id}/subscription`),
  setSubscription: (id, payload) => apiRequest(`/businesses/${id}/subscription`, { method: 'POST', body: payload }),
  getCredits: (id) => apiRequest(`/businesses/${id}/credits`),
  purchaseCredits: (id, payload) => apiRequest(`/businesses/${id}/credits/purchase`, { method: 'POST', body: payload }),
  
  // New business creation flow endpoints
  configureBusiness: (payload) => apiRequest('/businesses/configure', { method: 'POST', body: payload }),
  setupPayment: (businessId, payload) => apiRequest(`/businesses/${businessId}/payment`, { method: 'POST', body: payload }),
  launchBusiness: (businessId) => apiRequest(`/businesses/${businessId}/launch`, { method: 'POST' }),
  getInvitationInfo: (businessId, email) => apiRequest(`/businesses/${businessId}/invitation?email=${encodeURIComponent(email)}`),
}

export const UserAPI = {
  me: () => {
    console.log('👤 Fetching user data...')
    return apiRequest('/users/me')
      .then((data) => {
        console.log('✅ User data loaded:', data?.email)
        return data
      })
      .catch((error) => {
        console.error('❌ Failed to load user data:', error.message)
        throw error
      })
  },
  updateMe: (payload) => apiRequest('/users/me', { method: 'PUT', body: payload }),
  addPaymentMethod: (payload) => apiRequest('/users/me/payment-methods', { method: 'POST', body: payload }),
  getPaymentMethods: () => apiRequest('/users/me/payment-methods'),
  setDefaultPaymentMethod: (paymentMethodId) =>
    apiRequest('/users/me/payment-methods/default', { method: 'PUT', body: { paymentMethodId } }),
}

export const PaymentAPI = {
  getPlans: () => apiRequest('/payments/plans'),
  getPlansByCategory: () => apiRequest('/payments/plans/categories'),
  createSubscription: (payload) => apiRequest('/payments/create-subscription', { method: 'POST', body: payload }),
  validateSubscription: (payload) => apiRequest('/payments/validate-subscription', { method: 'POST', body: payload }),
  getSubscription: (subscriptionId) => apiRequest(`/payments/subscription/${subscriptionId}`),
  cancelSubscription: (subscriptionId) => apiRequest(`/payments/subscription/${subscriptionId}/cancel`, { method: 'POST' }),
  getCustomerSubscriptions: (customerId) => apiRequest(`/payments/customer/${customerId}/subscriptions`),
  getCustomerActiveSubscriptions: (customerId) => apiRequest(`/payments/customer/${customerId}/subscriptions/active`),
  getInvoices: () => apiRequest('/payments/invoices'),
  createCreditsPaymentIntent: (payload) => apiRequest('/payments/credits/payment-intent', { method: 'POST', body: payload }),
}

// Export the apiRequest function for direct use if needed
export { apiRequest }

