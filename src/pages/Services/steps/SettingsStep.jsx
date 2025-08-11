export default function SettingsStep({ form, updateForm }) {
  const isConfigureForMe = !form.configureForEmail || form.configureForEmail === ''

  return (
    <div className="grid max-w-2xl gap-6">
      <div className="space-y-4">
        <h4 className="font-medium">Configurare Owner</h4>
        
        <div>
          <label className="mb-2 block text-sm font-medium">Configurare pentru</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="configureFor" 
                value="me"
                checked={isConfigureForMe}
                onChange={() => updateForm({ configureForEmail: '' })}
              />
              <span className="text-sm">Configurează pentru mine (utilizatorul curent)</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="configureFor" 
                value="other"
                checked={!isConfigureForMe}
                onChange={() => updateForm({ configureForEmail: ' ' })}
              />
              <span className="text-sm">Configurează pentru altcineva</span>
            </label>
          </div>
        </div>

        {!isConfigureForMe && (
          <div>
            <label className="mb-1 block text-sm font-medium">Email pentru configurare</label>
            <input 
              className="w-full rounded-md border bg-background px-3 py-2" 
              placeholder="ex: owner@firma.ro" 
              value={form.configureForEmail} 
              onChange={(e) => updateForm({ configureForEmail: e.target.value })} 
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Dacă user-ul nu există, se va crea un profil placeholder și se va trimite email cu invitație.
            </p>
          </div>
        )}
      </div>



      <div className="space-y-4">
        <h4 className="font-medium">Setări Generale</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Monedă</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2"
              value={form.settings?.currency || 'RON'}
              onChange={(e) => updateForm({ 
                settings: { 
                  ...form.settings, 
                  currency: e.target.value 
                } 
              })}
            >
              <option value="RON">RON (Lei Românești)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dolari US)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Limbă</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2"
              value={form.settings?.language || 'ro'}
              onChange={(e) => updateForm({ 
                settings: { 
                  ...form.settings, 
                  language: e.target.value 
                } 
              })}
            >
              <option value="ro">Română</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h5 className="font-medium text-blue-800 mb-2">Informații Importante</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Dacă configurați pentru altcineva, acela va deveni owner-ul business-ului</li>
          <li>• Owner-ul va fi responsabil pentru plata abonamentului</li>
          <li>• Dacă owner-ul nu există, va primi un email cu invitație pentru crearea contului</li>
          <li>• Utilizatorul curent rămâne creator-ul business-ului (createdByUserId)</li>
        </ul>
      </div>
    </div>
  )
} 