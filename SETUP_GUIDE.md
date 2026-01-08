# 🔐 Setup Guide: Cloudflare Workers untuk Gemini API

Panduan ini menjelaskan cara menyimpan API key dengan aman menggunakan Cloudflare Workers.

---

## 📋 Prerequisites

- Akun Google (untuk API key Gemini)
- Akun Cloudflare (gratis)

---

## Step 1: Dapatkan Gemini API Key

1. Buka [Google AI Studio](https://aistudio.google.com/apikey)
2. Klik **"Create API Key"**
3. Pilih project atau buat baru
4. **Copy API key** (simpan sementara di notepad, jangan share!)

---

## Step 2: Buat Akun Cloudflare

1. Buka [Cloudflare Workers](https://workers.cloudflare.com/)
2. Klik **"Sign Up"** dan buat akun gratis
3. Verifikasi email

---

## Step 3: Buat Worker Baru

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Di sidebar, klik **"Workers & Pages"**
3. Klik **"Create application"** → **"Create Worker"**
4. Beri nama worker (contoh: `gemini-proxy`)
5. Klik **"Deploy"**

---

## Step 4: Paste Kode Worker

1. Setelah deploy, klik **"Edit code"**
2. **Hapus semua kode** yang ada
3. Buka file: `cloudflare-worker/gemini-proxy-worker.js`
4. **Copy seluruh isinya** dan paste ke editor Cloudflare
5. Klik **"Save and deploy"**

---

## Step 5: Tambahkan API Key sebagai Environment Variable

1. Kembali ke halaman Worker
2. Klik tab **"Settings"** → **"Variables"**
3. Di bagian **"Environment Variables"**, klik **"Add variable"**
4. Isi:
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: (paste API key kamu)
5. Klik **"Encrypt"** (opsional tapi recommended)
6. Klik **"Save and deploy"**

---

## Step 6: Dapatkan Worker URL

1. Kembali ke halaman overview Worker
2. Copy URL worker kamu, formatnya seperti:
   ```
   https://gemini-proxy.YOUR_SUBDOMAIN.workers.dev
   ```

---

## Step 7: Update config.js

1. Buka file `config.js` di project
2. Ganti placeholder dengan URL Worker kamu:
   ```javascript
   const geminiConfig = {
       workerUrl: "https://gemini-proxy.YOUR_SUBDOMAIN.workers.dev",
       model: "gemini-2.0-flash"
   };
   ```
3. Save dan commit ke GitHub

---

## ✅ Selesai!

Sekarang:
- ✅ API key tersimpan aman di Cloudflare (tidak ada di GitHub)
- ✅ GitHub tidak akan block repository
- ✅ End user tidak perlu tahu apa-apa tentang API key

---

## 🧪 Testing

1. Buka app di browser
2. Coba generate AI Exegesis atau Quiz
3. Jika berhasil, berarti setup sudah benar!

---

## ❓ Troubleshooting

### Error: "API key not configured"
→ Pastikan environment variable `GEMINI_API_KEY` sudah ditambahkan di Cloudflare

### Error: "Failed to connect"
→ Pastikan Worker URL di `config.js` sudah benar

### CORS Error
→ Worker sudah include CORS headers, tapi pastikan browser tidak block

---

## 📊 Monitoring

- Cloudflare Workers free tier: **100,000 requests/hari**
- Lihat usage di dashboard: Workers & Pages → Analytics
