'use client'

import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { LeadCreateForm } from '@/components/leads/LeadCreateForm'
import { LeadService } from '@/services/leadService'
import type { LeadInsert } from '@/types'

export default function NewLeadPage() {
  const router = useRouter()

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
      />
    </AppLayout>
  )
}