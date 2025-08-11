import { Button } from '../../components/ui/button'

export default function UserDetails({ user, setUser, onSave, message }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Date utilizator</h2>
      <div className="grid max-w-3xl gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Email (read-only)</label>
            <input className="w-full rounded-md border bg-muted px-3 py-2" value={user.email || ''} readOnly />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telefon</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2"
              value={user.phone || ''}
              onChange={(e) => setUser((u) => ({ ...u, phone: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Prenume</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2"
              value={user.firstName || ''}
              onChange={(e) => setUser((u) => ({ ...u, firstName: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nume</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2"
              value={user.lastName || ''}
              onChange={(e) => setUser((u) => ({ ...u, lastName: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Adresă facturare</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Companie</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                value={user.billingAddress?.company || ''}
                onChange={(e) => setUser((u) => ({ ...u, billingAddress: { ...u.billingAddress, company: e.target.value } }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Stradă</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                value={user.billingAddress?.street || ''}
                onChange={(e) => setUser((u) => ({ ...u, billingAddress: { ...u.billingAddress, street: e.target.value } }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Oraș</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                value={user.billingAddress?.city || ''}
                onChange={(e) => setUser((u) => ({ ...u, billingAddress: { ...u.billingAddress, city: e.target.value } }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Județ</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                value={user.billingAddress?.district || ''}
                onChange={(e) => setUser((u) => ({ ...u, billingAddress: { ...u.billingAddress, district: e.target.value } }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cod poștal</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                value={user.billingAddress?.postalCode || ''}
                onChange={(e) => setUser((u) => ({ ...u, billingAddress: { ...u.billingAddress, postalCode: e.target.value } }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Țară</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                value={user.billingAddress?.country || 'RO'}
                onChange={(e) => setUser((u) => ({ ...u, billingAddress: { ...u.billingAddress, country: e.target.value } }))}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Date entitate</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Tip entitate</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                value={user.entityType || ''}
                onChange={(e) => setUser((u) => ({ ...u, entityType: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cod fiscal (RO...)</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                value={user.taxCode || ''}
                onChange={(e) => setUser((u) => ({ ...u, taxCode: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Număr înregistrare (J...)</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2"
                value={user.registrationNumber || ''}
                onChange={(e) => setUser((u) => ({ ...u, registrationNumber: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div>
          <Button onClick={onSave}>Salvează</Button>
          {message && <span className="ml-3 text-sm text-muted-foreground">{message}</span>}
        </div>
      </div>
    </div>
  )
}

