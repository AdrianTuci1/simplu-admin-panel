import { useEffect, useState } from 'react'
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '../../lib/stripe'
import { Button } from '../../components/ui/button'
import { UserAPI } from '../../lib/api'

function AddCardForm({ user, onAdded }) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardholderName, setCardholderName] = useState('')
  const [description, setDescription] = useState('')
  const [savingCard, setSavingCard] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSaveCard() {
    if (!stripe || !elements) return
    setSavingCard(true)
    setMessage('')
    try {
      const cardNumber = elements.getElement(CardNumberElement)
      const pmResult = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumber,
        billing_details: {
          name: cardholderName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || undefined,
          address: user?.billingAddress ? {
            line1: user.billingAddress.street || undefined,
            city: user.billingAddress.city || undefined,
            state: user.billingAddress.district || undefined,
            postal_code: user.billingAddress.postalCode || undefined,
            country: user.billingAddress.country || undefined,
          } : undefined,
        },
      })
      if (pmResult.error) {
        setMessage(pmResult.error.message || 'Eroare la crearea metodei de plată')
        return
      }
      await UserAPI.addPaymentMethod({ paymentMethodId: pmResult.paymentMethod.id, description })
      setMessage('Card adăugat')
      onAdded?.()
    } catch {
      setMessage('Eroare la salvarea cardului')
    } finally {
      setSavingCard(false)
    }
  }

  return (
    <div className="rounded-md border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Descriere</label>
          <input className="w-full rounded-md border bg-background px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex: Card personal" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Nume pe card</label>
          <input className="w-full rounded-md border bg-background px-3 py-2" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} placeholder="Ion Pop" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Număr card</label>
          <div className="rounded-md border bg-background px-3 py-2"><CardNumberElement options={{ showIcon: true }} /></div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Expirare</label>
          <div className="rounded-md border bg-background px-3 py-2"><CardExpiryElement /></div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">CVV</label>
          <div className="rounded-md border bg-background px-3 py-2"><CardCvcElement /></div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Folosește adresa de facturare setată anterior
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline">Anulează</Button>
        <Button onClick={handleSaveCard} disabled={savingCard}>{savingCard ? 'Se salvează...' : 'Salvează cardul'}</Button>
      </div>
      {message && <p className="mt-2 text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}

export default function PaymentMethods({ user, onDefaultChange }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [stripePromise, setStripePromise] = useState(null)

  // Load Stripe only when needed and user is authenticated
  useEffect(() => {
    if (showAdd && user) {
      console.log('💳 Loading Stripe for PaymentMethods...')
      getStripe().then(setStripePromise)
    }
  }, [showAdd, user])

  async function load() {
    setLoading(true)
    const items = await UserAPI.getPaymentMethods().catch(() => [])
    setList(Array.isArray(items) ? items : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function setDefault(paymentMethodId) {
    await UserAPI.setDefaultPaymentMethod(paymentMethodId)
    onDefaultChange?.(paymentMethodId)
    load()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Metode de plată</h2>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Card</th>
              <th className="px-3 py-2 text-left font-medium">Nume</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Tip</th>
              <th className="px-3 py-2 text-right font-medium">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-3 text-muted-foreground" colSpan={5}>Se încarcă...</td></tr>
            ) : list.length === 0 ? (
              <tr><td className="px-3 py-3 text-muted-foreground" colSpan={5}>Nu ai carduri înregistrate</td></tr>
            ) : (
              list.map((pm) => {
                const brand = pm.card?.brand || 'card'
                const last4 = pm.card?.last4 || '????'
                const isDefault = user?.defaultPaymentMethodId && (pm.id === user.defaultPaymentMethodId)
                return (
                  <tr key={pm.id} className="border-t">
                    <td className="px-3 py-2">{brand}-{last4}</td>
                    <td className="px-3 py-2">{pm.billing_details?.name || '-'}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-md px-2 py-0.5 text-xs ${pm.livemode === false ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {pm.livemode === false ? 'test' : 'activ'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{isDefault ? 'principal' : 'secundar'}</td>
                    <td className="px-3 py-2 text-right">
                      {!isDefault && (
                        <Button size="sm" variant="outline" onClick={() => setDefault(pm.id)}>Setează principal</Button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!showAdd ? (
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Adăugați un nou card</p>
            <p className="text-xs text-muted-foreground">Completați datele cardului pentru a-l salva</p>
          </div>
          <Button onClick={() => setShowAdd(true)} size="sm">Adaugă card</Button>
        </div>
      ) : (
        <Elements stripe={stripePromise} options={{ locale: 'ro' }}>
          <AddCardForm user={user} onAdded={() => { setShowAdd(false); load() }} />
        </Elements>
      )}
    </div>
  )
}

