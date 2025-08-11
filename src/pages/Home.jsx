import { useEffect, useState } from 'react'
import { BusinessAPI, PaymentAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import SEO from '../components/SEO'

export default function Home() {
  const [businesses, setBusinesses] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [list, inv] = await Promise.all([
          BusinessAPI.listBusinesses(),
          PaymentAPI.getInvoices().catch(() => [])
        ])
        if (mounted) {
          setBusinesses(Array.isArray(list) ? list : [])
          setInvoices(Array.isArray(inv) ? inv : [])
        }
      } catch (e) {
        setError('Nu s-au putut încărca business-urile')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <>
      <SEO 
        title="Dashboard - Simplu | Management Business"
        description="Dashboard-ul tău personal pentru managementul business-urilor. Vezi toate business-urile, facturile neachitate și gestionează-ți serviciile într-un singur loc."
        keywords="dashboard business, management business, facturi business, servicii business, administrare companie"
        url="https://simplu.ro/"
        type="website"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        
        <section aria-labelledby="businesses-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="businesses-heading" className="text-xl font-semibold">Business-urile mele</h2>
          </div>
          {loading ? (
            <p>Se încarcă...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : businesses.length === 0 ? (
            <p className="text-muted-foreground">Nu ai încă niciun business. Creează primul tău business.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
              {businesses.map((b) => (
                <li key={b.businessId} className="rounded-lg border p-4" role="listitem">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{b.companyName || b.businessName}</p>
                      <p className="text-sm text-muted-foreground">{b.status}</p>
                    </div>
                    <Button variant="outline" onClick={() => (window.location.href = `/plati?businessId=${b.businessId}`)}>
                      Abonament
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="invoices-heading">
          <h3 id="invoices-heading" className="text-lg font-medium mb-3">Facturi neachitate</h3>
          {invoices.filter((i) => i.status !== 'paid').length === 0 ? (
            <p className="text-sm text-muted-foreground">Nu ai facturi neachitate.</p>
          ) : (
            <ul className="divide-y rounded-md border" role="list">
              {invoices
                .filter((i) => i.status !== 'paid')
                .map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-4 p-3" role="listitem">
                    <div>
                      <p className="text-sm font-medium">{inv.number} • {inv.total / 100} {inv.currency?.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">Status: {inv.status}</p>
                    </div>
                    <div className="flex gap-2">
                      {inv.hostedInvoiceUrl && (
                        <Button asChild variant="outline" size="sm">
                          <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer">Vezi</a>
                        </Button>
                      )}
                      {inv.invoicePdf && (
                        <Button asChild size="sm">
                          <a href={inv.invoicePdf} target="_blank" rel="noreferrer">PDF</a>
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

