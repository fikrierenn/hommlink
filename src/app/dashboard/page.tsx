'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'
import { 
  Users, UserPlus, Phone, Calendar, MessageCircle, 
  TrendingUp, RefreshCw, Activity
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { LoadingPage, Button } from '@/components/ui'
import { useDashboard } from '@/hooks'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { stats, recentActivities, loading, error, refresh } = useDashboard()

  useEffect(() => {
    console.log('📊 Dashboard - authLoading:', authLoading, 'user:', !!user)
    if (!authLoading && !user) {
      console.log('❌ No user in dashboard, redirecting to login')
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return <LoadingPage text="Yükleniyor..." />
  }

  if (!user) {
    return null
  }

  if (loading) {
    console.log('📊 Dashboard loading...')
    return (
      <AppLayout>
        <LoadingPage text="Dashboard yükleniyor..." />
      </AppLayout>
    )
  }

  if (error && !stats) {
    console.log('📊 Dashboard error:', error)
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
        </div>
      </AppLayout>
    )
  }

  console.log('📊 Dashboard rendering with stats:', !!stats)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'whatsapp_sent': return <MessageCircle className="h-5 w-5 text-green-600" />
      case 'call_made': return <Phone className="h-5 w-5 text-orange-600" />
      case 'lead_created': return <UserPlus className="h-5 w-5 text-blue-600" />
      case 'appointment_set': return <Calendar className="h-5 w-5 text-purple-600" />
      case 'status_changed': return <Activity className="h-5 w-5 text-indigo-600" />
      default: return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'whatsapp_sent': return 'bg-green-100'
      case 'call_made': return 'bg-orange-100'
      case 'lead_created': return 'bg-blue-100'
      case 'appointment_set': return 'bg-purple-100'
      case 'status_changed': return 'bg-indigo-100'
      default: return 'bg-gray-100'
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Az önce'
    if (diffInHours < 24) return `${diffInHours} saat önce`
    if (diffInHours < 48) return '1 gün önce'
    return `${Math.floor(diffInHours / 24)} gün önce`
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Hoş geldin, {user.user_metadata?.full_name || user.email}</p>
          </div>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Bu Ay */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Ay</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-green-900">Toplam Aday</p>
                  <p className="text-2xl font-bold text-green-700">{stats?.totalLeads || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-green-600">
                Bu ay {stats?.newLeadsThisMonth || 0} yeni
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-blue-900">Aranacaklar</p>
                  <p className="text-2xl font-bold text-blue-700">{stats?.callsNeeded || 0}</p>
                </div>
                <Phone className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-blue-600">Arama bekleyen</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-orange-900">Aramalar</p>
                  <p className="text-2xl font-bold text-orange-700">{stats?.totalCalls || 0}</p>
                </div>
                <Phone className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-orange-600">
                Başarı oranı %{stats?.callSuccessRate || 0}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-purple-900">Randevular</p>
                  <p className="text-2xl font-bold text-purple-700">{stats?.appointmentsSet || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-purple-600">
                Dönüşüm %{stats?.conversionRate || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Bu Hafta */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Hafta</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <UserPlus className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  {stats?.newLeadsThisWeek || 0} Yeni Aday
                </span>
              </div>
              <p className="text-xs text-green-600">
                Bugün {stats?.newLeadsToday || 0} eklendi
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {stats?.appointmentsSet || 0} Randevu
                </span>
              </div>
              <p className="text-xs text-blue-600">
                Dönüşüm oranı %{stats?.conversionRate || 0}
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <MessageCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  {stats?.whatsappSent || 0} WhatsApp
                </span>
              </div>
              <p className="text-xs text-purple-600">
                Cevap oranı %{stats?.whatsappResponseRate || 0}
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  %{stats?.conversionRate || 0} Başarı
                </span>
              </div>
              <p className="text-xs text-orange-600">Genel performans</p>
            </div>
          </div>
        </div>

        {/* Hızlı Eylemler */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Eylemler</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/leads/new">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="h-4 w-4 mr-2" />
                Yeni Aday Ekle
              </Button>
            </Link>
            <Link href="/leads/parser">
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp Ayrıştır
              </Button>
            </Link>
            <Link href="/leads?filter=to_call">
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Aranacaklar
              </Button>
            </Link>
            <Link href="/leads?filter=appointments">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Randevular
              </Button>
            </Link>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz aktivite yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-10 h-10 ${getActivityBgColor(activity.type)} rounded-full flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {activity.leadName} • {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}