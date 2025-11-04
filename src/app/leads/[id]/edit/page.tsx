'use client'

import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { LeadEditForm } from '@/components/leads/LeadEditForm'
import { useLeadDetail } from '@/hooks'
import { LoadingPage, Error } from '@/components/ui'

interface LeadEditPageProps {
  params: {
    id: string
  }
}

export default function LeadEditPage({ params }: LeadEditPageProps) {
  const router = useRouter()
  const { lead, loading, error, updateLead } = useLeadDetail(params.id)

  const handleBack = () => {
    router.push(`/leads/${params.id}`)
  }

  const handleSave = async (updatedLead: any) => {
    try {
      await updateLead(updatedLead)
      router.push(`/leads/${params.id}`)
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