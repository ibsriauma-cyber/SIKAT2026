# SIM Madrasah Terintegrasi MAS Al-Ihsan

Sistem Informasi Manajemen Madrasah Terintegrasi untuk MAS Al-Ihsan IBS Riau.
Aplikasi ini dibangun menggunakan React (Frontend) dan PHP MySQL (Backend).

## Struktur Arsitektur
1. **Frontend (Vercel)**: Aplikasi React SPA (Single Page Application).
2. **Backend (Hostinger)**: REST API menggunakan PHP murni (PDO).
3. **Database (Hostinger)**: MySQL Database.

---

## Panduan Deployment

### 1. Deployment Database (Hostinger)
1. Login ke panel **Hostinger**.
2. Masuk ke menu **Databases -> MySQL Databases**.
3. Buat database baru (misalnya nama database: `u988740981_datamaibsriau`, user: `u988740981_maibsriau`, dan password).
4. Masuk ke **phpMyAdmin**.
5. Import file `database.sql` yang ada di root project ini ke dalam database yang baru dibuat.

### 2. Deployment API Backend (Hostinger)
1. Masuk ke **File Manager** di panel Hostinger.
2. Buka folder `public_html` (folder utama domain Anda).
3. Upload seluruh isi folder `api/` dari project ini ke dalam `public_html/api/` (jadi URL API Anda akan menjadi `https://domainanda.com/api/`).
4. Buka file `public_html/api/config.php` dan pastikan kredensial database sudah sesuai:
   ```php
   $host = "localhost";
   $db_name = "u988740981_datamaibsriau";
   $username = "u988740981_maibsriau";
   $password = "MAIBSRiau26";
   ```
5. *(Opsional)* Tes API di browser dengan membuka `https://domainanda.com/api/test_db.php`. Jika berhasil, akan muncul pesan "Koneksi database berhasil!".

### 3. Deployment Frontend (Vercel)
1. Upload/Push source code React ini ke **GitHub**.
2. Login ke [Vercel](https://vercel.com/) dan buat project baru (Import dari GitHub).
3. Pada halaman **Configure Project**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Di bagian **Environment Variables**, tambahkan:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://domainanda.com` (ganti dengan URL domain Hostinger Anda, tanpa `/api` di akhir)
5. Klik **Deploy** dan tunggu proses selesai.

---

## Catatan Penting
- **CORS**: File `api/config.php` sudah disetting `Access-Control-Allow-Origin: *` agar API bisa diakses dari domain Vercel.
- **Routing Vercel**: File `vercel.json` memastikan semua request rute SPA diarahkan ke `index.html`.
- **Admin Default**:
  - Username: `admin`
  - Password: `admin`

Semoga sukses mendeploy aplikasi SIM Madrasah MAS Al-Ihsan!
