'use client'

import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { LeadEditForm } from '@/components/leads/LeadEditForm'
import { useLeadDetail } from '@/hooks'
import { LoadingPage, Error } from '@/components/ui'
import { use } from 'react'
import type { Lead } from '@/types'

interface LeadEditPageProps {
  params: {
    id: string
  }
}

export default function LeadEditPage({ params }: LeadEditPageProps) {
  const { id } = params
  const router = useRouter()
  const { lead, loading, error, updateLead } = useLeadDetail(id)

  const handleBack = () => {
    router.push(`/leads/${id}`)
  }

  const handleSave = async (updatedLead: Partial<Lead>) => {
    try {
      await updateLead(updatedLead)
      router.push(`/leads/${id}`)
    } catch (error) {
      console.error('Error updating lead:', error)
      // Handle error (show toast, etc.)
    }
  }

  if (loading) {
    return <LoadingPage text="Aday bilgileri yükleniyor..." />
  }

  if (error) {
    return (
      <AppLayout title="Hata" showBackButton onBack={handleBack}>
        <Error
          title="Aday bulunamadı"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </AppLayout>
    )
  }

  if (!lead) {
    return (
      <AppLayout title="Bulunamadı" showBackButton onBack={handleBack}>
        <Error
          title="Aday bulunamadı"
          message="Bu aday mevcut değil veya silinmiş olabilir."
          onRetry={handleBack}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout 
      title="Aday Düzenle"
      showBackButton 
      onBack={handleBack}
      showBottomNav={false}
    >
      <LeadEditForm 
        lead={lead}
        onSave={handleSave}
        onCancel={handleBack}
      />
    </AppLayout>
  )
}