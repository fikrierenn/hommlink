import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HommLink CRM - Temsilci Aday Yönetim Sistemi',
  description: 'Homm Bitkisel temsilci aday yönetimi için modern CRM sistemi',
  manifest: '/manifest.json',
  themeColor: '#4CAF50',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HommLink CRM',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'HommLink CRM',
    title: 'HommLink CRM - Temsilci Aday Yönetim Sistemi',
    description: 'Homm Bitkisel temsilci aday yönetimi için modern CRM sistemi',
  },
  twitter: {
    card: 'summary',
    title: 'HommLink CRM - Temsilci Aday Yönetim Sistemi',
    description: 'Homm Bitkisel temsilci aday yönetimi için modern CRM sistemi',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}