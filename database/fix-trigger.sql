-- Trigger sistemini kontrol et ve düzelt

-- 1. Mevcut trigger'ları kontrol et
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%user%' OR event_object_table = 'users';

-- 2. Mevcut fonksiyonu kontrol et
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%handle_new_user%';

-- 3. Trigger'ı sil ve yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Fonksiyonu yeniden oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    auth_uid,
    full_name,
    role,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'agent',
    now()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Hata durumunda log'la ama işlemi durdurma
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. Trigger'ı yeniden oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Trigger'ın çalışıp çalışmadığını test et
SELECT 
  'Trigger yeniden oluşturuldu!' as message,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. Test için geçici kullanıcı oluştur ve hemen sil
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  -- Test kullanıcısı ekle
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    test_user_id,
    'authenticated',
    'authenticated',
    'test@trigger.com',
    crypt('test123', gen_salt('bf')),
    now(),
    '{"full_name": "Test User"}',
    now(),
    now()
  );
  
  -- Trigger çalıştı mı kontrol et
  IF EXISTS (SELECT 1 FROM public.users WHERE auth_uid = test_user_id) THEN
    RAISE NOTICE 'Trigger çalışıyor! ✅';
  ELSE
    RAISE NOTICE 'Trigger çalışmıyor! ❌';
  END IF;
  
  -- Test verilerini temizle
  DELETE FROM public.users WHERE auth_uid = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
  
END $$;