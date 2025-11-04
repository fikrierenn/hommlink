'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { useStatuses } from '@/hooks'
import { TURKISH_REGIONS } from '@/types'
import type { LeadFilters as LeadFiltersType } from '@/types'

interface LeadFiltersProps {
  onApplyFilters: (filters: LeadFiltersType) => void
  onClose: () => void
  initialFilters?: LeadFiltersType
}

export function LeadFilters({ 
  onApplyFilters, 
  onClose, 
  initialFilters = {} 
}: LeadFiltersProps) {
  const { statuses } = useStatuses()
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>(
    initialFilters.status_ids || []
  )
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    initialFilters.regions || []
  )
  const [dateFrom, setDateFrom] = useState(
    initialFilters.date_range?.start || ''
  )
  const [dateTo, setDateTo] = useState(
    initialFilters.date_range?.end || ''
  )

  const toggleStatus = (statusId: number) => {
    setSelectedStatuses(prev => 
      prev.includes(statusId)
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    )
  }

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    )
  }

  const handleApply = () => {
    const filters: LeadFiltersType = {}

    if (selectedStatuses.length > 0) {
      filters.status_ids = selectedStatuses
    }

    if (selectedRegions.length > 0) {
      filters.regions = selectedRegions
    }

    if (dateFrom || dateTo) {
      filters.date_range = {
        start: dateFrom || new Date(0).toISOString(),
        end: dateTo || new Date().toISOString()
      }
    }

    onApplyFilters(filters)
  }

  const handleClear = () => {
    setSelectedStatuses([])
    setSelectedRegions([])
    setDateFrom('')
    setDateTo('')
    onApplyFilters({})
  }

  const hasActiveFilters = selectedStatuses.length > 0 || 
                          selectedRegions.length > 0 || 
                          dateFrom || 
                          dateTo

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Filtreler</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Durum</h4>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status.id}
                onClick={() => toggleStatus(status.id)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedStatuses.includes(status.id)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Bölge</h4>
          <div className="flex flex-wrap gap-2">
            {TURKISH_REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => toggleRegion(region)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedRegions.includes(region)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Tarih Aralığı</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Başlangıç</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Bitiş</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleApply}
            className="flex-1"
            disabled={!hasActiveFilters}
          >
            Filtrele
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Temizle
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Aktif Filtreler:</p>
            <div className="flex flex-wrap gap-1">
              {selectedStatuses.map(statusId => {
                const status = statuses.find(s => s.id === statusId)
                return status ? (
                  <Badge key={statusId} size="sm" variant="outline">
                    {status.label}
                  </Badge>
                ) : null
              })}
              
              {selectedRegions.map(region => (
                <Badge key={region} size="sm" variant="outline">
                  {region}
                </Badge>
              ))}
              
              {(dateFrom || dateTo) && (
                <Badge size="sm" variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  Tarih
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}