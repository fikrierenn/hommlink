-- Auth durumunu debug et

-- 1. Auth.users tablosunu kontrol et
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'fikrieren@gmail.com' OR id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- 2. Public.users tablosunu kontrol et  
SELECT 
  id,
  auth_uid,
  full_name,
  role,
  created_at
FROM public.users 
WHERE auth_uid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' OR full_name LIKE '%Fikri%';

-- 3. Eğer auth'da yoksa ama public'te varsa, auth'a ekle
DO $$
BEGIN
  -- Auth'da yoksa ekle
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'authenticated',
      'authenticated',
      'fikrieren@gmail.com',
      crypt('fe9610578+*', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Fikri Eren"}',
      false,
      now(),
      now()
    );
    RAISE NOTICE 'Auth kullanıcısı oluşturuldu';
  ELSE
    RAISE NOTICE 'Auth kullanıcısı zaten mevcut';
  END IF;
END $$;

-- 4. Final kontrol
SELECT 
  'Durum kontrolü:' as info,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  pu.full_name,
  pu.role
FROM auth.users au
JOIN public.users pu ON au.id = pu.auth_uid
WHERE au.email = 'fikrieren@gmail.com';