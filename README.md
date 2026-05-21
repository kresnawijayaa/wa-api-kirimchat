# WhatsApp Verification MVP

MVP verifikasi nomor WhatsApp tanpa mengirim OTP dari sistem. Sistem membuat token, user membuka link `wa.me`, lalu user mengirim pesan verifikasi ke nomor bot. Backend menerima webhook KirimChat dan memvalidasi token serta nomor pengirim.

## Struktur

```txt
whatsapp-verification-mvp/
├── backend/
├── frontend/
├── docker-compose.yml
├── docker-compose.prod.yml
├── caddy-wa-verification.example
└── README.md
```

## Local Development

Backend env:

```bash
cd backend
copy .env.example .env
```

Isi `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/wa_verification"
FRONTEND_URL="http://localhost:3000"
WHATSAPP_BOT_NUMBER="628xxxxxxxxxx"
ADMIN_SECRET="dev-admin-secret"
KIRIM_CHAT_WEBHOOK_SECRET="dev-webhook-secret"
PORT=4000
```

Frontend env:

```bash
cd frontend
copy .env.example .env
```

Isi `frontend/.env`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Jalankan PostgreSQL lokal via Docker:

```bash
docker compose up -d postgres
```

Jalankan backend:

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

Jalankan frontend:

```bash
cd frontend
npm install
npm run dev
```

Buka:

```txt
http://localhost:3000
```

## Production VPS

Target VPS:

```txt
~/apps/
├── caddy/
├── portfolio-app/
├── keuangan-app/
└── whatsapp-verification-mvp/
```

Subdomain yang dipakai:

```txt
wa.kresnawijaya.web.id      -> frontend
wa-api.kresnawijaya.web.id  -> backend API dan webhook
```

DNS:

```txt
wa.kresnawijaya.web.id      A  <IP_VPS>
wa-api.kresnawijaya.web.id  A  <IP_VPS>
```

### 1. Siapkan Network Caddy

Pastikan Caddy global Anda berada di Docker network bernama `caddy`. Kalau belum ada:

```bash
docker network create caddy
```

Pastikan container Caddy global juga join network `caddy`. Jika Caddy sudah jalan dari compose sendiri, tambahkan network external `caddy` di compose Caddy Anda.

### 2. Pull Project

```bash
cd ~/apps
git clone <repo-anda> whatsapp-verification-mvp
cd whatsapp-verification-mvp
```

### 3. Buat Env Production

Root env untuk compose:

```bash
cp .env.prod.example .env
```

Isi:

```env
POSTGRES_PASSWORD=isi-password-postgres-yang-kuat
NEXT_PUBLIC_API_URL=https://wa-api.kresnawijaya.web.id
```

Backend env:

```bash
cp backend/.env.prod.example backend/.env
```

Isi:

```env
DATABASE_URL="postgresql://postgres:isi-password-postgres-yang-kuat@wa-verification-postgres:5432/wa_verification"
FRONTEND_URL="https://wa.kresnawijaya.web.id"
WHATSAPP_BOT_NUMBER="628xxxxxxxxxx"
ADMIN_SECRET="isi-admin-secret-yang-panjang"
KIRIM_CHAT_WEBHOOK_SECRET="isi-webhook-secret-yang-panjang"
PORT=4000
```

Frontend env:

```bash
cp frontend/.env.prod.example frontend/.env
```

Isi:

```env
NEXT_PUBLIC_API_URL="https://wa-api.kresnawijaya.web.id"
```

### 4. Tambahkan Caddyfile

Tambahkan isi [caddy-wa-verification.example](./caddy-wa-verification.example) ke Caddyfile global Anda.

Jika Caddy container berada di folder `~/apps/caddy`, reload Caddy sesuai setup Anda. Contoh umum:

```bash
cd ~/apps/caddy
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### 5. Deploy App

```bash
cd ~/apps/whatsapp-verification-mvp
docker compose -f docker-compose.prod.yml up -d --build
```

Lihat log:

```bash
docker compose -f docker-compose.prod.yml logs -f wa-verification-backend
```

Health check manual:

```bash
curl https://wa-api.kresnawijaya.web.id/verification/not-found/status
```

Response `404` dari API sudah cukup membuktikan reverse proxy masuk ke backend.

## KirimChat Webhook

Arahkan incoming message webhook KirimChat ke:

```txt
POST https://wa-api.kresnawijaya.web.id/webhook/kirim-chat
```

Jika `KIRIM_CHAT_WEBHOOK_SECRET` diisi, KirimChat harus mengirim header:

```txt
x-webhook-secret: isi-webhook-secret-yang-panjang
```

Payload minimal yang diterima:

```json
{
  "message_id": "abc123",
  "from": "6281234567890",
  "text": "Verifikasi Akun - Mohon tidak mengubah isi teks verifikasi ini.\n\nTgl/Jam : 21052026 - 14:30\nKode Verifikasi : TOKEN_DARI_MESSAGE\n\nPastikan nomor WhatsApp ini sama dengan nomor yang kamu gunakan untuk registrasi.\nKirim teks ini tanpa mengubah isi untuk melakukan verifikasi, lalu silakan kembali ke website."
}
```

Test webhook:

```bash
curl -X POST https://wa-api.kresnawijaya.web.id/webhook/kirim-chat \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: isi-webhook-secret-yang-panjang" \
  -d '{
    "message_id": "test-123",
    "from": "6281234567890",
    "text": "Verifikasi Akun - Mohon tidak mengubah isi teks verifikasi ini.\n\nTgl/Jam : 21052026 - 14:30\nKode Verifikasi : TOKEN_DARI_MESSAGE\n\nPastikan nomor WhatsApp ini sama dengan nomor yang kamu gunakan untuk registrasi.\nKirim teks ini tanpa mengubah isi untuk melakukan verifikasi, lalu silakan kembali ke website."
  }'
```

Webhook selalu return:

```json
{
  "ok": true
}
```

Pesan invalid tetap return 200 agar provider tidak retry terus. Reason invalid ditulis ke log backend.

## API

Create request:

```http
POST /verification/request
```

Status request:

```http
GET /verification/:id/status
```

Admin list:

```http
GET /admin/verifications
x-admin-secret: <ADMIN_SECRET>
```

## Flow Verifikasi

1. User input nomor WhatsApp.
2. Backend normalize nomor Indonesia dan membuat token random 32 bytes.
3. Backend menyimpan SHA-256 hash token, bukan token asli.
4. Frontend menampilkan tombol `Kirim Verifikasi via WhatsApp`.
5. Tombol membuka `https://wa.me/<WHATSAPP_BOT_NUMBER>?text=<PESAN_VERIFIKASI>`.
6. User mengirim pesan tanpa mengubah isi.
7. KirimChat mengirim incoming message ke webhook backend.
8. Backend parse token dari `Kode Verifikasi : <TOKEN>`.
9. Backend hash token, cocokkan nomor pengirim, status `PENDING`, dan expiry.
10. Jika valid, status berubah menjadi `VERIFIED`.
11. Frontend polling setiap 3 detik sampai status berubah.

## Security MVP

- Rate limit per nomor: maksimal 5 request per 1 jam.
- Token asli tidak disimpan di database.
- Database hanya menyimpan SHA-256 hash token dan token preview.
- CORS hanya mengizinkan `FRONTEND_URL`.
- Admin API dilindungi `x-admin-secret`.
- Webhook dapat dilindungi `x-webhook-secret`.
- PostgreSQL production tidak dipublish ke host publik.
- Tidak ada Redis, pembayaran, multi-tenant, atau login kompleks di MVP ini.
