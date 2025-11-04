-- Kullanıcı profili düzeltme scripti
-- Auth'da kayıtlı ama public.users'da olmayan kullanıcılar için

-- 1. Önce auth.users tablosundaki kullanıcıları kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
WHERE email = 'fikrieren@gmail.com';

-- 2. Public.users tablosunu kontrol et
SELECT * FROM public.users WHERE full_name LIKE '%Fikri%' OR full_name LIKE '%fikrieren%';

-- 3. Eğer auth'da var ama public'te yoksa, manuel olarak ekle
-- (Önce yukarıdaki sorguları çalıştır ve auth_uid'yi al)

-- Bu kısmı auth.users'dan aldığın gerçek ID ile değiştir:
INSERT INTO public.users (
  auth_uid,
  full_name,
  role,
  created_at
) 
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Fikri Eren'),
  'agent',
  now()
FROM auth.users au
WHERE au.email = 'fikrieren@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu 
    WHERE pu.auth_uid = au.id
  );

-- 4. Kontrol et
SELECT 
  u.id,
  u.auth_uid,
  u.full_name,
  u.role,
  au.email
FROM public.users u
JOIN auth.users au ON u.auth_uid = au.id
WHERE au.email = 'fikrieren@gmail.com';

-- 5. Trigger fonksiyonunu yeniden oluştur (eğer çalışmıyorsa)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_uid, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Kullanıcı profili düzeltildi ve trigger yeniden oluşturuldu!' as message;