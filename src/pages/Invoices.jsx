import { useEffect, useState } from 'react'
import { PaymentAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import SEO from '../components/SEO'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const list = await PaymentAPI.getInvoices()
        if (mounted) setInvoices(Array.isArray(list) ? list : [])
      } catch (e) {
        if (mounted) setError('Nu s-au putut încărca facturile')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <p>Se încarcă...</p>
  if (error) return <p className="text-destructive">{error}</p>

  const unpaid = invoices.filter((inv) => inv.status !== 'paid')

  return (
    <>
      <SEO 
        title="Facturi - Simplu | Management Business"
        description="Gestionează-ți facturile și documentele de plată. Vezi toate facturile, descarcă PDF-uri și accesează facturile online în platforma Simplu."
        keywords="facturi business, management facturi, descărcare facturi, facturi PDF, facturare online, documente de plată"
        url="https://simplu.ro/facturi"
        type="website"
      />
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Facturi</h1>
        </header>
        
        {invoices.length === 0 ? (
          <p className="text-muted-foreground">Nu există facturi.</p>
        ) : (
          <div className="space-y-6">
            {unpaid.length > 0 && (
              <section aria-labelledby="unpaid-invoices-heading">
                <h2 id="unpaid-invoices-heading" className="mb-2 font-medium">Neachitate</h2>
                <ul className="divide-y rounded-md border" role="list">
                  {unpaid.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between gap-4 p-4" role="listitem">
                      <div>
                        <h3 className="font-medium">{inv.number} • {inv.total / 100} {inv.currency?.toUpperCase()}</h3>
                        <p className="text-sm text-muted-foreground">Status: {inv.status}</p>
                      </div>
                      <div className="flex gap-2">
                        {inv.hostedInvoiceUrl && (
                          <Button asChild variant="outline">
                            <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer">Vezi online</a>
                          </Button>
                        )}
                        {inv.invoicePdf && (
                          <Button asChild>
                            <a href={inv.invoicePdf} target="_blank" rel="noreferrer">Descarcă PDF</a>
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="all-invoices-heading">
              <h2 id="all-invoices-heading" className="mb-2 font-medium">Toate</h2>
              <ul className="divide-y rounded-md border" role="list">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-4 p-4" role="listitem">
                    <div>
                      <h3 className="font-medium">{inv.number} • {inv.total / 100} {inv.currency?.toUpperCase()}</h3>
                      <p className="text-sm text-muted-foreground">Status: {inv.status}</p>
                    </div>
                    <div className="flex gap-2">
                      {inv.hostedInvoiceUrl && (
                        <Button asChild variant="outline">
                          <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer">Vezi online</a>
                        </Button>
                      )}
                      {inv.invoicePdf && (
                        <Button asChild>
                          <a href={inv.invoicePdf} target="_blank" rel="noreferrer">Descarcă PDF</a>
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </>
  )
}

