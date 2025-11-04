const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up HommLink CRM database...')
  
  try {
    // Test connection
    console.log('🔄 Testing connection...')
    const { data, error } = await supabase.from('_test').select('*').limit(1)
    if (error && !error.message.includes('relation "_test" does not exist')) {
      throw error
    }
    console.log('✅ Connection successful!')

    // Create users table
    console.log('🔄 Creating users table...')
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          auth_uid uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name text NOT NULL,
          role text DEFAULT 'agent' CHECK (role IN ('agent', 'admin')),
          phone text,
          email text,
          is_active boolean DEFAULT true,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own profile" ON public.users
          FOR SELECT USING (auth.uid() = auth_uid);
          
        CREATE POLICY "Users can update own profile" ON public.users
          FOR UPDATE USING (auth.uid() = auth_uid);
          
        CREATE POLICY "Admins can view all users" ON public.users
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE auth_uid = auth.uid() AND role = 'admin'
            )
          );
      `
    })

    if (usersError) {
      console.log('ℹ️ Users table might already exist, continuing...')
    } else {
      console.log('✅ Users table created!')
    }

    // Create status_definitions table
    console.log('🔄 Creating status_definitions table...')
    const { error: statusError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.status_definitions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          code text UNIQUE NOT NULL,
          label text NOT NULL,
          color text NOT NULL,
          order_index int DEFAULT 0,
          is_active boolean DEFAULT true,
          created_at timestamptz DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.status_definitions ENABLE ROW LEVEL SECURITY;
        
        -- Create policy - everyone can read status definitions
        CREATE POLICY "Anyone can view status definitions" ON public.status_definitions
          FOR SELECT USING (true);
      `
    })

    if (statusError) {
      console.log('ℹ️ Status definitions table might already exist, continuing...')
    } else {
      console.log('✅ Status definitions table created!')
    }

    // Insert initial status definitions
    console.log('🔄 Inserting initial status definitions...')
    const { data: existingStatuses } = await supabase
      .from('status_definitions')
      .select('code')

    if (!existingStatuses || existingStatuses.length === 0) {
      const initialStatuses = [
        { code: 'NEW', label: 'Yeni', color: '#D1FAE5', order_index: 10 },
        { code: 'TO_CALL', label: 'Aranacak', color: '#E0E7FF', order_index: 20 },
        { code: 'WA_SENT', label: 'Cevap Bekleniyor (WA)', color: '#FEF3C7', order_index: 40 },
        { code: 'APPT_SET', label: 'Randevu Verildi', color: '#FDE68A', order_index: 50 },
        { code: 'APPT_CONFIRMED', label: 'Randevu Onaylandı', color: '#FCD34D', order_index: 55 },
        { code: 'FOLLOW_UP', label: 'Takipte', color: '#DBEAFE', order_index: 60 },
        { code: 'QUALIFIED', label: 'Nitelikli', color: '#A7F3D0', order_index: 70 },
        { code: 'CLOSED', label: 'Kapanmış', color: '#E5E7EB', order_index: 90 }
      ]

      const { error: insertError } = await supabase
        .from('status_definitions')
        .insert(initialStatuses)

      if (insertError) {
        console.error('❌ Failed to insert status definitions:', insertError.message)
      } else {
        console.log('✅ Initial status definitions inserted!')
      }
    } else {
      console.log('ℹ️ Status definitions already exist, skipping...')
    }

    // Create leads table
    console.log('🔄 Creating leads table...')
    const { error: leadsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.leads (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          external_id text,
          source text DEFAULT 'whatsapp',
          name text NOT NULL,
          phone text NOT NULL,
          region text,
          city text,
          status_id uuid REFERENCES public.status_definitions(id),
          notes text,
          next_action text,
          next_action_at timestamptz,
          appointment_date timestamptz,
          call_count int DEFAULT 0,
          last_contact_at timestamptz,
          owner_uid uuid REFERENCES public.users(auth_uid),
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own leads" ON public.leads
          FOR SELECT USING (owner_uid = auth.uid());
          
        CREATE POLICY "Users can insert own leads" ON public.leads
          FOR INSERT WITH CHECK (owner_uid = auth.uid());
          
        CREATE POLICY "Users can update own leads" ON public.leads
          FOR UPDATE USING (owner_uid = auth.uid());
          
        CREATE POLICY "Admins can view all leads" ON public.leads
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE auth_uid = auth.uid() AND role = 'admin'
            )
          );
      `
    })

    if (leadsError) {
      console.log('ℹ️ Leads table might already exist, continuing...')
    } else {
      console.log('✅ Leads table created!')
    }

    // Create lead_events table
    console.log('🔄 Creating lead_events table...')
    const { error: eventsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.lead_events (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
          event_type text CHECK (event_type IN ('call', 'whatsapp', 'status_change', 'note', 'appointment')),
          disposition text,
          note text,
          metadata jsonb,
          created_by uuid REFERENCES public.users(auth_uid),
          created_at timestamptz DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view events for own leads" ON public.lead_events
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.leads 
              WHERE id = lead_id AND owner_uid = auth.uid()
            )
          );
          
        CREATE POLICY "Users can insert events for own leads" ON public.lead_events
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.leads 
              WHERE id = lead_id AND owner_uid = auth.uid()
            )
          );
      `
    })

    if (eventsError) {
      console.log('ℹ️ Lead events table might already exist, continuing...')
    } else {
      console.log('✅ Lead events table created!')
    }

    // Create whatsapp_templates table
    console.log('🔄 Creating whatsapp_templates table...')
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          code text UNIQUE NOT NULL,
          name text NOT NULL,
          message text NOT NULL,
          variables text[] DEFAULT '{}',
          is_active boolean DEFAULT true,
          created_at timestamptz DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
        
        -- Create policy - everyone can read templates
        CREATE POLICY "Anyone can view whatsapp templates" ON public.whatsapp_templates
          FOR SELECT USING (is_active = true);
      `
    })

    if (templatesError) {
      console.log('ℹ️ WhatsApp templates table might already exist, continuing...')
    } else {
      console.log('✅ WhatsApp templates table created!')
    }

    // Insert initial WhatsApp templates
    console.log('🔄 Inserting initial WhatsApp templates...')
    const { data: existingTemplates } = await supabase
      .from('whatsapp_templates')
      .select('code')

    if (!existingTemplates || existingTemplates.length === 0) {
      const initialTemplates = [
        {
          code: 'FIRST_CONTACT',
          name: 'İlk İletişim',
          message: 'Merhaba {name}, Homm Bitkisel temsilciliği hakkında bilgi almak istediğinizi öğrendim. Size detaylı bilgi verebilirim. Uygun olduğunuz bir zaman var mı?',
          variables: ['name']
        },
        {
          code: 'APPOINTMENT_REMINDER',
          name: 'Randevu Hatırlatması',
          message: 'Merhaba {name}, yarın saat {time} randevumuz var. Görüşmemizi dört gözle bekliyorum. Herhangi bir değişiklik olursa lütfen bana bildirin.',
          variables: ['name', 'time']
        },
        {
          code: 'FOLLOW_UP',
          name: 'Takip Mesajı',
          message: 'Merhaba {name}, geçen görüşmemizden sonra düşündünüz mü? Sorularınız varsa çekinmeden sorabilirsiniz.',
          variables: ['name']
        }
      ]

      const { error: insertTemplatesError } = await supabase
        .from('whatsapp_templates')
        .insert(initialTemplates)

      if (insertTemplatesError) {
        console.error('❌ Failed to insert WhatsApp templates:', insertTemplatesError.message)
      } else {
        console.log('✅ Initial WhatsApp templates inserted!')
      }
    } else {
      console.log('ℹ️ WhatsApp templates already exist, skipping...')
    }

    console.log('🎉 Database setup completed successfully!')
    console.log('📊 You can now register users and start using the CRM!')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()