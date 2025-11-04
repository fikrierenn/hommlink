-- Kullanıcı profili debug scripti
-- Neden user profile yüklenemiyor kontrol edelim

-- 1. Auth.users tablosundaki kullanıcıyı kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'fikrieren@gmail.com';

-- 2. Public.users tablosundaki profili kontrol et
SELECT * FROM public.users;

-- 3. Specific user'ı kontrol et
SELECT 
  u.*,
  au.email
FROM public.users u
LEFT JOIN auth.users au ON u.auth_uid = au.id
WHERE au.email = 'fikrieren@gmail.com';

-- 4. RLS policy'lerini kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 5. Eğer user yoksa, auth'dan otomatik oluştur
INSERT INTO public.users (auth_uid, full_name, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Fikri Eren'),
  'agent'
FROM auth.users au
WHERE au.email = 'fikrieren@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu 
    WHERE pu.auth_uid = au.id
  );

-- 6. Son kontrol
SELECT 
  'User profile kontrol edildi ve gerekirse oluşturuldu' as message,
  COUNT(*) as user_count
FROM public.users u
JOIN auth.users au ON u.auth_uid = au.id
WHERE au.email = 'fikrieren@gmail.com';