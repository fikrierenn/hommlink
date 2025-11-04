-- Add WhatsApp templates with emojis for testing

INSERT INTO public.whatsapp_templates (code, name, message, variables) VALUES
  ('EMOJI_TEST', 'Emoji Test', 'Merhaba {{ad}}! 🌞 Homm Bitkisel ile hayallerinizi gerçekleştirme zamanı geldi! 🚀💚 Başlamaya hazır mısınız?', ARRAY['ad']),
  ('DAILY_MOTIVATION', 'Günlük Motivasyon', '{{ad}}, bugün harika bir gün! 🌟 Homm Bitkisel ile doğal ürünlerle hem sağlık hem de finansal özgürlük... 💪✨ Başlamaya hazır mısınız? 🚀', ARRAY['ad']),
  ('PRODUCT_INFO', 'Ürün Bilgisi', 'Merhaba {{ad}}! 🌿 Homm Bitkisel ürünleri hakkında bilgi almak istediğinizi öğrendim. Size detaylı bilgi verebilirim. 📞 Uygun olduğunuz bir zaman var mı? ⏰', ARRAY['ad'])
ON CONFLICT (code) DO UPDATE SET
  message = EXCLUDED.message,
  variables = EXCLUDED.variables;