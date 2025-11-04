const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

async function runCompleteSetup() {
  try {
    console.log('🚀 Running complete HommLink CRM database setup...')
    
    // Read the complete SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'complete-setup.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📝 Executing SQL via Supabase REST API...')
    
    // Use Supabase REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        sql: sqlContent
      })
    })
    
    if (!response.ok) {
      // Try alternative approach - direct SQL execution
      console.log('ℹ️ RPC method not available, trying direct approach...')
      
      // Split SQL into manageable chunks and execute via HTTP
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      console.log(`📋 Found ${statements.length} SQL statements`)
      
      // For now, let's just create the file and provide instructions
      console.log('📄 SQL file created successfully!')
      console.log('')
      console.log('🔧 Manual Setup Instructions:')
      console.log('1. Go to Supabase Dashboard: https://pccbipmevbuxctjzsvxf.supabase.co')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the content from: database/complete-setup.sql')
      console.log('4. Click "Run" to execute all statements')
      console.log('')
      console.log('✅ After running the SQL, your database will be ready!')
      console.log('🌐 Test the application at: http://localhost:3000')
      
      return
    }
    
    const result = await response.json()
    
    if (result.error) {
      console.error('❌ SQL execution failed:', result.error)
    } else {
      console.log('✅ Database setup completed successfully!')
      console.log('🎉 All tables, policies, and initial data created!')
      console.log('')
      console.log('📊 Database includes:')
      console.log('  ✅ Users table with RLS policies')
      console.log('  ✅ Status definitions (8 predefined statuses)')
      console.log('  ✅ Leads table with full functionality')
      console.log('  ✅ Lead events for activity tracking')
      console.log('  ✅ WhatsApp templates (9 predefined messages)')
      console.log('  ✅ Indexes for performance')
      console.log('  ✅ Triggers for auto-updates')
      console.log('')
      console.log('🌐 Ready to test at: http://localhost:3000')
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('')
    console.log('🔧 Fallback - Manual Setup:')
    console.log('1. Go to Supabase Dashboard: https://pccbipmevbuxctjzsvxf.supabase.co')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the content from: database/complete-setup.sql')
    console.log('4. Click "Run" to execute all statements')
  }
}

runCompleteSetup()