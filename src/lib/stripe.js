import { loadStripe } from '@stripe/stripe-js'

let cachedStripePromise = null

export function getStripe() {
  // Only load Stripe if we're authenticated and not in the middle of OIDC flow
  const url = new URL(window.location.href)
  const hasOidcParams = url.searchParams.has('code') || url.searchParams.has('state')
  
  if (hasOidcParams) {
    console.log('🔄 Skipping Stripe load during OIDC authentication flow')
    return Promise.resolve(null)
  }
  
  if (!cachedStripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey || !publishableKey.startsWith('pk_')) {
      console.warn('Missing or invalid VITE_STRIPE_PUBLISHABLE_KEY')
      cachedStripePromise = Promise.resolve(null)
    } else {
      console.log('💳 Loading Stripe...')
      cachedStripePromise = loadStripe(publishableKey).catch((error) => {
        console.error('Stripe.js failed to load', error)
        return null
      })
    }
  }
  return cachedStripePromise
}

// Function to clear Stripe cache (useful for debugging)
export function clearStripeCache() {
  console.log('🧹 Clearing Stripe cache')
  cachedStripePromise = null
}

