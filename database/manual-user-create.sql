-- Manuel kullanıcı oluşturma scripti
-- Supabase Auth sistemi çalışmıyorsa manuel oluşturma

-- 1. Önce auth.users tablosuna manuel kullanıcı ekle
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'authenticated',
  'authenticated',
  'fikrieren@gmail.com',
  crypt('fe9610578+*', gen_salt('bf')),
  now(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Fikri Eren"}',
  false,
  now(),
  now(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
);

-- 2. Public users tablosuna profil ekle
INSERT INTO public.users (
  id,
  auth_uid,
  full_name,
  role,
  created_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Fikri Eren',
  'agent',
  now()
);

-- 3. Kontrol et
SELECT 
  'Manuel kullanıcı oluşturuldu!' as message,
  au.email,
  au.email_confirmed_at,
  pu.full_name,
  pu.role
FROM auth.users au
JOIN public.users pu ON au.id = pu.auth_uid
WHERE au.email = 'fikrieren@gmail.com';