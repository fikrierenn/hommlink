-- Schema sorunlarını düzelt

-- 1. Önce tüm RLS policy'lerini sil (sonsuz döngü sorunu)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Agents can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

-- 2. Users tablosuna email kolonu ekle (eksik olan)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;

-- 3. Users tablosunu kontrol et
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Basit RLS policy'leri yeniden oluştur (döngü olmadan)
CREATE POLICY "Enable read access for authenticated users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on auth_uid" ON public.users
  FOR UPDATE USING (auth.uid() = auth_uid);

-- 5. Leads için basit policy'ler
CREATE POLICY "Enable read access for authenticated users" ON public.leads
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = owner_uid);

-- 6. Status definitions için basit policy
CREATE POLICY "Enable read access for authenticated users" ON public.status_definitions
  FOR SELECT USING (auth.role() = 'authenticated');

-- 7. WhatsApp templates için basit policy
CREATE POLICY "Enable read access for authenticated users" ON public.whatsapp_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- 8. Lead events için basit policy
CREATE POLICY "Enable read access for authenticated users" ON public.lead_events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.lead_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. Trigger fonksiyonunu güncelle (email kolonu ile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    auth_uid,
    full_name,
    email,
    role,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'agent',
    now()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

SELECT 'Schema sorunları düzeltildi!' as message;