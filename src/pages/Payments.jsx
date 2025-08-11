import { useEffect, useMemo, useState } from 'react'
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { getStripe } from '../lib/stripe'
import { BusinessAPI, UserAPI, PaymentAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import SEO from '../components/SEO'

const stripePromise = getStripe()
const DEFAULT_PRICE_ID = import.meta.env.VITE_DEFAULT_PRICE_ID || 'price_basic_monthly'

function SubscriptionForm({ businessId, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [plans, setPlans] = useState([])
  const [selectedPriceId, setSelectedPriceId] = useState(DEFAULT_PRICE_ID)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.all([
      PaymentAPI.getPlans().catch(() => []),
      UserAPI.me().catch(() => null)
    ]).then(([planData, userData]) => {
      if (!mounted) return
      setPlans(Array.isArray(planData) ? planData : [])
      setUser(userData)
    })
    return () => { mounted = false }
  }, [])

  async function handleCreateSubscription() {
    if (!stripe || !elements || !user) return
    setLoading(true)
    setMessage('')
    try {
      // Step 1: Create subscription via your API
      const subscriptionData = await PaymentAPI.createSubscription({
        priceId: selectedPriceId,
        customerEmail: user.email,
        customerName: user.name || user.email,
        currency: 'ron'
      })

      // Step 2: Confirm payment with Stripe.js if clientSecret is provided
      const clientSecret = subscriptionData.subscription?.latest_invoice?.payment_intent?.client_secret
      if (clientSecret) {
        const card = elements.getElement(CardElement)
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card },
        })
        
        if (error) {
          setMessage(`Plata a eșuat: ${error.message}`)
          return
        }
        
        if (paymentIntent.status === 'succeeded') {
          setMessage('Abonament creat și cardul salvat pentru plăți viitoare!')
          onSuccess?.(subscriptionData)
        }
      } else {
        setMessage('Abonament creat!')
        onSuccess?.(subscriptionData)
      }
    } catch (e) {
      setMessage('Eroare la crearea abonamentului')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="plan-select" className="mb-1 block text-sm font-medium">Plan</label>
        <select 
          id="plan-select"
          className="w-full rounded-md border bg-background px-3 py-2"
          value={selectedPriceId}
          onChange={(e) => setSelectedPriceId(e.target.value)}
        >
          {plans.map((plan) => (
            <option key={plan.priceId} value={plan.priceId}>
              {plan.productName} - {plan.amount / 100} {plan.currency.toUpperCase()}/{plan.interval}
            </option>
          ))}
          {plans.length === 0 && (
            <option value={DEFAULT_PRICE_ID}>Plan de bază</option>
          )}
        </select>
      </div>
      
      <div>
        <label htmlFor="card-element" className="mb-1 block text-sm font-medium">Card</label>
        <div id="card-element" className="rounded-md border p-4">
          <CardElement
            options={{
              style: { base: { fontSize: '16px' } },
            }}
          />
        </div>
      </div>
      
      <Button onClick={handleCreateSubscription} disabled={loading || !stripe || !user}>
        {loading ? 'Se procesează...' : 'Creează abonament'}
      </Button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}

export default function Payments() {
  const [businessId, setBusinessId] = useState('')
  const [customerSubscriptions, setCustomerSubscriptions] = useState([])
  const [stripeInstance, setStripeInstance] = useState(null)
  const [stripeError, setStripeError] = useState('')
  const [stripeLoading, setStripeLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('businessId')
    if (id) setBusinessId(id)
  }, [])

  useEffect(() => {
    let mounted = true
    UserAPI.me()
      .then((userData) => {
        if (!mounted) return
        setUser(userData)
        // Load customer subscriptions if user has stripeCustomerId
        if (userData.stripeCustomerId) {
          return PaymentAPI.getCustomerSubscriptions(userData.stripeCustomerId)
        }
        return []
      })
      .then((subs) => {
        if (!mounted) return
        // Ensure subs is always an array
        setCustomerSubscriptions(Array.isArray(subs) ? subs : [])
      })
      .catch(console.error)
    return () => { mounted = false }
  }, [])

  const stripeOptions = useMemo(() => ({ locale: 'ro' }), [])

  useEffect(() => {
    let mounted = true
    setStripeLoading(true)
    getStripe()
      .then((s) => {
        if (!mounted) return
        if (!s) {
          const hasKey = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
          setStripeError(
            hasKey
              ? 'Stripe.js nu a putut fi încărcat (verifică CSP sau blocatoarele de reclame).'
              : 'Cheia Stripe lipsește. Setează VITE_STRIPE_PUBLISHABLE_KEY.'
          )
        }
        setStripeInstance(s)
      })
      .catch(() => {
        if (!mounted) return
        setStripeError('Stripe.js nu a putut fi încărcat.')
      })
      .finally(() => {
        if (!mounted) return
        setStripeLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  function handleSubscriptionSuccess(subscriptionData) {
    // Refresh subscriptions after successful creation
    if (user?.stripeCustomerId) {
      PaymentAPI.getCustomerSubscriptions(user.stripeCustomerId)
        .then((subs) => setCustomerSubscriptions(Array.isArray(subs) ? subs : []))
        .catch(console.error)
    }
  }

  async function cancelSubscription(subscriptionId) {
    try {
      await PaymentAPI.cancelSubscription(subscriptionId)
      // Refresh list
      if (user?.stripeCustomerId) {
        const subs = await PaymentAPI.getCustomerSubscriptions(user.stripeCustomerId)
        setCustomerSubscriptions(Array.isArray(subs) ? subs : [])
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    }
  }

  return (
    <>
      <SEO 
        title="Plăți și Abonamente - Simplu | Management Business"
        description="Gestionează-ți plățile și abonamentele pentru business-uri. Creează abonamente noi, vezi istoricul plăților și administrează-ți contul de plată în platforma Simplu."
        keywords="plăți business, abonamente, management plăți, facturare, stripe, carduri de credit, plăți online"
        url="https://simplu.ro/plati"
        type="website"
      />
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Plăți și Abonamente</h1>
        </header>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="new-subscription-heading">
            <h2 id="new-subscription-heading" className="font-medium mb-4">Creare abonament nou</h2>
            {stripeLoading ? (
              <p className="text-sm text-muted-foreground">Se încarcă Stripe...</p>
            ) : stripeError ? (
              <div className="space-y-3">
                <p className="text-sm text-destructive">{stripeError}</p>
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Abonamentele pot fi create manual:</strong><br/>
                    Contactează echipa de suport pentru a configura abonamentul tău.
                  </p>
                </div>
              </div>
            ) : (
              <Elements stripe={stripeInstance} options={stripeOptions}>
                <SubscriptionForm 
                  businessId={businessId} 
                  onSuccess={handleSubscriptionSuccess}
                />
              </Elements>
            )}
          </section>

          <section aria-labelledby="my-subscriptions-heading">
            <h2 id="my-subscriptions-heading" className="font-medium mb-4">Abonamentele mele</h2>
            {customerSubscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nu ai abonamente active.</p>
            ) : (
              <div className="space-y-3" role="list">
                {customerSubscriptions.map((sub) => (
                  <article key={sub.id} className="rounded-md border p-4" role="listitem">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{sub.items?.data?.[0]?.price?.nickname || 'Abonament'}</h3>
                        <p className="text-sm text-muted-foreground">
                          Status: {sub.status} | 
                          {sub.items?.data?.[0]?.price && (
                            ` ${sub.items.data[0].price.unit_amount / 100} ${sub.items.data[0].price.currency.toUpperCase()}/${sub.items.data[0].price.recurring?.interval}`
                          )}
                        </p>
                        {sub.current_period_end && (
                          <p className="text-xs text-muted-foreground">
                            Următoarea plată: {new Date(sub.current_period_end * 1000).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {sub.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => cancelSubscription(sub.id)}
                        >
                          Anulează
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

