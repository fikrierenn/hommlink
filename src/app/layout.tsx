import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'HommLink CRM - Temsilci Aday Yönetim Sistemi',
  description: 'Homm Bitkisel temsilci aday yönetimi için modern CRM sistemi',
  manifest: '/manifest.json',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#4CAF50',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}