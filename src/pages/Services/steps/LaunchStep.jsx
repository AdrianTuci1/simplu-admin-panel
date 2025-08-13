import { useState } from 'react'
import { Button } from '../../../components/ui/button'

export default function LaunchStep({ form, createdBusiness, onLaunchBusiness }) {
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  if (!createdBusiness) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Trebuie să configurați mai întâi business-ul.</p>
      </div>
    )
  }

  // Check if payment is required
  const paymentRequired = createdBusiness.status === 'suspended' && createdBusiness.paymentStatus === 'unpaid';

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

      {paymentRequired ? (
        <div className="rounded-md border p-4 bg-yellow-50">
          <h4 className="font-medium text-yellow-800 mb-2">Plată Necesară</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>Business-ul necesită plată înainte de lansare.</p>
            <p>Status: {createdBusiness.status} • Payment Status: {createdBusiness.paymentStatus}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border p-4 bg-green-50">
          <h4 className="font-medium text-green-800 mb-2">Plata Completă</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>Business-ul este gata pentru lansare.</p>
            <p>Status: {createdBusiness.status} • Payment Status: {createdBusiness.paymentStatus}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-medium">Confirmare Lansare</h4>
        
        {paymentRequired ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h5 className="font-medium text-yellow-800 mb-2">⚠️ Plată Necesară</h5>
            <p className="text-sm text-yellow-700 mb-3">
              Business-ul necesită plată înainte de lansare. Configurați plata în pasul anterior.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h5 className="font-medium text-green-800 mb-2">✅ Gata pentru Lansare</h5>
            <p className="text-sm text-green-700 mb-3">
              Business-ul este configurat și plata este completă. Puteți lansa business-ul.
            </p>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-green-700">
                  Confirm că vreau să lansez business-ul
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h5 className="font-medium text-blue-800 mb-2">Ce se întâmplă la lansare</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Se verifică că subscription-ul este activ sau în trial</li>
            <li>• Business-ul devine activ (status: "active")</li>
            <li>• Se creează shard-uri pentru fiecare locație activă</li>
            <li>• Se lansează infrastructura CloudFormation pentru React app</li>
            <li>• Se trimit mesaje SQS pentru configurarea sistemului</li>
          </ul>
        </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h5 className="font-medium text-gray-800 mb-2">Informații Business</h5>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Tip Business:</strong> {form.businessType}</p>
                <p><strong>Locații:</strong> {form.locations.filter(l => l.active).length} active</p>
                <p><strong>Domeniu:</strong> {form.domainLabel}.{form.customTld}</p>
                <p><strong>Monedă:</strong> {form.settings?.currency}</p>
              </div>
            </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h5 className="font-medium text-red-800 mb-2">⚠️ Atenție</h5>
        <ul className="text-sm text-red-700 space-y-1">
          <li>• Lansarea business-ului este ireversibilă</li>
          <li>• Infrastructura se va crea automat și va genera costuri</li>
          <li>• Asigurați-vă că toate datele sunt corecte înainte de lansare</li>
          <li>• Doar owner-ul business-ului poate lansa business-ul</li>
        </ul>
      </div>
    </div>
  )
} 