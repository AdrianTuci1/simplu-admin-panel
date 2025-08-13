import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import PaymentManager from '../../../components/payment/PaymentManager'
import { PaymentAPI } from '../../../lib/api'

export default function PaymentStep({ form, createdBusiness, onPaymentComplete }) {
  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  useEffect(() => {
    // Load available plans from API
    const loadPlans = async () => {
      try {
        const availablePlans = await PaymentAPI.getPlans()
        setPlans(availablePlans)
      } catch (error) {
        console.error('Failed to load plans:', error)
      } finally {
        setLoadingPlans(false)
      }
    }

    loadPlans()
  }, [])

  if (!createdBusiness) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Trebuie să configurați mai întâi business-ul.</p>
      </div>
    )
  }

  // Check if business is configured for current user (not for someone else)
  const isConfiguredForCurrentUser = !createdBusiness.configureForEmail || createdBusiness.configureForEmail === '';

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4 bg-muted/50">
        <h4 className="font-medium mb-2">Business Configurat</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Nume:</strong> {createdBusiness.companyName}</p>
          <p><strong>ID:</strong> {createdBusiness.businessId}</p>
          <p><strong>Status:</strong> <span className="text-orange-600">{createdBusiness.status}</span></p>
          <p><strong>Payment Status:</strong> <span className="text-red-600">{createdBusiness.paymentStatus}</span></p>
          {!isConfiguredForCurrentUser && (
            <p><strong>Configurat pentru:</strong> <span className="text-blue-600">{createdBusiness.configureForEmail}</span></p>
          )}
        </div>
      </div>

      {isConfiguredForCurrentUser ? (
        // Direct payment flow for current user
        <div className="space-y-4">
          <h4 className="font-medium text-lg">Plată Directă</h4>
          <p className="text-sm text-muted-foreground">
            Configurați plata pentru business-ul vostru. Puteți folosi un card salvat sau adăuga unul nou.
          </p>
          
          {loadingPlans ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Se încarcă planurile disponibile...</p>
            </div>
          ) : (
            <PaymentManager
              businessId={createdBusiness.businessId}
              businessType={createdBusiness.businessType}
              plans={plans}
              onPaymentComplete={(result) => {
                if (onPaymentComplete) {
                  onPaymentComplete(result);
                }
              }}
              onPaymentError={(error) => {
                console.error('Payment error:', error);
              }}
            />
          )}
        </div>
      ) : (
        // Business configured for someone else
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Configurare pentru Altcineva</h4>
            <p className="text-sm text-yellow-700">
              Acest business este configurat pentru {createdBusiness.configureForEmail}. 
              Această persoană va trebui să configureze plata folosind noul sistem de plăți.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-blue-800 mb-2">Informații Importante</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Doar {createdBusiness.configureForEmail} poate configura plata</li>
              <li>• Plata se face folosind cardurile salvate sau carduri noi</li>
              <li>• Planurile sunt încărcate dinamic din Stripe</li>
              <li>• După plata cu succes, business-ul se activează automat</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 