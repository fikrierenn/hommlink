-- HommLink CRM Database Schema
-- Run this in Supabase SQL Editor

-- 1. Create users table
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

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_uid);
  
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_uid);

-- 2. Create status_definitions table
CREATE TABLE IF NOT EXISTS public.status_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  color text NOT NULL,
  order_index int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for status_definitions
ALTER TABLE public.status_definitions ENABLE ROW LEVEL SECURITY;

-- Status definitions policy
CREATE POLICY "Anyone can view status definitions" ON public.status_definitions
  FOR SELECT USING (true);

-- Insert initial status definitions
INSERT INTO public.status_definitions (code, label, color, order_index) VALUES
  ('NEW', 'Yeni', '#D1FAE5', 10),
  ('TO_CALL', 'Aranacak', '#E0E7FF', 20),
  ('WA_SENT', 'Cevap Bekleniyor (WA)', '#FEF3C7', 40),
  ('APPT_SET', 'Randevu Verildi', '#FDE68A', 50),
  ('APPT_CONFIRMED', 'Randevu Onaylandı', '#FCD34D', 55),
  ('FOLLOW_UP', 'Takipte', '#DBEAFE', 60),
  ('QUALIFIED', 'Nitelikli', '#A7F3D0', 70),
  ('CLOSED', 'Kapanmış', '#E5E7EB', 90)
ON CONFLICT (code) DO NOTHING;

-- 3. Create leads table
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
  owner_uid uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Users can view own leads" ON public.leads
  FOR SELECT USING (owner_uid = auth.uid());
  
CREATE POLICY "Users can insert own leads" ON public.leads
  FOR INSERT WITH CHECK (owner_uid = auth.uid());
  
CREATE POLICY "Users can update own leads" ON public.leads
  FOR UPDATE USING (owner_uid = auth.uid());

-- 4. Create lead_events table
CREATE TABLE IF NOT EXISTS public.lead_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type text CHECK (event_type IN ('call', 'whatsapp', 'status_change', 'note', 'appointment')),
  disposition text,
  note text,
  metadata jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for lead_events
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- Lead events policies
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

-- 5. Create whatsapp_templates table
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  message text NOT NULL,
  variables text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for whatsapp_templates
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- WhatsApp templates policy
CREATE POLICY "Anyone can view whatsapp templates" ON public.whatsapp_templates
  FOR SELECT USING (is_active = true);

-- Insert initial WhatsApp templates
INSERT INTO public.whatsapp_templates (code, name, message, variables) VALUES
  ('FIRST_CONTACT', 'İlk İletişim', 'Merhaba {name}, Homm Bitkisel temsilciliği hakkında bilgi almak istediğinizi öğrendim. Size detaylı bilgi verebilirim. Uygun olduğunuz bir zaman var mı?', ARRAY['name']),
  ('APPOINTMENT_REMINDER', 'Randevu Hatırlatması', 'Merhaba {name}, yarın saat {time} randevumuz var. Görüşmemizi dört gözle bekliyorum. Herhangi bir değişiklik olursa lütfen bana bildirin.', ARRAY['name', 'time']),
  ('FOLLOW_UP', 'Takip Mesajı', 'Merhaba {name}, geçen görüşmemizden sonra düşündünüz mü? Sorularınız varsa çekinmeden sorabilirsiniz.', ARRAY['name'])
ON CONFLICT (code) DO NOTHING;

-- 6. Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_uid, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_owner_uid ON public.leads(owner_uid);
CREATE INDEX IF NOT EXISTS idx_leads_status_id ON public.leads(status_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON public.lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_created_at ON public.lead_events(created_at);