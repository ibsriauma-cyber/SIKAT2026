# Panduan Lengkap Deploy Frontend & Backend ke Hostinger

Jika Anda ingin domain utama Anda (misal `https://domainanda.com`) langsung membuka aplikasi tanpa menggunakan Vercel, Anda dapat meng-hosting Frontend React dan Backend PHP Anda secara bersamaan di Hostinger.

## 1. Persiapan Backend API (Sudah Anda Lakukan)
- Pastikan database sudah di-import ke MySQL Hostinger.
- Pastikan folder `api/` (dari source code ini) sudah di-upload ke dalam folder `public_html/api/` di Hostinger.
- Pastikan file `public_html/api/config.php` sudah diubah kredensial databasenya sesuai dengan database Hostinger Anda.

## 2. Build Frontend React
Karena aplikasi frontend dibangun menggunakan React + Vite, Anda harus melakukan "build" terlebih dahulu untuk menjadikannya file statis (HTML, CSS, JS) yang dapat dibaca oleh server Hostinger.

1. Buka terminal/command prompt di komputer Anda tempat project ini berada.
2. Pastikan tidak ada konfigurasi `.env` `VITE_API_URL` yang diset ke localhost (karena jika dalam 1 domain, aplikasi otomatis akan mencari `/api`).
3. Jalankan perintah:
   ```bash
   npm install
   npm run build
   ```
4. Setelah proses selesai, akan muncul folder baru bernama `dist` di dalam folder project Anda.

## 3. Upload Frontend ke Hostinger
1. Login ke panel Hostinger Anda dan buka **File Manager**.
2. Masuk ke folder `public_html`. (Ingat, di dalamnya saat ini sudah ada folder `api` milik backend).
3. Buka folder `dist` yang ada di komputer Anda (hasil dari proses build).
4. **Pilih semua file dan folder di dalam folder `dist` (termasuk `index.html`, folder `assets`, dll) lalu jadikan bentuk ZIP.**
5. Upload file ZIP tersebut ke folder `public_html` di Hostinger.
6. Extract file ZIP tersebut tepat di dalam folder `public_html`.

*(Struktur folder `public_html` Anda nantinya kurang lebih akan berisi: `index.html`, folder `assets`, dan folder `api`)*

## 4. Konfigurasi Routing React (.htaccess)
Karena React menggunakan Single Page Application (SPA), jika ada pengguna yang langsung mengakses rute seperti `https://domainanda.com/admin/users`, server Apache Hostinger akan mencari folder tersebut dan mengembalikan error **404 Not Found**. Kita harus mengarahkan semua rute kembali ke `index.html`.

1. Di dalam File Manager Hostinger (`public_html`), buat sebuah file baru bernama `.htaccess` (jika sudah ada, cukup edit).
2. Isi file `.htaccess` dengan kode berikut:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  
  # Jangan ganggu folder api backend kita
  RewriteCond %{REQUEST_URI} !^/api/
  
  RewriteRule . /index.html [L]
</IfModule>
```
3. Simpan file `.htaccess` tersebut.

**Selesai!** Sekarang jika Anda mengakses `https://domainanda.com`, aplikasi frontend Anda akan tampil sepenuhnya dari Hostinger tanpa menggunakan domain `.vercel.app` lagi, dan otomatis tersambung ke `https://domainanda.com/api/` untuk backendnya.
