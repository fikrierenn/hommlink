-- Temiz başlangıç - kullanıcıyı sil ve yeniden oluştur

-- 1. Mevcut kullanıcıyı tamamen sil
DELETE FROM public.users WHERE auth_uid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
DELETE FROM auth.users WHERE email = 'fikrieren@gmail.com';

-- 2. Kontrol et - temizlenmiş mi?
SELECT 
  'Kullanıcı silindi, şimdi register sayfasından yeniden kayıt olun!' as message,
  (SELECT count(*) FROM auth.users WHERE email = 'fikrieren@gmail.com') as auth_count,
  (SELECT count(*) FROM public.users WHERE full_name = 'Fikri Eren') as public_count;