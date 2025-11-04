'use client'

import React, { useState } from 'react'
import { LeadCard } from './LeadCard'
import { WhatsAppModal } from './WhatsAppModal'
import { CallLogModal } from './CallLogModal'
import { Loading, Error, EmptyLeads, Button } from '@/components/ui'
import { RefreshCw } from 'lucide-react'
import type { Lead } from '@/types'

interface LeadListProps {
  leads: Lead[]
  loading: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
  onRefresh: () => void
}

export function LeadList({
  leads,
  loading,
  error,
  hasMore,
  onLoadMore,
  onRefresh
}: LeadListProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)

  const handleWhatsAppPress = (lead: Lead) => {
    setSelectedLead(lead)
    setShowWhatsAppModal(true)
  }

  const handleCallPress = (lead: Lead) => {
    setSelectedLead(lead)
    setShowCallModal(true)
  }

  const handleWhatsAppSent = () => {
    setShowWhatsAppModal(false)
    setSelectedLead(null)
    // Optionally refresh the list to show updated status
    onRefresh()
  }

  const handleCallLogged = () => {
    setShowCallModal(false)
    setSelectedLead(null)
    // Optionally refresh the list to show updated call count
    onRefresh()
  }

  if (error) {
    return (
      <Error
        title="Adaylar yüklenemedi"
        message={error}
        onRetry={onRefresh}
      />
    )
  }

  if (loading && leads.length === 0) {
    return <Loading text="Adaylar yükleniyor..." />
  }

  if (!loading && leads.length === 0) {
    return <EmptyLeads onAddLead={() => window.location.href = '/leads/new'} />
  }

  return (
    <div className="space-y-4">
      {/* Pull to Refresh */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </Button>
      </div>

      {/* Lead Cards */}
      <div className="space-y-3">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onWhatsAppPress={handleWhatsAppPress}
            onCallPress={handleCallPress}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading && <Loading size="sm" />}
            <span>{loading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}</span>
          </Button>
        </div>
      )}

      {/* Loading indicator for additional loads */}
      {loading && leads.length > 0 && (
        <div className="flex justify-center py-4">
          <Loading size="sm" text="Daha fazla aday yükleniyor..." />
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && selectedLead && (
        <WhatsAppModal
          lead={selectedLead}
          onClose={() => setShowWhatsAppModal(false)}
          onSent={handleWhatsAppSent}
        />
      )}

      {/* Call Log Modal */}
      {showCallModal && selectedLead && (
        <CallLogModal
          lead={selectedLead}
          onClose={() => setShowCallModal(false)}
          onLogged={handleCallLogged}
        />
      )}
    </div>
  )
}