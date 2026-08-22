# CLAUDE.md — Madlen Chatbot

## Proje nedir
Madlen Growth Intern case study'sinin Step 4 teslimi: üç AI mini-ürün tek sitede.
- **Student Chatbot** (ipucu-önce çalışma asistanı)
- **Lesson Prep Assistant** (öğretmen ders planı)
- **Essay Grader** (kompozisyon değerlendirme)

Canlı adres: **https://madlen-chatbot.vercel.app** — teslim edilen link bu, bozulmamalı.
Teslim sahibi: Utkan Uluçoban. Case bağlamı ve donmuş spesifikasyon: `docs/SPEC.md` (özellik kararlarının tek kaynağı).

## Mimari (kısa)
- Next.js 14 App Router. Tek sayfa client app: `app/page.js` (tüm arayüz + i18n + localStorage geçmişi). Stil: `app/globals.css` (krem-turuncu Madlen paleti, Quicksand fontu).
- API köprüsü: `app/api/chat/route.js` → Google Gemini `generateContent`.
  - Model: `GEMINI_MODEL` env değişkeninden okunur (şu an **gemini-3.6-flash**; varsayılan koddaki değer eski kalabilir, env kazanır).
  - Anahtar: `GEMINI_API_KEY` env değişkeni, **`x-goog-api-key` header** ile gönderilir (yeni `AQ.` formatlı anahtarlar query paramla sorun çıkarabiliyor — header yolu doğrulandı).
- Üç ürünün davranışı `route.js` içindeki `systemPrompt()` fonksiyonundaki sistem talimatlarında tanımlı. Chatbot'un ipucu merdiveni (1. yönlendirme → 2. somut ipucu → 3. çözüm yolu, sonuç asla verilmez) bu projenin kalbidir — değiştirilmeden önce mutlaka Utkan'a sorulur.

## Deploy akışı — ÖNEMLİ
- `main` dalına **push = otomatik Vercel deploy** (~1 dk). Vercel CLI'a, elle deploy'a gerek YOK.
- Utkan test için sadece tarayıcıda hard refresh yapar.
- Environment değişkenleri (GEMINI_API_KEY, GEMINI_MODEL) yalnızca Vercel panelinde durur — koda, bu dosyaya, commit'lere ASLA yazılmaz.

## Çalışma kuralları
1. **Onay kuralı:** Davranış/özellik değiştiren işlerde önce ne yapacağını 1-2 cümleyle söyle, Utkan onaylasın; yazım/stil/küçük hata düzeltmelerini doğrudan yap ve özetle.
2. **Her tamamlanan iş sonunda:** anlamlı mesajla commit + `git push origin main`. Push'u unutma — push olmadan Utkan değişikliği göremez.
3. Tek seferde tek konu; büyük refactor yapma. Site canlı ve bu akşam teslim ediliyor — çalışan şeyi bozmamak her şeyden önemli.
4. Utkan'la **Türkçe** konuş; kod/commit mesajları İngilizce kalabilir.
5. `docs/SPEC.md` ile çelişen bir istek gelirse çelişkiyi belirtip sor.
6. **Kota kuralı:** Gemini ücretsiz katmanı sınırlı. Her kod değişikliğinden sonra canlı `/api/chat`'e test isteği ATMA — kotayı Utkan'ın kendi denemeleri için sakla. Doğrulama, kod okuma ve (gerekirse) API'ye dokunmayan tarayıcı kontrolüyle yapılır; canlı istek gerekiyorsa önce Utkan'a sorulur. Kota dolarsa `/api/chat` 429 döner ve site kullanıcıya hata gösterir.

## Bilinen geçmiş sorunlar (tekrar yaşanırsa)
- Google API anahtarları artık `AQ.` ile başlıyor (Haziran 2026 geçişi) — header yöntemi kullanılıyor, sorun çözüldü.
- `gemini-2.5-flash` yeni kullanıcılara kapatıldı → `GEMINI_MODEL=gemini-3.6-flash` env ile aşıldı. Benzer 404 gelirse hata mesajındaki önerilen model adına env'den geçilir.
- Hata ayıklama: `/api/chat` yanıtındaki `detail` alanı Gemini'nin ham hatasını taşır (F12 → Network → chat → Response).
- **Düşünme tokenları `maxOutputTokens` bütçesinden yiyor** (22 Ağu 2026): Türkçe ders planları 4. slaytın ortasında kesiliyordu — `thoughtsTokenCount` ~1970, cevap ~860, eski 2048 sınırı Türkçe'de aşılıyordu (İngilizce kıl payı sığdığı için fark edilmemişti). Lesson modunda sınır 8192'ye çıkarıldı. Başka bir mod kesilirse önce `finishReason`/`usage` alanlarına bakılır — bu alanlar teşhis için yanıtta bırakıldı.

## Açık işler (güncel tut)
- [x] Lesson Prep: sertleştirilmiş iskelet formatının testi — TR+EN doğrulandı (22 Ağu 2026): 5 tam slayt, her slaytta görsel önerisi, 3 numaralı tartışma sorusu. Çıktı artık düz metin değil, slayt kartları olarak render ediliyor (`parseLesson`, beklenmedik biçimde düz metne düşer).
- [ ] Lesson Prep: TR'de Akış satırındaki `Opening / Main activity / Closing` etiketleri İngilizce kalıyor (model iskeleti birebir taşıyor) — sistem talimatında etiketlerin de çevrilmesi istenebilir
- [ ] Chatbot: ipucu merdiveni 3 kademe testi + kavram/alıştırma ayrımı + ders dışı sınır
- [ ] Essay Grader: SCORES satırı → 4 puan çubuğu render + seviye kalibrasyonu testi
- [ ] TR/EN anahtarı tam tur + mobil görünüm kontrolü (Lesson Prep slayt görünümü mobilde kontrol edildi ✓, diğer ekranlar kaldı)
- [ ] Gerçek öğretmen testi (Utkan'ın annesi/babası)
- [ ] Dil değişiminde çıktının çevrilmesi (`translate` modu) — yayında ama canlı doğrulanmadı, kota nedeniyle testi Utkan yapacak
- [ ] Slaytlara gerçek görsel: ücretsiz katmanda görsel üretim kotası **sıfır** (4 model denendi, hepsi `429 limit: 0`). Çözüm ya Google'da faturalandırma ya da Wikimedia'dan telifsiz görsel. Utkan'ın kararı bekleniyor — şimdilik görsel önerisi yazı olarak kalıyor.
