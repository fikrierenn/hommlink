'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="tr">
      <body className="font-sans">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">Hata</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Bir şeyler ters gitti</h2>
            <p className="text-gray-600 mb-8">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
            <button
              onClick={reset}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors mr-4"
            >
              Tekrar Dene
            </button>
            <a 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Ana Sayfa
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}