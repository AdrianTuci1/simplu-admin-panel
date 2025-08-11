export default function DomainStep({ form, updateForm }) {
  const getDomainPreview = () => {
    if (form.domainType === 'subdomain') {
      return form.domainLabel ? `${form.domainLabel}.simplu.io` : 'your-label.simplu.io'
    } else {
      return form.domainLabel && form.customTld ? `${form.domainLabel}.${form.customTld}` : 'your-domain.com'
    }
  }

  return (
    <div className="grid max-w-2xl gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Tip domeniu</label>
          <select 
            className="w-full rounded-md border bg-background px-3 py-2" 
            value={form.domainType} 
            onChange={(e) => updateForm({ domainType: e.target.value })}
          >
            <option value="subdomain">Subdomeniu</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Label domeniu</label>
          <input 
            className="w-full rounded-md border bg-background px-3 py-2" 
            value={form.domainLabel} 
            onChange={(e) => updateForm({ domainLabel: e.target.value })} 
            placeholder={form.domainType === 'subdomain' ? 'ex: cabinet-dental' : 'ex: cabinetdental'}
          />
        </div>
        {form.domainType === 'custom' && (
          <div>
            <label className="mb-1 block text-sm font-medium">Custom TLD</label>
            <input 
              className="w-full rounded-md border bg-background px-3 py-2" 
              value={form.customTld} 
              onChange={(e) => updateForm({ customTld: e.target.value })} 
              placeholder="ex: ro"
            />
          </div>
        )}
      </div>
      
      <div className="rounded-md border bg-muted p-3">
        <label className="mb-1 block text-sm font-medium">Previzualizare domeniu</label>
        <p className="text-sm text-muted-foreground">{getDomainPreview()}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tip pagină client</label>
        <select 
          className="w-full rounded-md border bg-background px-3 py-2" 
          value={form.clientPageType} 
          onChange={(e) => updateForm({ clientPageType: e.target.value })}
        >
          <option value="website">Website</option>
          <option value="form">Form</option>
        </select>
      </div>
    </div>
  )
} 