export default function ReviewStep({ form, createdBusiness, isEditMode }) {
  const reviewData = {
    companyName: form.companyName,
    registrationNumber: form.registrationNumber,
    taxCode: form.taxCode,
    businessType: form.businessType,
    subscriptionType: form.subscriptionType,
    locations: form.locations,
    domainType: form.domainType,
    domainLabel: form.domainLabel,
    customTld: form.customTld,
    clientPageType: form.clientPageType,
    configureForEmail: form.configureForEmail,
    billingEmail: form.billingEmail,
    settings: form.settings
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-4 font-medium">{isEditMode ? 'Revizuire Actualizare Business' : 'Revizuire Configurare Business'}</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-md border p-3">
              <h5 className="font-medium text-sm mb-2">Informații Companie</h5>
              <div className="text-sm space-y-1">
                <p><strong>Nume:</strong> {form.companyName}</p>
                <p><strong>Nr. Reg. Com.:</strong> {form.registrationNumber}</p>
                <p><strong>CUI:</strong> {form.taxCode}</p>
                <p><strong>Tip Business:</strong> {form.businessType}</p>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <h5 className="font-medium text-sm mb-2">Domeniu & Setări</h5>
              <div className="text-sm space-y-1">
                <p><strong>Domeniu:</strong> {form.domainLabel}.{form.customTld}</p>
                <p><strong>Tip Pagină:</strong> {form.clientPageType}</p>
                <p><strong>Monedă:</strong> {form.settings?.currency}</p>
                <p><strong>Limbă:</strong> {form.settings?.language}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border p-3">
              <h5 className="font-medium text-sm mb-2">Locații ({form.locations.filter(l => l.active).length} active)</h5>
              <div className="text-sm space-y-2">
                {form.locations.map((location, index) => (
                  <div key={location.id} className="border-l-2 border-gray-200 pl-2">
                    <p><strong>{location.name}</strong></p>
                    <p className="text-muted-foreground">{location.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.active ? '✅ Activă' : '❌ Inactivă'} • {location.timezone}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border p-3">
              <h5 className="font-medium text-sm mb-2">Contacte & Configurare</h5>
              <div className="text-sm space-y-1">
                <p><strong>Configurare pentru:</strong> {form.configureForEmail || 'Utilizatorul curent'}</p>
                <p><strong>Subscription Type:</strong> {form.subscriptionType}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {createdBusiness && !isEditMode && (
        <div className="rounded-md border p-4 bg-green-50">
          <h5 className="font-medium text-green-800 mb-2">✅ Business Configurat</h5>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>ID:</strong> {createdBusiness.businessId}</p>
            <p><strong>Status:</strong> <span className="text-orange-600">{createdBusiness.status}</span></p>
            <p><strong>Payment Status:</strong> <span className="text-red-600">{createdBusiness.paymentStatus}</span></p>
            <p><strong>Owner:</strong> {createdBusiness.ownerEmail}</p>
          </div>
        </div>
      )}

      {createdBusiness && isEditMode && (
        <div className="rounded-md border p-4 bg-blue-50">
          <h5 className="font-medium text-blue-800 mb-2">📝 Business de Actualizat</h5>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>ID:</strong> {createdBusiness.businessId}</p>
            <p><strong>Status:</strong> <span className="text-orange-600">{createdBusiness.status}</span></p>
            <p><strong>Payment Status:</strong> <span className="text-red-600">{createdBusiness.paymentStatus}</span></p>
            <p><strong>Owner:</strong> {createdBusiness.ownerEmail}</p>
          </div>
        </div>
      )}

      {!isEditMode && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h5 className="font-medium text-blue-800 mb-2">Următorii Pași</h5>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Configurați subscription-ul Stripe pentru plată</li>
              <li>Confirmați plata în frontend folosind Client Secret-ul</li>
              <li>Lansați business-ul pentru a activa infrastructura</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h5 className="font-medium text-yellow-800 mb-2">⚠️ Important</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Business-ul va fi creat cu status "suspended" și payment status "unpaid"</li>
              <li>• Doar owner-ul poate configura plata și lansa business-ul</li>
              <li>• Dacă configurați pentru altcineva, acela va primi un email cu invitație</li>
              <li>• Infrastructura se va crea doar după confirmarea plății</li>
            </ul>
          </div>
        </>
      )}

      {isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h5 className="font-medium text-blue-800 mb-2">Actualizare Business</h5>
          <p className="text-sm text-blue-700">
            Modificările vor fi aplicate imediat după confirmare. Business-ul va păstra statusul și configurația de plată actuală.
          </p>
        </div>
      )}
    </div>
  )
} 