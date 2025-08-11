import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

let tokenGetter = null

export function setAuthTokenGetter(getterFn) {
  tokenGetter = getterFn
}

api.interceptors.request.use(async (config) => {
  if (typeof tokenGetter === 'function') {
    const token = await tokenGetter()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const BusinessAPI = {
  createBusiness: (payload) => api.post('/businesses', payload).then((r) => r.data),
  listBusinesses: () => api.get('/businesses').then((r) => r.data),
  getBusiness: (id) => api.get(`/businesses/${id}`).then((r) => r.data),
  updateBusiness: (id, payload) => api.put(`/businesses/${id}`, payload).then((r) => r.data),
  getBusinessStatus: (id) => api.get(`/businesses/${id}/status`).then((r) => r.data),
  getSubscription: (id) => api.get(`/businesses/${id}/subscription`).then((r) => r.data),
  setSubscription: (id, payload) => api.post(`/businesses/${id}/subscription`, payload).then((r) => r.data),
  getCredits: (id) => api.get(`/businesses/${id}/credits`).then((r) => r.data),
  purchaseCredits: (id, payload) => api.post(`/businesses/${id}/credits/purchase`, payload).then((r) => r.data),
  
  // New business creation flow endpoints
  configureBusiness: (payload) => api.post('/businesses/configure', payload).then((r) => r.data),
  setupPayment: (businessId, payload) => api.post(`/businesses/${businessId}/payment`, payload).then((r) => r.data),
  launchBusiness: (businessId) => api.post(`/businesses/${businessId}/launch`).then((r) => r.data),
  getInvitationInfo: (businessId, email) => api.get(`/businesses/${businessId}/invitation`, { params: { email } }).then((r) => r.data),
}

export const UserAPI = {
  me: () => api.get('/users/me').then((r) => r.data),
  updateMe: (payload) => api.put('/users/me', payload).then((r) => r.data),
  addPaymentMethod: (payload) => api.post('/users/me/payment-methods', payload).then((r) => r.data),
  getPaymentMethods: () => api.get('/users/me/payment-methods').then((r) => r.data),
  setDefaultPaymentMethod: (paymentMethodId) =>
    api.put('/users/me/payment-methods/default', { paymentMethodId }).then((r) => r.data),
}

export const PaymentAPI = {
  getPlans: () => api.get('/payments/plans').then((r) => r.data),
  getPlansByCategory: () => api.get('/payments/plans/categories').then((r) => r.data),
  createSubscription: (payload) => api.post('/payments/create-subscription', payload).then((r) => r.data),
  validateSubscription: (payload) => api.post('/payments/validate-subscription', payload).then((r) => r.data),
  getSubscription: (subscriptionId) => api.get(`/payments/subscription/${subscriptionId}`).then((r) => r.data),
  cancelSubscription: (subscriptionId) => api.post(`/payments/subscription/${subscriptionId}/cancel`).then((r) => r.data),
  getCustomerSubscriptions: (customerId) => api.get(`/payments/customer/${customerId}/subscriptions`).then((r) => r.data),
  getCustomerActiveSubscriptions: (customerId) => api.get(`/payments/customer/${customerId}/subscriptions/active`).then((r) => r.data),
  getInvoices: () => api.get('/payments/invoices').then((r) => r.data),
  createCreditsPaymentIntent: (payload) => api.post('/payments/credits/payment-intent', payload).then((r) => r.data),
}

export default api

