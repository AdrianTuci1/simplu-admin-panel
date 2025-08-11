import { useState } from 'react'
import { Button } from '../../../components/ui/button'

export default function PaymentStep({ form, createdBusiness, paymentSetup, onSetupPayment }) {
  const [paymentData, setPaymentData] = useState({
    subscriptionType: form.subscriptionType || 'solo',
    billingInterval: 'month',
    currency: form.settings?.currency?.toLowerCase() || 'ron'
  })

  const intervals = [
    { key: 'month', name: 'Lunar' },
    { key: 'year', name: 'Anual (20% reducere)' }
  ]

  if (!createdBusiness) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Trebuie să configurați mai întâi business-ul.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4 bg-muted/50">
        <h4 className="font-medium mb-2">Business Configurat</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Nume:</strong> {createdBusiness.companyName}</p>
          <p><strong>ID:</strong> {createdBusiness.businessId}</p>
          <p><strong>Status:</strong> <span className="text-orange-600">{createdBusiness.status}</span></p>
          <p><strong>Payment Status:</strong> <span className="text-red-600">{createdBusiness.paymentStatus}</span></p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Configurare Subscription Stripe</h4>
        
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Tip Subscription</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2"
              value={paymentData.subscriptionType}
              onChange={(e) => setPaymentData(prev => ({ ...prev, subscriptionType: e.target.value }))}
            >
              <option value="solo">Solo</option>
              <option value="team">Team</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Interval Facturare</label>
            <div className="grid gap-2">
              {intervals.map((interval) => (
                <label key={interval.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="billingInterval"
                    value={interval.key}
                    checked={paymentData.billingInterval === interval.key}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, billingInterval: e.target.value }))}
                    className="rounded"
                  />
                  <span>{interval.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Monedă</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2"
              value={paymentData.currency}
              onChange={(e) => setPaymentData(prev => ({ ...prev, currency: e.target.value }))}
            >
              <option value="ron">RON (Lei Românești)</option>
              <option value="eur">EUR (Euro)</option>
              <option value="usd">USD (Dolari US)</option>
            </select>
          </div>
        </div>
      </div>

      {paymentSetup && (
        <div className="rounded-md border p-4 bg-green-50">
          <h4 className="font-medium text-green-800 mb-2">Plata Configurată</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Subscription ID:</strong> {paymentSetup.subscriptionId}</p>
            <p><strong>Status:</strong> {paymentSetup.status}</p>
            <p><strong>Client Secret:</strong> {paymentSetup.clientSecret}</p>
          </div>
          <p className="text-xs text-green-600 mt-2">
            Client Secret-ul trebuie folosit în frontend pentru confirmarea plății cu Stripe.
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-800 mb-2">Informații Importante</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Doar owner-ul business-ului poate configura plata</li>
          <li>• Subscription-ul se creează cu credențialele owner-ului</li>
          <li>• Planul se setează automat în funcție de tipul de business</li>
          <li>• După configurarea plății, trebuie să confirmați plata în frontend</li>
          <li>• Doar după confirmarea plății puteți lansa business-ul</li>
        </ul>
      </div>
    </div>
  )
} 