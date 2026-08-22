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

## Bilinen geçmiş sorunlar (tekrar yaşanırsa)
- Google API anahtarları artık `AQ.` ile başlıyor (Haziran 2026 geçişi) — header yöntemi kullanılıyor, sorun çözüldü.
- `gemini-2.5-flash` yeni kullanıcılara kapatıldı → `GEMINI_MODEL=gemini-3.6-flash` env ile aşıldı. Benzer 404 gelirse hata mesajındaki önerilen model adına env'den geçilir.
- Hata ayıklama: `/api/chat` yanıtındaki `detail` alanı Gemini'nin ham hatasını taşır (F12 → Network → chat → Response).

## Açık işler (güncel tut)
- [ ] Lesson Prep: sertleştirilmiş iskelet formatının testi (5 tam slayt + Visual suggestion + numaralı Discussion Questions)
- [ ] Chatbot: ipucu merdiveni 3 kademe testi + kavram/alıştırma ayrımı + ders dışı sınır
- [ ] Essay Grader: SCORES satırı → 4 puan çubuğu render + seviye kalibrasyonu testi
- [ ] TR/EN anahtarı tam tur + mobil görünüm kontrolü
- [ ] Gerçek öğretmen testi (Utkan'ın annesi/babası)
