'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, UserPlus, Phone, Calendar, MessageCircle
} from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { LoadingPage } from '@/components/ui'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingPage text="Yükleniyor..." />
  }

  if (!user) {
    return null
  }

  return (
    <AppLayout>
        {/* Bu Ay */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Ay</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-green-900">Toplam Aday</p>
                  <p className="text-2xl font-bold text-green-700">127</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-green-600">Geçen aya göre %18 ↗</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-blue-900">Yeni Adaylar</p>
                  <p className="text-2xl font-bold text-blue-700">43</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-blue-600">Bu ay eklenen</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-orange-900">Aramalar</p>
                  <p className="text-2xl font-bold text-orange-700">186</p>
                </div>
                <Phone className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-orange-600">Başarı oranı %72</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-purple-900">Randevular</p>
                  <p className="text-2xl font-bold text-purple-700">31</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-purple-600">Dönüşüm %24</p>
            </div>
          </div>
        </div>



        {/* Bu Hafta */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Hafta</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <UserPlus className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">15 Yeni Aday</span>
              </div>
              <p className="text-xs text-green-600">Geçen haftaya göre %25 ↗</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">8 Randevu</span>
              </div>
              <p className="text-xs text-blue-600">Dönüşüm oranı %53</p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <Phone className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">42 Arama</span>
              </div>
              <p className="text-xs text-purple-600">Başarı oranı %68</p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <MessageCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">28 Mesaj</span>
              </div>
              <p className="text-xs text-orange-600">Cevap oranı %71</p>
            </div>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">WhatsApp mesajı gönderildi</p>
                <p className="text-xs text-gray-500">Ahmet Yılmaz • 2 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Yeni aday eklendi</p>
                <p className="text-xs text-gray-500">Fatma Demir • 5 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Görüşme yapıldı</p>
                <p className="text-xs text-gray-500">Mehmet Kaya • 1 gün önce</p>
              </div>
            </div>
          </div>
        </div>
    </AppLayout>
  )
}