'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
import { AppLayout } from '@/components/layout'
import { LeadCreateForm } from '@/components/leads/LeadCreateForm'
import { LeadService } from '@/services/leadService'
import type { LeadInsert } from '@/types'

function NewLeadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL parametrelerinden initial data oluştur
  const initialData = {
    name: searchParams.get('name') || '',
    phone: searchParams.get('phone') || '',
    city: searchParams.get('location') || searchParams.get('city') || '',
    source: (searchParams.get('source') as any) || 'whatsapp',
    notes: searchParams.get('source') === 'whatsapp_parser' 
      ? 'WhatsApp ayrıştırıcısından oluşturuldu'
      : ''
  }

  const handleBack = () => {
    router.push('/leads')
  }

  const handleSave = async (leadData: LeadInsert) => {
    try {
      console.log('Creating lead:', leadData)
      const newLead = await LeadService.createLead(leadData)
      console.log('Lead created successfully:', newLead)
      router.push('/leads')
    } catch (error) {
      console.error('Error creating lead:', error)
      // TODO: Show error toast/notification
      throw error // Re-throw so form can handle it
    }
  }

  return (
    <AppLayout 
      title="Yeni Aday"
      showBackButton 
      onBack={handleBack}
      showBottomNav={false}
    >
      <LeadCreateForm 
        onSave={handleSave}
        onCancel={handleBack}
        initialData={initialData}
      />
    </AppLayout>
  )
}

export default function NewLeadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewLeadForm />
    </Suspense>
  )
}