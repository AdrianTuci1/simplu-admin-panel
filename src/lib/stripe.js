import { loadStripe } from '@stripe/stripe-js'

let cachedStripePromise = null

export function getStripe() {
  if (!cachedStripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey || !publishableKey.startsWith('pk_')) {
      console.warn('Missing or invalid VITE_STRIPE_PUBLISHABLE_KEY')
      cachedStripePromise = Promise.resolve(null)
    } else {
      cachedStripePromise = loadStripe(publishableKey).catch((error) => {
        console.error('Stripe.js failed to load', error)
        return null
      })
    }
  }
  return cachedStripePromise
}

