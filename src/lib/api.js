const API_BASE_URL = import.meta.env.VITE_API_URL

let tokenGetter = null



export function setAuthTokenGetter(getterFn) {
  tokenGetter = getterFn
}

// Helper function to make API requests with fetch
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (typeof tokenGetter === 'function') {
    try {
      const token = await tokenGetter()
      
      if (token) {
        // Try different authorization header formats
        headers.Authorization = `Bearer ${token}`

        

      }
    } catch (error) {
      console.error('❌ Error getting auth token for request:', error)
    }
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
        const response = await fetch(url, config)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
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
  
  // New payment methods for business creation flow
  payWithSavedCard: (businessId, payload) => apiRequest(`/payments/business/${businessId}/pay-with-saved-card`, { method: 'POST', body: payload }),
  getBusinessSubscriptionStatus: (businessId) => apiRequest(`/payments/business/${businessId}/subscription/status`),
}

// Export the apiRequest function for direct use if needed
export { apiRequest }

