# SPEC.md — Donmuş Spesifikasyon ve Case Bağlamı

Bu dosya, Madlen Growth Intern case'i Step 4 için Utkan'ın onayladığı kararların tek kaynağıdır.
Buradaki maddeler Utkan'ın açık onayı olmadan değiştirilmez.

## Case özeti (5 adım)
1. **Step 1 — Competitive Analysis:** MagicSchool AI + Kunduz analizi (teslim edildi, PDF hazır)
2. **Step 2 — UVP:** İki cümlelik değer önerisi (teslim edildi, PDF hazır)
3. **Step 3 — Strategic Initiative:** "Send to My Teacher" ürün önerisi + objective + metrics (teslim edildi, PDF hazır)
4. **Step 4 — AI Mini Products (BU PROJE):** 3 çalışan ürün + public URL + 1 sayfalık süreç dokümanı
5. **Step 5 — Social Media Post:** Teacher + Student Instagram postları (teslim edildi, PDF hazır)

Step 4 gereksinimleri (case metninden): uçtan uca çalışmalı, public URL'de deploy olmalı (✓ madlen-chatbot.vercel.app),
teknik olmayan bir öğretmen/öğrencinin rahat kullanacağı kadar temiz UI, herhangi bir stack/AI API serbest.

## Uygulama spesifikasyonu (32 kalem — donmuş)

### Genel
1. Tek site, üç ürün içinde (tek deploy, tek link)
2. Açılış: iki büyük kart — Teacher / Student
3. Student → doğrudan chatbot
4. Teacher → ikinci seçim: Lesson Prep Assistant / Essay Grader
5. Sol üstte logo → her yerden ana ekrana dönüş
6. Dil: varsayılan EN, sağ üstte TR/EN anahtarı, tüm arayüz çevrilir
7. Her araç ekranı açılışında aktif dilde karşılama: "Hello, how can I help you?" / "Merhaba, nasıl yardımcı olabilirim?" — Quicksand fontuyla

### Görünüm
8. Madlen esintili turuncu-krem palet
9. Quicksand ağırlıklı, yumuşak/yuvarlak karakter
10. Girdi çubuğu: ekranın altında sabit, yuvarlak hatlı, gönder butonu sağda (Madlen tarzı)
11. Sol bar: geçmiş sohbetler (localStorage — hesap sistemi YOK, bilinçli karar)

### Teacher bağlam çubuğu
12. Girdi çubuğu yanında Sınıf (1-12) + Ders seçicileri
13. İki aracı da besler (plan içeriği + puanlama seviyeye göre şekillenir)
14. Opsiyonel; boşken ipucu satırı: "Sınıf ve ders seçersen çıktılar sınıfına özel olur"
15. Seçim localStorage'da kalıcı

### Student Chatbot
16. Kademeli ipucu: 1. yönlendirme → 2. somut ipucu → 3. çözüm yolu; SONUÇ ASLA HAZIR VERİLMEZ
17. Kavram soruları normal açıklanır; ipucu modu yalnızca çözüm isteyen sorularda
18. Seviye seçici → dil tonu ve örnekler ayarlanır
19. Ders dışı konularda nazik geri yönlendirme

### Lesson Prep Assistant
20. Girdi: konu + seviye + süre
21. Çıktı: ders taslağı (hedefler+kavramlar) → 5 slaytlık yapı (başlık+maddeler+görsel önerisi) → 2-3 tartışma sorusu
22. Copy butonu

### Essay Grader
23. Girdi: kompozisyon metni
24. Çıktı: 4 kriter × 10 puan (argument, clarity, structure, language) + metinden alıntılı gerekçeler + öğrenciye şefkatli paylaşım özeti
25. Puan çubukları (SCORES satırı client'ta parse edilir)
26. Bağlam çubuğundaki sınıfa göre seviyeye duyarlı puanlama

### Teknik
27. GitHub (kod) + Vercel (yayın); push → otomatik deploy
28. API anahtarı yalnızca Vercel environment variable kasasında
29. Motor: Google Gemini (ücretsiz katman) — model env'den (şu an gemini-3.6-flash)
30. Onay kuralı: davranış değişikliği Utkan onayı ister

## Süreç dokümanı için not defteri (1 sayfalık teslim dokümanına girecek gerçek olaylar)
- Araçlar: Claude (mimari + kod üretimi + araştırma), Claude Code (canlı düzenleme/deploy döngüsü), Gemini API (ürünlerin motoru), Canva (Step 5 görselleri), Vercel + GitHub (deploy)
- Yaşanan ve çözülen: (1) Google'ın AIza→AQ. anahtar formatı geçişi → kimlik doğrulama query'den header'a taşındı; (2) gemini-2.5-flash sunset → hata mesajındaki yönlendirmeyle gemini-3.6-flash'a geçildi; (3) Lesson Prep format sadakati → sistem talimatı zorunlu iskelete çevrildi
- Bilinçli UI/UX kararları: ipucu-önce chatbot (Kunduz analizindeki çözüm-önce/ipucu-önce ayrımının ürüne çevrilmesi); hesap yerine localStorage (gizlilik + sürtünmesizlik); opsiyonel bağlam çubuğu (zorunlu form sürtünmesi yaratmaz); seviye-duyarlı essay puanlama
- Gerçek öğretmen testi: Utkan'ın annesi-babası (öğretmen) ile yapılacak/yapıldı
