import { useEffect, useState } from 'react'
import { UserAPI } from '../../lib/api'
import Sidebar from './Sidebar'
import UserDetails from './UserDetails'
import PaymentMethods from './PaymentMethods'
import SEO from '../../components/SEO'
import Cookies from 'js-cookie'

export default function ProfilePage() {
  const [section, setSection] = useState('details') // 'details' | 'payments'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const me = await UserAPI.me()
        if (mounted) setUser(me)
      } catch (error) {
        console.error('❌ Failed to load user data:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  async function save() {
    setMessage('')
    try {
      const payload = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        entityType: user?.entityType || '',
        registrationNumber: user?.registrationNumber || '',
        taxCode: user?.taxCode || '',
        billingAddress: {
          company: user?.billingAddress?.company || '',
          street: user?.billingAddress?.street || '',
          city: user?.billingAddress?.city || '',
          district: user?.billingAddress?.district || '',
          postalCode: user?.billingAddress?.postalCode || '',
          country: user?.billingAddress?.country || 'RO',
        },
      }
      
      const updated = await UserAPI.updateMe(payload)
      setUser(updated)
      setMessage('Salvat')
    } catch (error) {
      console.error('Error saving user:', error)
      setMessage('Eroare la salvare')
    }
  }

  if (loading) return <p>Se încarcă...</p>
  if (!user) return <p>Eroare la încărcare profil</p>

  return (
    <>
      <SEO 
        title="Profil - Simplu | Management Business"
        description="Gestionează-ți profilul personal și informațiile de facturare. Actualizează datele personale, metodele de plată și preferințele în platforma Simplu."
        keywords="profil utilizator, date personale, facturare, metode de plată, preferințe utilizator, management cont"
        url="https://simplu.ro/profil"
        type="website"
      />
      <div className="flex gap-6">
        <Sidebar section={section} onSelect={setSection} />
        <main className="flex-1 space-y-6">
          <header>
            <h1 className="text-2xl font-bold">Profil</h1>
          </header>
          {section === 'details' && (
            <UserDetails user={user} setUser={setUser} onSave={save} message={message} />
          )}
          {section === 'payments' && (
            <PaymentMethods user={user} onDefaultChange={(id) => setUser((u) => ({ ...u, defaultPaymentMethodId: id }))} />
          )}
        </main>
      </div>
    </>
  )
}

