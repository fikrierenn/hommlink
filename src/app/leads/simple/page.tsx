'use client'

import { AppLayout } from '@/components/layout'

export default function SimpleLeadsPage() {
  return (
    <AppLayout title="Adaylar (Basit)">
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold">Adaylar Listesi</h2>
          <p>Bu basit bir test sayfasıdır.</p>
        </div>
      </div>
    </AppLayout>
  )
}