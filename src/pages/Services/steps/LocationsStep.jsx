import { Button } from '../../../components/ui/button'

export default function LocationsStep({ form, updateForm }) {
  function addLocation() {
    updateForm({
      locations: [
        ...form.locations,
        { 
          id: `loc-${form.locations.length + 1}`, 
          name: `Locație ${form.locations.length + 1}`, 
          address: '', 
          timezone: 'Europe/Bucharest',
          active: true 
        },
      ],
    })
  }

  function updateLocation(index, patch) {
    updateForm({
      locations: form.locations.map((loc, i) => (i === index ? { ...loc, ...patch } : loc)),
    })
  }

  function removeLocation(index) {
    updateForm({
      locations: form.locations.filter((_, i) => i !== index),
    })
  }

  const timezones = [
    { value: 'Europe/Bucharest', label: 'București (UTC+2/+3)' },
    { value: 'Europe/London', label: 'Londra (UTC+0/+1)' },
    { value: 'Europe/Berlin', label: 'Berlin (UTC+1/+2)' },
    { value: 'America/New_York', label: 'New York (UTC-5/-4)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8/-7)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
    { value: 'Australia/Sydney', label: 'Sydney (UTC+10/+11)' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Locații</h4>
        <Button size="sm" variant="outline" onClick={addLocation}>Adaugă locație</Button>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h5 className="font-medium text-blue-800 mb-2">Informații Locații</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Fiecare locație va avea propriul shard în baza de date</li>
          <li>• Shard-urile au cheie compusă: businessId-locationId</li>
          <li>• Doar locațiile active vor fi create în infrastructură</li>
          <li>• Timezone-ul este important pentru programări și facturare</li>
        </ul>
      </div>

      <div className="space-y-4">
        {form.locations.map((loc, idx) => (
          <div key={loc.id} className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{loc.name}</p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={loc.active} 
                    onChange={(e) => updateLocation(idx, { active: e.target.checked })} 
                  /> 
                  Activ
                </label>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeLocation(idx)}
                >
                  Șterge
                </Button>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Nume locație</label>
                <input 
                  className="w-full rounded-md border bg-background px-3 py-2" 
                  value={loc.name} 
                  onChange={(e) => updateLocation(idx, { name: e.target.value })} 
                  placeholder="ex: Clinica Centrală"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Adresă</label>
                <input 
                  className="w-full rounded-md border bg-background px-3 py-2" 
                  value={loc.address} 
                  onChange={(e) => updateLocation(idx, { address: e.target.value })} 
                  placeholder="ex: Str. Clinicii 10, București"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Timezone</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={loc.timezone || 'Europe/Bucharest'}
                  onChange={(e) => updateLocation(idx, { timezone: e.target.value })}
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Timezone-ul este folosit pentru programări, facturare și rapoarte.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {form.locations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nu există locații configurate.</p>
          <p className="text-sm">Adăugați cel puțin o locație pentru a continua.</p>
        </div>
      )}
    </div>
  )
} 