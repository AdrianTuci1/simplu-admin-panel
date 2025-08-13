import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { BusinessAPI } from '../../lib/api'
import CompanyStep from './steps/CompanyStep'
import LocationsStep from './steps/LocationsStep'
import DomainStep from './steps/DomainStep'
import SettingsStep from './steps/SettingsStep'
import ReviewStep from './steps/ReviewStep'
import PaymentStep from './steps/PaymentStep'
import LaunchStep from './steps/LaunchStep'

const totalSteps = 7

export default function CreateBusinessWizard({ onClose, onSuccess, businessToEdit, onUpdateSuccess, startAtPaymentStep = false }) {
  const [step, setStep] = useState(startAtPaymentStep ? 6 : 1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [createdBusiness, setCreatedBusiness] = useState(businessToEdit)


  const isEditMode = Boolean(businessToEdit)

  const [form, setForm] = useState(() => {
    if (businessToEdit) {
      // Populate form with existing business data
      return {
        companyName: businessToEdit.companyName || '',
        registrationNumber: businessToEdit.registrationNumber || '',
        businessType: businessToEdit.businessType || 'dental',
        locations: businessToEdit.locations?.length > 0 
          ? businessToEdit.locations.map((loc, index) => ({
              id: loc.id || `loc-${index + 1}`,
              name: loc.name || '',
              address: loc.address || '',
              timezone: loc.timezone || 'Europe/Bucharest',
              active: Boolean(loc.active)
            }))
          : [{ id: 'loc-1', name: 'Locație 1', address: '', timezone: 'Europe/Bucharest', active: true }],
        domainType: businessToEdit.domainType || 'subdomain',
        domainLabel: businessToEdit.domainLabel || '',
        customTld: businessToEdit.customTld || 'ro',
        clientPageType: businessToEdit.clientPageType || 'website',
        configureForEmail: businessToEdit.configureForEmail || '',
        settings: {
          currency: businessToEdit.settings?.currency || 'RON',
          language: businessToEdit.settings?.language || 'ro'
        }
      }
    }
    
    // Default form for new business
    return {
      // Step 1-5 - Configuration
      companyName: '',
      registrationNumber: '',
      businessType: 'dental',
      locations: [
        { id: 'loc-1', name: 'Locație 1', address: '', timezone: 'Europe/Bucharest', active: true },
      ],
      domainType: 'subdomain',
      domainLabel: '',
      customTld: 'ro',
      clientPageType: 'website',
      configureForEmail: '', // pentru configurarea altcuiva
      settings: {
        currency: 'RON',
        language: 'ro'
      }
    }
  })

  function updateForm(patch) {
    setForm(prev => ({ ...prev, ...patch }))
  }

  function nextStep() {
    setStep(prev => Math.min(totalSteps, prev + 1))
  }

  function prevStep() {
    setStep(prev => Math.max(1, prev - 1))
  }

  // Step 5: Configure Business
  async function handleConfigureBusiness() {
    setSaving(true)
    setError('')
    setMessage('')
    
    try {
      const payload = {
        companyName: form.companyName,
        registrationNumber: form.registrationNumber,
        businessType: form.businessType,
        locations: form.locations.map((l) => ({ 
          name: l.name, 
          address: l.address, 
          timezone: l.timezone || 'Europe/Bucharest',
          active: Boolean(l.active) 
        })),
        settings: form.settings,
        configureForEmail: form.configureForEmail || undefined,
        domainType: form.domainType,
        domainLabel: form.domainLabel,
        customTld: form.customTld,
        clientPageType: form.clientPageType,
      }

      let business
      if (isEditMode) {
        // Update existing business
        business = await BusinessAPI.updateBusiness(businessToEdit.businessId, payload)
        setCreatedBusiness(business)
        setMessage('Business actualizat cu succes!')
        if (onUpdateSuccess) {
          onUpdateSuccess(business)
        }
      } else {
        // Create new business
        business = await BusinessAPI.configureBusiness(payload)
        setCreatedBusiness(business)
        setMessage('Business configurat cu succes! Status: suspended. Acum poți configura plata.')
        nextStep()
      }
    } catch (e) {
      setError((isEditMode ? 'Actualizarea' : 'Configurarea') + ' business-ului a eșuat: ' + (e.response?.data?.message || e.message))
    } finally {
      setSaving(false)
    }
  }



  // Handle direct payment completion
  async function handlePaymentComplete() {
    setSaving(true)
    setError('')
    setMessage('')
    
    try {
      // Update business status after successful payment
      const updatedBusiness = await BusinessAPI.getBusiness(createdBusiness.businessId)
      setCreatedBusiness(updatedBusiness)
      setMessage('Plata completă! Business-ul este gata pentru lansare.')
      nextStep()
    } catch (e) {
      setError('Actualizarea statusului business-ului a eșuat: ' + (e.response?.data?.message || e.message))
    } finally {
      setSaving(false)
    }
  }

  // Step 7: Launch Business
  async function handleLaunchBusiness() {
    setSaving(true)
    setError('')
    setMessage('')
    
    try {
      const launchedBusiness = await BusinessAPI.launchBusiness(createdBusiness.businessId)
      setMessage('Business lansat cu succes! Status: active. Infrastructura se creează automat.')
      onSuccess(launchedBusiness)
    } catch (e) {
      setError('Lansarea business-ului a eșuat: ' + (e.response?.data?.message || e.message))
    } finally {
      setSaving(false)
    }
  }

  const stepComponents = {
    1: <CompanyStep form={form} updateForm={updateForm} />,
    2: <LocationsStep form={form} updateForm={updateForm} />,
    3: <DomainStep form={form} updateForm={updateForm} />,
    4: <SettingsStep form={form} updateForm={updateForm} />,
    5: <ReviewStep form={form} createdBusiness={createdBusiness} isEditMode={isEditMode} />,
    6: <PaymentStep 
         form={form} 
         createdBusiness={createdBusiness || businessToEdit} 
         onPaymentComplete={handlePaymentComplete}
       />,
    7: <LaunchStep 
         form={form} 
         createdBusiness={createdBusiness || businessToEdit} 
         onLaunchBusiness={handleLaunchBusiness}
       />,
  }

  const getStepTitle = (step) => {
    const titles = {
      1: 'Informații Companie',
      2: 'Locații',
      3: 'Domeniu',
      4: 'Setări & Contacte',
      5: isEditMode ? 'Actualizare Business' : 'Configurare Business',
      6: startAtPaymentStep ? 'Plată Business' : 'Configurare Plată',
      7: 'Lansare Business'
    }
    return titles[step] || `Pasul ${step}`
  }

  const getStepDescription = (step) => {
    const descriptions = {
      1: 'Introduceți informațiile de bază despre companie',
      2: 'Configurați locațiile business-ului',
      3: 'Configurați domeniul și tipul de pagină client',
      4: 'Setări generale și informații de contact',
      5: isEditMode ? 'Actualizați informațiile business-ului' : 'Creați business-ul cu status suspended',
      6: startAtPaymentStep ? 'Plătiți pentru business-ul configurat' : 'Configurați subscription-ul Stripe pentru plată',
      7: 'Lansați business-ul după confirmarea plății'
    }
    return descriptions[step] || ''
  }

  return (
    <div className="rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{getStepTitle(step)}</h3>
          <p className="text-sm text-muted-foreground">{getStepDescription(step)}</p>
        </div>
        <Button variant="ghost" onClick={onClose}>Închide</Button>
      </div>

      {stepComponents[step]}

      <div className="mt-6 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={step === 1 || saving}
        >
          Înapoi
        </Button>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-destructive">{error}</span>}
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
          {step < 5 ? (
            <Button onClick={nextStep}>Continuă</Button>
          ) : step === 5 ? (
            <Button onClick={handleConfigureBusiness} disabled={saving}>
              {saving ? (isEditMode ? 'Se actualizează...' : 'Se configurează...') : (isEditMode ? 'Actualizează Business' : 'Configurează Business')}
            </Button>
          ) : step === 6 ? (
            // Payment step - no button needed as PaymentManager handles it
            null
          ) : step === 7 ? (
            <Button onClick={handleLaunchBusiness} disabled={saving}>
              {saving ? 'Se lansează...' : 'Lansează Business'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
} 