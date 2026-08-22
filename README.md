# Madlen Chatbot

AI mini-products for the Madlen Growth Intern case study: a hint-first student chatbot, a lesson prep assistant, and an essay grader — in one app (EN/TR).

Built with Next.js + Google Gemini API. Deployed on Vercel.

## Kurulum (Türkçe hızlı rehber)

1. Bu klasördeki tüm dosyaları GitHub'da yeni bir repository'ye yükle.
2. vercel.com → Add New → Project → bu repo'yu Import et.
3. Import ekranında **Environment Variables** bölümüne şunu ekle:
   - Name: `GEMINI_API_KEY`
   - Value: (aistudio.google.com'dan aldığın AIza... anahtarı)
4. Deploy'a bas. 1-2 dakika içinde site linkin hazır.

Not: Anahtar sadece Vercel'de durur; koda ve GitHub'a asla yazılmaz.

## Yerelde çalıştırma (opsiyonel)

```bash
npm install
GEMINI_API_KEY=xxxx npm run dev
```
