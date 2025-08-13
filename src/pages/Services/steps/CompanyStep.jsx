export default function CompanyStep({ form, updateForm }) {
  return (
    <div className="grid max-w-2xl gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nume companie</label>
        <input 
          className="w-full rounded-md border bg-background px-3 py-2" 
          value={form.companyName} 
          onChange={(e) => updateForm({ companyName: e.target.value })} 
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">CUI/CIF</label>
        <input 
          className="w-full rounded-md border bg-background px-3 py-2" 
          value={form.registrationNumber} 
          onChange={(e) => updateForm({ registrationNumber: e.target.value })} 
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tip business</label>
        <select 
          className="w-full rounded-md border bg-background px-3 py-2" 
          value={form.businessType} 
          onChange={(e) => updateForm({ businessType: e.target.value })}
        >
          <option value="dental">Dental</option>
          <option value="gym">Gym</option>
          <option value="hotel">Hotel</option>
        </select>
      </div>
    </div>
  )
} 