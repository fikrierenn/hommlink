'use client'

import { useState, useCallback } from 'react'

export const dynamic = 'force-dynamic'
import { AppLayout } from '@/components/layout'
import { LeadList } from '@/components/leads/LeadList'
import { LeadFilters } from '@/components/leads/LeadFilters'
import { SearchBar } from '@/components/leads/SearchBar'
import { useLeads } from '@/hooks'
import { Button } from '@/components/ui'
import { Plus, Filter } from 'lucide-react'
import Link from 'next/link'

export default function LeadsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const {
    leads,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
    setFilters
  } = useLeads()

  const handleSearch = useCallback((query: string) => {
    setFilters({ search: query })
  }, [setFilters])

  const handleFilterChange = useCallback((filters: any) => {
    setFilters(filters)
    setShowFilters(false)
  }, [setFilters])

  return (
    <AppLayout 
      title="Adaylar"
      showBackButton={false}
    >
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Aday ara (isim, telefon, not...)"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtre</span>
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <LeadFilters
            onApplyFilters={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Stats Summary */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Aday</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <Link href="/leads/new">
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Yeni Aday</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Lead List */}
      <LeadList
        leads={leads}
        loading={loading}
        error={error}
        hasMore={pagination.hasMore}
        onLoadMore={loadMore}
        onRefresh={refresh}
      />
    </AppLayout>
  )
}