import { BusinessAPI, UserAPI } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { useEffect, useState } from 'react'
import CreateBusinessWizard from './CreateBusinessWizard'
import SEO from '../../components/SEO'
import Cookies from 'js-cookie'

export default function Services() {
  const [created, setCreated] = useState(null)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [editingBusiness, setEditingBusiness] = useState(null)

  useEffect(() => {
    let mounted = true
    // Load current user first
    console.log('👤 Services: Loading user data...')
    
    UserAPI.me()
      .then((user) => {
        if (mounted) {
          console.log('✅ Services: User loaded successfully:', user?.email)
          setCurrentUser(user)
        }
      })
      .catch((error) => {
        console.error('❌ Services: Failed to load user:', error)
      })
      .finally(() => {
        // Then load businesses
        BusinessAPI.listBusinesses()
          .then((items) => mounted && setList(Array.isArray(items) ? items : []))
          .catch(() => setError('Nu s-a putut încărca lista'))
          .finally(() => mounted && setLoading(false))
      })
    return () => { mounted = false }
  }, [created])

  // Function to check if current user can configure payment for a business
  function canConfigurePayment(business) {
    if (!currentUser) return false
    
    // If configureForEmail is empty/null, current user can configure payment
    if (!business.configureForEmail || business.configureForEmail === '') {
      return true
    }
    
    // If configureForEmail is set, only that specific user can configure payment
    return business.configureForEmail === currentUser.email
  }

  // Function to check if current user can launch business (same logic as payment)
  function canLaunchBusiness(business) {
    return canConfigurePayment(business)
  }

  function openEditWizard(business) {
    setEditingBusiness(business)
    setWizardOpen(true)
  }

  function closeWizard() {
    setWizardOpen(false)
    setEditingBusiness(null)
  }

  function handleBusinessCreated(business) {
    setCreated(business)
    closeWizard()
  }

  function handleBusinessUpdated(business) {
    setList((prev) => prev.map((b) => (b.businessId === business.businessId ? business : b)))
    closeWizard()
  }

  async function updateBusiness(businessId, payload) {
    try {
      const updated = await BusinessAPI.updateBusiness(businessId, payload)
      setList((prev) => prev.map((b) => (b.businessId === businessId ? updated : b)))
    } catch (e) {
      setError('Actualizarea business-ului a eșuat')
    }
  }

  async function setupPayment(businessId) {
    try {
      const payment = await BusinessAPI.setupPayment(businessId, {
        subscriptionType: 'solo',
        planKey: 'basic',
        billingInterval: 'month',
        currency: 'ron'
      })
      alert(`Plata configurată! Client Secret: ${payment.clientSecret}`)
    } catch (e) {
      setError('Configurarea plății a eșuat: ' + e.message)
    }
  }

  async function launchBusiness(businessId) {
    try {
      const launched = await BusinessAPI.launchBusiness(businessId)
      setList((prev) => prev.map((b) => (b.businessId === businessId ? launched : b)))
      alert('Business lansat cu succes!')
    } catch (e) {
      setError('Lansarea business-ului a eșuat: ' + e.message)
    }
  }

  function getStatusBadge(status, paymentStatus) {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      deleted: 'bg-red-100 text-red-800'
    }
    
    const paymentColors = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      trialing: 'bg-blue-100 text-blue-800'
    }

    return (
      <div className="flex gap-1">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {status}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
          {paymentStatus}
        </span>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="Servicii - Simplu | Management Business"
        description="Gestionează-ți business-urile și configurează plățile. Creează, editează și lansează business-uri cu ușurință în platforma Simplu."
        keywords="servicii business, management business, configurare plăți, creare business, editare business, lansare business"
        url="https://simplu.ro/servicii"
        type="website"
      />
      <div className="space-y-6">
        <header>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Servicii</h1>
              <p className="text-sm text-muted-foreground">Gestionați business-urile și configurați plățile</p>
            </div>
            <Button onClick={() => setWizardOpen(true)}>Creează business</Button>
          </div>
        </header>

        {wizardOpen && (
          <CreateBusinessWizard 
            onClose={closeWizard}
            onSuccess={handleBusinessCreated}
            businessToEdit={editingBusiness}
            onUpdateSuccess={handleBusinessUpdated}
          />
        )}

        {created && (
          <section className="rounded-md border p-4 bg-green-50" aria-label="Business nou creat">
            <h2 className="font-medium text-green-800 mb-2">✅ Business Configurat</h2>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Nume:</strong> {created.companyName}</p>
              <p><strong>ID:</strong> {created.businessId}</p>
              <p><strong>Status:</strong> {created.status} • {created.paymentStatus}</p>
              <p><strong>Owner:</strong> {created.ownerEmail}</p>
            </div>
          </section>
        )}

        {import.meta.env.DEV && currentUser && (
          <section className="rounded-md border p-4 bg-blue-50" aria-label="Debug info">
            <h2 className="font-medium text-blue-800 mb-2">🔧 Debug Info</h2>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Utilizator curent:</strong> {currentUser.email}</p>
              <p><strong>Business-uri:</strong> {list.length}</p>
            </div>
          </section>
        )}

        <section aria-labelledby="businesses-list-heading">
          <h2 id="businesses-list-heading" className="text-lg font-medium mb-4">Lista Business-uri</h2>
          {loading ? (
            <p>Se încarcă...</p>
          ) : list.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nu există business-uri configurate.</p>
              <p className="text-sm text-muted-foreground">Creați primul business pentru a începe.</p>
            </div>
          ) : (
            <div className="space-y-4" role="list">
              {list.map((b) => (
                <article key={b.businessId} className="rounded-md border p-4" role="listitem">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{b.companyName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {b.businessType} • {b.subscriptionType} • 
                        {b.configureForEmail && b.configureForEmail !== '' && (
                          <span className="ml-2 text-xs text-blue-600">
                            (configurat pentru {b.configureForEmail})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditWizard(b)}
                      >
                        Edit
                      </Button>
                      {getStatusBadge(b.status, b.paymentStatus)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'suspended' && b.paymentStatus === 'unpaid' && canConfigurePayment(b) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setupPayment(b.businessId)}
                      >
                        Configurează Plată
                      </Button>
                    )}
                    {b.status === 'suspended' && b.paymentStatus === 'unpaid' && !canConfigurePayment(b) && (
                      <span className="text-sm text-muted-foreground">
                        {b.configureForEmail ? `Plata trebuie configurată de ${b.configureForEmail}` : 'Plata trebuie configurată de owner'}
                      </span>
                    )}
                    {b.status === 'suspended' && b.paymentStatus !== 'unpaid' && canLaunchBusiness(b) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => launchBusiness(b.businessId)}
                      >
                        Lansează Business
                      </Button>
                    )}
                    {b.status === 'suspended' && b.paymentStatus !== 'unpaid' && !canLaunchBusiness(b) && (
                      <span className="text-sm text-muted-foreground">
                        {b.configureForEmail ? `Business-ul trebuie lansat de ${b.configureForEmail}` : 'Business-ul trebuie lansat de owner'}
                      </span>
                    )}
                    {b.status === 'active' && (
                      <span className="text-sm text-green-600">✅ Business activ</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
} 