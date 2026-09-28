# Panduan Lengkap Deploy Frontend & Backend ke Hostinger / Vercel

Sistem ini mendukung 2 opsi deploy tanpa error:
1. **Deploy Full ke Hostinger (Frontend React + Backend PHP + Database MySQL)**
2. **Deploy ke Vercel (Frontend React + Serverless API Node.js terhubung ke MySQL Hostinger)**

---

## Solusi Error 405 Method Not Allowed Saat Deploy

Error `API error [405]: Method Not Allowed` sebelumnya terjadi karena:
1. Permintaan API (seperti POST ke `/api/login.php` atau `/api/crud.php`) ter-rewrite oleh web server menjadi request ke file statis `index.html`. Server web (Apache maupun Vercel) menolak metode POST pada file statis HTML dan menghasilkan status HTTP **405 Method Not Allowed**.
2. Sebelumnya terdapat penulisan ulang URL di sisi client yang mengarahkan ke `/api/data/...` yang tidak ada di server PHP.
3. Ketiadaan endpoint `keyval.php` di folder `api/`.

Semua hal di atas **telah diperbaiki secara tuntas**.

---

## Opsi 1: Deploy ke Hostinger (Recommended untuk Satu Domain)

### 1. Build Project
Jalankan di komputer/terminal Anda:
```bash
npm install
npm run build
```
Hasil build akan berada di folder `dist/`. Di dalam folder `dist/` sudah otomatis terdapat file `.htaccess` dan folder `api/`.

### 2. Upload ke File Manager Hostinger
1. Buka **File Manager** Hostinger, masuk ke folder `public_html`.
2. Hapus isi lama `public_html` jika ingin bersih, atau timpa dengan hasil baru.
3. Upload seluruh isi folder `dist/` ke dalam `public_html` (termasuk file `.htaccess`, `index.html`, folder `assets/`, dan folder `api/`).
4. Pastikan file `public_html/api/config.php` memiliki konfigurasi database yang sesuai:
   - `$host = "localhost";`
   - `$db_name = "u988740981_datamaibsriau";`
   - `$username = "u988740981_maibsriau";`
   - `$password = "MAIBSRiau2026";`

### 3. File .htaccess di Hostinger
Pastikan file `.htaccess` di dalam `public_html` berisi aturan proteksi API agar tidak terlempar ke `index.html`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  Options -MultiViews
  
  # Izinkan CORS
  <IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
  </IfModule>

  # Jangan redirect request /api/ ke index.html
  RewriteCond %{REQUEST_URI} ^/api/ [NC]
  RewriteRule ^ - [L]

  # Redirect SPA React ke index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Opsi 2: Deploy ke Vercel

Jika Anda men-deploy repository ini langsung ke Vercel:
- File `vercel.json` dan `api/index.ts` sudah dikonfigurasi.
- Seluruh rute `/api/*` (termasuk `/api/login.php`, `/api/crud.php`, `/api/keyval.php`, dll.) otomatis dieksekusi oleh Serverless Function Node.js yang langsung terkoneksi ke database MySQL Hostinger (`194.59.164.39:3306`).
- Anda tidak akan lagi mengalami error 405 saat login atau menyimpan data di Vercel.
