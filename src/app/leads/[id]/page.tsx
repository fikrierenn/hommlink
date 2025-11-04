'use client'

import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { LeadDetailView } from '@/components/leads/LeadDetailView'
import { useLeadDetail } from '@/hooks'
import { LoadingPage, Error } from '@/components/ui'
import { use } from 'react'

interface LeadDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { lead, events, loading, error } = useLeadDetail(id)

  const handleBack = () => {
    router.push('/leads')
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
      title={lead.name}
      showBackButton 
      onBack={handleBack}
      showBottomNav={false}
    >
      <LeadDetailView 
        lead={lead} 
        events={events}
        onEdit={() => router.push(`/leads/${id}/edit`)}
      />
    </AppLayout>
  )
}