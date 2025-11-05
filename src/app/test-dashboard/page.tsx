'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function TestDashboard() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Test Dashboard</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Auth Loading:</strong> {loading ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}
          </div>
          
          {user && (
            <div>
              <strong>User Details:</strong>
              <pre className="bg-gray-100 p-3 rounded mt-2 text-sm overflow-auto">
                {JSON.stringify({
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name
                }, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6">
            <a 
              href="/dashboard" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
            >
              Go to Dashboard
            </a>
            <a 
              href="/leads" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Go to Leads
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}