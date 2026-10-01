# Product Requirements Document (PRD)
# Aplikasi Hibah Bidang Peternakan

**Versi Dokumen:** 1.0
**Status:** Draft
**Tanggal:** 14 September 2026
**Target Lingkungan:** On-Premise / Local Server (Docker & CasaOS)

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Deskripsi Produk](#2-deskripsi-produk)
3. [Arsitektur Teknologi (Tech Stack)](#3-arsitektur-teknologi-tech-stack)
4. [Peran Pengguna dan Hak Akses](#4-peran-pengguna-dan-hak-akses-role--permission)
5. [Kebutuhan Fungsional](#5-kebutuhan-fungsional-functional-requirements)
6. [Kebutuhan Non-Fungsional](#6-kebutuhan-non-fungsional-non-functional-requirements)
7. [Model Data](#7-model-data-konsep-basis-data)
8. [Kebutuhan Antarmuka (UI/UX)](#8-kebutuhan-antarmuka-uiux)
9. [Rencana Deployment](#9-rencana-deployment)
10. [Kriteria Penerimaan (Acceptance Criteria)](#10-kriteria-penerimaan-acceptance-criteria)
11. [Risiko dan Mitigasi](#11-risiko-dan-mitigasi)
12. [Pengembangan Lanjutan](#12-pengembangan-lanjutan-out-of-scope-v1--future-enhancement)

---

## 1. Pendahuluan

### 1.1 Latar Belakang

Proses pengelolaan data penerima hibah pada bidang peternakan saat ini umumnya masih dilakukan secara manual atau menggunakan berkas terpisah (spreadsheet/dokumen fisik), sehingga menyulitkan proses pencarian, rekapitulasi, dan pelaporan data secara cepat dan akurat. Selain itu, kebutuhan format data hibah yang dapat berubah dari waktu ke waktu (menyesuaikan kebijakan atau jenis program hibah) memerlukan sistem yang fleksibel dalam mendefinisikan struktur data tanpa harus melakukan perubahan pada kode program.

Untuk menjawab kebutuhan tersebut, dibutuhkan sebuah aplikasi berbasis web yang mampu mengelola data hibah bidang peternakan secara terpusat, aman, cepat diakses, serta dapat dikustomisasi struktur datanya (dynamic form field) oleh pengguna dengan hak akses tertentu (Superadmin), tanpa memerlukan keterlibatan tim pengembang setiap kali terjadi perubahan kebutuhan data.

### 1.2 Tujuan

- Menyediakan sistem terpusat untuk pencatatan, pengelolaan, dan pemantauan data hibah bidang peternakan.
- Memungkinkan struktur/format data (field) pada database hibah dikustomisasi secara dinamis oleh Superadmin tanpa mengubah kode aplikasi.
- Menyediakan dashboard ringkasan (summary) untuk mendukung pengambilan keputusan secara cepat.
- Menjamin data selalu tersinkronisasi secara realtime dengan basis data server.
- Menyediakan pengelolaan pengguna dan hak akses (role-based access control) yang jelas antara Superadmin dan User.
- Menghasilkan aplikasi yang ringan, responsif, dan dapat di-deploy secara mandiri pada infrastruktur lokal (on-premise) menggunakan Docker di atas CasaOS.

### 1.3 Ruang Lingkup

**Termasuk dalam versi awal (V1):**

- Landing page publik sebagai halaman muka aplikasi.
- Halaman login untuk autentikasi pengguna (Superadmin dan User).
- Dashboard ringkasan data hibah.
- Modul Database Hibah (`DB_Hibah`) sebagai basis data utama data penerima/pengajuan hibah.
- Modul Config Field (`DB_Field`) khusus Superadmin untuk mengelola struktur/kolom form yang akan tampil sebagai header pada modul Database Hibah.
- Menu Pengaturan (bahasa, tema tampilan, dan manajemen pengguna).
- Mekanisme role-based access control — menu khusus Superadmin **disembunyikan (hidden)** pada akun dengan role User.
- Performa aplikasi yang ditingkatkan melalui mekanisme caching (Redis/Memcached) dan sinkronisasi data realtime.

**Di luar ruang lingkup V1 (future enhancement):** integrasi sistem eksternal, export PDF/Excel lanjutan, notifikasi email/WhatsApp, aplikasi mobile native.

### 1.4 Definisi, Istilah, dan Singkatan

| Istilah | Definisi |
|---|---|
| PRD | Product Requirements Document — dokumen kebutuhan produk. |
| Hibah | Bantuan dana/aset yang diberikan kepada penerima pada bidang peternakan. |
| `DB_Hibah` | Database/tabel utama yang menyimpan seluruh data hibah bidang peternakan. |
| `DB_Field` | Database/tabel yang menyimpan konfigurasi struktur field (kolom) dinamis yang digunakan pada `DB_Hibah`. |
| Superadmin | Role tertinggi dengan akses penuh, termasuk konfigurasi field dan manajemen pengguna. |
| User | Role standar dengan akses terbatas sesuai hak yang diberikan, tanpa akses ke menu administratif tertentu. |
| CRUD | Create, Read, Update, Delete — operasi dasar pengelolaan data. |
| Realtime Sync | Mekanisme sinkronisasi data secara langsung/near-instant antara aplikasi dan server basis data ketika terjadi perubahan data. |
| CasaOS | Sistem operasi berbasis Linux untuk home/local server yang mendukung manajemen aplikasi berbasis Docker. |
| Cache (Redis/Memcached) | Mekanisme penyimpanan sementara data agar akses data lebih cepat dan mengurangi beban query ke database. |

---

## 2. Deskripsi Produk

### 2.1 Gambaran Umum

Aplikasi Hibah Bidang Peternakan adalah aplikasi web internal (on-premise) yang digunakan untuk mengelola pencatatan data hibah pada bidang peternakan secara digital. Aplikasi dibangun menggunakan framework **Laravel** dengan basis data **MySQL**, antarmuka menggunakan **Bootstrap**, serta didukung mekanisme caching (**Redis/Memcached**) untuk menjaga performa aplikasi tetap cepat meskipun volume data terus bertambah.

Salah satu keunggulan utama aplikasi ini adalah kemampuan Superadmin untuk mendefinisikan sendiri struktur/kolom data (field) yang akan digunakan pada modul Database Hibah melalui modul Config Field, tanpa memerlukan perubahan kode program. Dengan demikian, aplikasi bersifat fleksibel terhadap perubahan kebutuhan format data hibah di masa mendatang.

### 2.2 Target Pengguna

| Role | Deskripsi Pengguna | Kebutuhan Utama |
|---|---|---|
| Superadmin | Pengelola sistem/administrator utama, biasanya penanggung jawab data hibah pada instansi. | Kontrol penuh atas struktur data, pengguna, dan pengaturan sistem. |
| User | Staf/operator input data yang bertugas mencatat dan mengelola data hibah sehari-hari. | Akses cepat untuk input, lihat, dan kelola data hibah sesuai hak akses yang diberikan. |

### 2.3 Platform dan Lingkungan Deployment

- Aplikasi berbasis web (web application), diakses melalui browser pada jaringan lokal/intranet.
- Dikemas dalam container Docker agar mudah di-deploy dan dikelola.
- Deployment dilakukan pada local server pribadi menggunakan **CasaOS** sebagai platform manajemen container/server rumahan.
- Basis data menggunakan **MySQL** yang berjalan sebagai service/container terpisah, dengan **Redis/Memcached** sebagai layer caching.

### 2.4 Asumsi dan Batasan

- Aplikasi digunakan dalam lingkungan jaringan lokal (LAN); eksposur ke internet publik di luar cakupan awal, namun praktik keamanan dasar tetap diterapkan.
- Jumlah pengguna simultan diperkirakan dalam skala kecil-menengah (instansi/dinas), bukan skala publik masif.
- Backup dan pemulihan data (backup & restore) menjadi tanggung jawab pengelola server lokal, namun aplikasi menyediakan struktur data yang mendukung proses backup.

---

## 3. Arsitektur Teknologi (Tech Stack)

### 3.1 Ringkasan Teknologi

| Layer | Teknologi | Keterangan |
|---|---|---|
| Backend Framework | Laravel (PHP) | Menangani logic aplikasi, routing, autentikasi, dan operasi CRUD. |
| Database | MySQL 8.x | Menyimpan seluruh data master, transaksi hibah, dan konfigurasi field. |
| Caching Layer | Redis / Memcached | Mempercepat akses data yang sering diminta (dashboard summary, konfigurasi field, sesi pengguna). |
| Frontend Styling | Bootstrap + Custom CSS | Tampilan antarmuka responsif dan konsisten, dengan dukungan multi-tema. |
| Realtime Sync | Laravel Broadcasting (Laravel Echo + Redis/WebSocket) atau polling terjadwal | Menjaga tampilan data (dashboard & tabel) tetap sinkron saat terjadi perubahan data. |
| Containerization | Docker (Docker Compose) | Mengemas aplikasi, database, dan cache sebagai layanan-layanan terpisah yang terisolasi. |
| Host Platform | CasaOS (Local/Home Server) | Platform manajemen container pada server lokal pribadi. |

### 3.2 Arsitektur Container (Docker Compose)

Direncanakan berjalan sebagai beberapa service dalam satu Docker network, dikelola melalui CasaOS:

- **app** (Laravel + PHP-FPM/Nginx) — melayani logic aplikasi dan antarmuka web.
- **db** (MySQL) — menyimpan seluruh data aplikasi, termasuk `DB_Hibah` dan `DB_Field`.
- **cache** (Redis/Memcached) — menyimpan cache dan mendukung mekanisme realtime broadcasting.
- **Volume persisten** (Docker Volume) digunakan untuk memastikan data MySQL tidak hilang saat container di-restart/rebuild.

Contoh kerangka `docker-compose.yml` (indikatif, untuk disesuaikan tim dev):

```yaml
services:
  app:
    build: .
    ports:
      - "9100:80"
    environment:
      - DB_HOST=db
      - CACHE_DRIVER=redis
      - REDIS_HOST=cache
    depends_on:
      - db
      - cache
    volumes:
      - app_storage:/var/www/html/storage

  db:
    image: mysql:8
    environment:
      - MYSQL_DATABASE=hibah_peternakan
      - MYSQL_ROOT_PASSWORD=changeme
    volumes:
      - db_data:/var/lib/mysql

  cache:
    image: redis:alpine
    volumes:
      - cache_data:/data

volumes:
  app_storage:
  db_data:
  cache_data:
```

### 3.3 Alur Realtime Sinkronisasi Data

Ketika terjadi perubahan data (create/update/delete) pada modul Database Hibah maupun Config Field, aplikasi memicu event yang di-broadcast melalui layer cache/queue (Redis). Klien (browser) yang sedang membuka halaman terkait akan menerima pembaruan tampilan tanpa perlu melakukan refresh manual, sehingga data yang ditampilkan pada dashboard maupun tabel Database Hibah selalu konsisten dengan kondisi terbaru pada server.

---

## 4. Peran Pengguna dan Hak Akses (Role & Permission)

### 4.1 Ketentuan Umum

- Aplikasi bersifat **multi-user** dengan dua peran utama: **Superadmin** dan **User**.
- **WAJIB:** setiap menu atau fitur yang hanya diperuntukkan bagi Superadmin harus disembunyikan (hidden) secara otomatis pada antarmuka pengguna dengan role User — bukan hanya dibatasi pada level akses backend, namun juga tidak ditampilkan pada navigasi/menu.
- Validasi hak akses tetap harus dilakukan pada sisi server (backend/middleware) untuk mencegah akses langsung melalui URL oleh pengguna yang tidak berwenang (defense in depth).

### 4.2 Matriks Hak Akses

| Modul / Fitur | Superadmin | User | Keterangan |
|---|---|---|---|
| Landing Page | ✔ | ✔ | Dapat diakses tanpa login. |
| Login | ✔ | ✔ | Wajib autentikasi untuk masuk ke sistem. |
| Dashboard (Summary) | ✔ | ✔ | Ringkasan data hibah, tampilan dapat disesuaikan hak akses data. |
| Database Hibah — Lihat | ✔ | ✔ | User dapat melihat data sesuai hak akses. |
| Database Hibah — Tambah/Ubah/Hapus | ✔ | ✔ (sesuai hak) | Dapat dibatasi lebih lanjut melalui manajemen user. |
| Config Field (`DB_Field`) | ✔ | ✖ (hidden) | Menu tidak tampil bagi role User. |
| Pengaturan — Bahasa | ✔ | ✔ | Berlaku untuk seluruh pengguna. |
| Pengaturan — Tema Tampilan | ✔ | ✔ | Berlaku untuk seluruh pengguna. |
| Pengaturan — Manajemen User | ✔ | ✖ (hidden) | Menu tidak tampil bagi role User. |

---

## 5. Kebutuhan Fungsional (Functional Requirements)

### 5.1 Landing Page

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Sistem menampilkan landing page yang dapat diakses tanpa autentikasi (publik). | Must Have |
| FR-02 | Landing page menampilkan informasi ringkas mengenai aplikasi/program hibah dan tombol/akses menuju halaman Login. | Must Have |
| FR-03 | Landing page menyesuaikan tema (theme) dan bahasa sesuai preferensi terakhir yang aktif pada browser/sesi. | Should Have |

### 5.2 Halaman Login

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-04 | Sistem menyediakan form login dengan input username/email dan password. | Must Have |
| FR-05 | Sistem melakukan validasi kredensial terhadap data pengguna pada database dan menolak akses jika tidak valid, disertai pesan kesalahan yang jelas. | Must Have |
| FR-06 | Sistem mengarahkan pengguna ke Dashboard sesuai role setelah login berhasil. | Must Have |
| FR-07 | Sistem menyediakan mekanisme logout yang mengakhiri sesi pengguna secara aman. | Must Have |
| FR-08 | Sistem membatasi percobaan login gagal berulang (rate limiting/lockout sementara) untuk mencegah brute force. | Should Have |

### 5.3 Dashboard

Dashboard menjadi halaman utama setelah login, menampilkan ringkasan (summary) data hibah secara visual dan informatif.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-09 | Sistem menampilkan ringkasan jumlah total data pada Database Hibah (`DB_Hibah`). | Must Have |
| FR-10 | Sistem menampilkan ringkasan data berdasarkan kategori/field tertentu yang bersifat dinamis (mis. status, jenis hibah, wilayah) sesuai konfigurasi field yang aktif. | Must Have |
| FR-11 | Sistem menampilkan ringkasan dalam bentuk kartu statistik (summary cards) dan/atau grafik (chart) sederhana. | Should Have |
| FR-12 | Data pada dashboard diperbarui secara realtime/near-realtime mengikuti perubahan data pada `DB_Hibah` tanpa perlu reload manual halaman. | Must Have |
| FR-13 | Data ringkasan dashboard memanfaatkan cache (Redis/Memcached) untuk mempercepat waktu muat halaman. | Must Have |

### 5.4 Modul Database Hibah (`DB_Hibah`)

Modul ini merupakan basis data utama aplikasi, menyimpan seluruh data hibah bidang peternakan. Kolom/header pada tabel modul ini bersifat **dinamis**, mengikuti konfigurasi yang didefinisikan pada modul Config Field (`DB_Field`).

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-14 | Sistem menampilkan data hibah dalam bentuk tabel dengan kolom (header) yang dibentuk secara dinamis sesuai konfigurasi aktif pada `DB_Field`. | Must Have |
| FR-15 | Sistem menyediakan fungsi tambah data (Create) baru, dengan form input yang otomatis terbentuk sesuai tipe field yang dikonfigurasi. | Must Have |
| FR-16 | Sistem menyediakan fungsi lihat detail data (Read) per baris/record data hibah. | Must Have |
| FR-17 | Sistem menyediakan fungsi ubah data (Update) sesuai hak akses pengguna. | Must Have |
| FR-18 | Sistem menyediakan fungsi hapus data (Delete) sesuai hak akses pengguna, disertai konfirmasi sebelum penghapusan. | Must Have |
| FR-19 | Sistem menyediakan fitur pencarian (search) dan penyaringan (filter) data berdasarkan salah satu atau kombinasi field yang tersedia. | Should Have |
| FR-20 | Sistem menyediakan pengurutan (sorting) data berdasarkan kolom tertentu. | Should Have |
| FR-21 | Sistem menyediakan paginasi pada tampilan tabel data untuk menjaga performa saat volume data besar. | Must Have |
| FR-22 | Perubahan data pada `DB_Hibah` tersinkronisasi secara realtime terhadap seluruh sesi pengguna yang sedang membuka modul yang sama. | Must Have |
| FR-23 | Sistem melakukan validasi input sesuai tipe field (mis. format tanggal, format angka) sebelum data disimpan. | Must Have |

### 5.5 Modul Config Field (`DB_Field`) — Khusus Superadmin

Modul ini hanya dapat diakses oleh Superadmin dan digunakan untuk mendefinisikan struktur field/kolom yang akan digunakan sebagai header form dan tabel pada modul Database Hibah. Konfigurasi disimpan pada basis data tersendiri bernama `DB_Field`.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-24 | Sistem membatasi akses modul Config Field hanya untuk role Superadmin; menu ini tersembunyi bagi role User. | Must Have |
| FR-25 | Sistem menyediakan fungsi CRUD (tambah, lihat, ubah, hapus, dan atur urutan) untuk field/kolom pada `DB_Field`. | Must Have |
| FR-26 | Setiap field memiliki atribut minimal: nama field/label, tipe field, status wajib diisi (mandatory/optional), urutan tampil, dan status aktif/nonaktif. | Must Have |
| FR-27 | Sistem menyediakan pilihan tipe field sesuai daftar tipe isian pada bagian 5.5.1. | Must Have |
| FR-28 | Setiap perubahan konfigurasi field (tambah/ubah/hapus/nonaktifkan) secara otomatis memperbarui struktur form input dan header tabel pada modul Database Hibah, secara realtime. | Must Have |
| FR-29 | Sistem menyediakan pratinjau (preview) form sebelum konfigurasi field disimpan/diterapkan. | Should Have |

#### 5.5.1 Daftar Tipe Field dan Perilaku Form

| Tipe Field | Deskripsi | Perilaku Khusus |
|---|---|---|
| `text` | Isian teks singkat satu baris. | Input teks standar (single line). |
| `paragraph` | Isian teks panjang. | Textarea dengan tinggi **5 baris**. |
| `number` | Isian berupa angka. | Validasi hanya menerima input numerik. |
| `date` | Isian tanggal. | Menggunakan komponen date picker. |
| `time` | Isian waktu/jam. | Menggunakan komponen time picker. |
| `checklist` | Isian pilihan berbentuk checkbox dengan opsi yang dapat dikustomisasi. | Saat tipe ini dipilih di Config Field, sistem menampilkan **textarea tambahan (5 baris)** di bawahnya untuk memasukkan daftar opsi checklist, dipisahkan dengan tanda titik koma (`;`). Pada form Database Hibah, opsi ini dirender sebagai beberapa checkbox (multi-select). |
| `list` | Isian pilihan berbentuk dropdown/list dengan opsi yang dapat dikustomisasi. | Saat tipe ini dipilih di Config Field, sistem menampilkan **textarea tambahan (5 baris)** di bawahnya untuk memasukkan daftar opsi list, dipisahkan dengan tanda titik koma (`;`). Pada form Database Hibah, opsi ini dirender sebagai dropdown (single-select). |

> **Contoh:** apabila Superadmin memilih tipe field `checklist` dan mengisi kolom opsi dengan teks `Sapi;Kambing;Domba;Ayam`, maka pada form Database Hibah akan tampil empat pilihan checkbox (Sapi, Kambing, Domba, Ayam) yang dapat dipilih lebih dari satu. Ketentuan yang sama berlaku untuk tipe `list`, namun ditampilkan sebagai dropdown dengan pilihan tunggal.

### 5.6 Menu Pengaturan

Menu Pengaturan diakses melalui ikon roda gigi (gear icon) dan berisi beberapa sub-pengaturan sebagai berikut.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-30 | Sistem menampilkan menu Pengaturan dengan ikon gear yang dapat diakses oleh seluruh pengguna terautentikasi. | Must Have |
| FR-31 | Sistem menyediakan opsi pengaturan bahasa dengan pilihan **Bahasa Indonesia (default)** dan **English**. | Must Have |
| FR-32 | Perubahan bahasa diterapkan pada seluruh antarmuka aplikasi (label menu, tombol, pesan sistem) secara konsisten. | Should Have |
| FR-33 | Sistem menyediakan opsi pengaturan tema tampilan (theme) dengan pilihan: **Light, Dark, Green Pastel, Blue Sky**. | Must Have |
| FR-34 | Preferensi bahasa dan tema tersimpan per pengguna sehingga tetap konsisten pada sesi berikutnya. | Should Have |
| FR-35 | Sistem menyediakan sub-menu **Manajemen User** yang hanya dapat diakses oleh Superadmin, digunakan untuk mengelola akun pengguna (tambah/ubah/hapus/nonaktifkan) beserta penetapan role (Superadmin/User). | Must Have |
| FR-36 | Sub-menu Manajemen User tersembunyi (hidden) dari navigasi bagi pengguna dengan role User. | Must Have |

---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Kebutuhan |
|---|---|
| Performa | Waktu muat halaman dashboard dan Database Hibah harus optimal melalui pemanfaatan caching (Redis/Memcached) untuk data yang sering diakses (summary, konfigurasi field, sesi pengguna). |
| Realtime & Sinkronisasi | Perubahan data (create/update/delete) pada `DB_Hibah` dan `DB_Field` harus tersinkronisasi secara realtime/near-realtime ke seluruh klien yang sedang aktif tanpa memerlukan reload manual. |
| Skalabilitas Data | Struktur data (`DB_Hibah`) harus mampu menampung penambahan/perubahan field secara dinamis tanpa memerlukan perubahan skema database secara manual oleh developer. |
| Keamanan | Autentikasi berbasis session/token, hashing password, validasi hak akses di sisi server (middleware/policy — bukan hanya sisi tampilan), serta proteksi terhadap SQL Injection, XSS, dan CSRF sesuai praktik standar Laravel. |
| Ketersediaan (Availability) | Aplikasi dan seluruh service pendukung (database, cache) berjalan sebagai container dengan restart policy otomatis apabila terjadi kegagalan pada level Docker/CasaOS. |
| Usabilitas (Usability) | Antarmuka menggunakan Bootstrap dengan desain responsif, konsisten, serta mendukung beberapa pilihan tema tanpa mengganggu keterbacaan/kontras. |
| Portabilitas & Deployment | Aplikasi dapat di-deploy ulang dengan mudah menggunakan Docker Compose pada CasaOS, termasuk kemampuan backup dan restore volume data. |
| Pemeliharaan (Maintainability) | Struktur kode mengikuti konvensi Laravel (MVC); konfigurasi field dikelola melalui data (`DB_Field`), bukan hardcode. |
| Kompatibilitas Browser | Dapat diakses dengan baik pada browser modern (Chrome, Edge, Firefox) versi terbaru, baik desktop maupun tablet. |
| Audit Trail (opsional lanjutan) | Sistem dapat mencatat riwayat perubahan data penting (siapa mengubah, kapan, data apa) sebagai bahan pengembangan lanjutan. |

---

## 7. Model Data (Konsep Basis Data)

> Rancangan detail (nama kolom final, index, foreign key) akan disesuaikan lebih lanjut oleh tim pengembang/AI coding assistant pada tahap implementasi.

### 7.1 Tabel: `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | BIGINT (PK) | Identitas unik pengguna. |
| name | VARCHAR | Nama lengkap pengguna. |
| email / username | VARCHAR (unique) | Digunakan untuk login. |
| password | VARCHAR (hashed) | Kata sandi terenkripsi (bcrypt). |
| role | ENUM('superadmin','user') | Menentukan hak akses pengguna. |
| status | ENUM('active','inactive') | Status aktif akun. |
| preferred_language | VARCHAR | Preferensi bahasa (`id` / `en`). |
| preferred_theme | VARCHAR | Preferensi tema tampilan. |
| created_at / updated_at | TIMESTAMP | Metadata waktu. |

### 7.2 Tabel: `db_field` (Konfigurasi Field Dinamis)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | BIGINT (PK) | Identitas unik field. |
| field_label | VARCHAR | Nama/label field yang tampil pada form dan header tabel. |
| field_key | VARCHAR (slug, unique) | Identifier unik field (mis. `jenis_ternak`), digunakan sebagai key penyimpanan nilai. |
| field_type | ENUM('text','paragraph','number','date','time','checklist','list') | Tipe isian field sesuai bagian 5.5.1. |
| field_options | TEXT (nullable) | Daftar opsi untuk tipe `checklist`/`list`, dipisahkan tanda titik koma (`;`). |
| is_required | BOOLEAN | Menandakan apakah field wajib diisi. |
| display_order | INT | Urutan tampil field pada form/tabel. |
| is_active | BOOLEAN | Menentukan apakah field masih digunakan/ditampilkan. |
| created_by | BIGINT (FK -> users.id) | Superadmin yang membuat/mengubah konfigurasi. |
| created_at / updated_at | TIMESTAMP | Metadata waktu. |

### 7.3 Tabel: `db_hibah` (Data Utama Hibah)

Mengingat kolom bersifat dinamis mengikuti konfigurasi `db_field`, struktur penyimpanan data dapat menggunakan salah satu dari dua pendekatan berikut (pilih salah satu saat implementasi):

**Opsi A — EAV (Entity-Attribute-Value):**
```
db_hibah            (id, created_by, updated_by, created_at, updated_at)
db_hibah_values      (id, hibah_id FK, field_id FK -> db_field.id, value TEXT)
```

**Opsi B — Dynamic Column / JSON (lebih sederhana untuk MVP):**
```
db_hibah (id, data_values JSON, created_by, updated_by, created_at, updated_at)
```
`data_values` menyimpan pasangan `field_key: value` sesuai konfigurasi `db_field` yang aktif, contoh:
```json
{
  "nama_penerima": "Budi Santoso",
  "jenis_ternak": ["Sapi", "Kambing"],
  "tanggal_pengajuan": "2026-09-10",
  "jumlah_bantuan": 5000000
}
```

> **Rekomendasi untuk vibe coding / MVP cepat:** gunakan **Opsi B (JSON column)** karena lebih sederhana diimplementasikan di Laravel (cast `array`/`json`) dan cukup fleksibel untuk kebutuhan filter/search dasar menggunakan `JSON_EXTRACT` / `whereJsonContains` pada MySQL 8.

| Kolom (tetap) | Tipe | Keterangan |
|---|---|---|
| id | BIGINT (PK) | Identitas unik record hibah. |
| data_values | JSON | Menyimpan nilai-nilai field dinamis sesuai konfigurasi `db_field`. |
| created_by | BIGINT (FK -> users.id) | Pengguna yang menginput data. |
| updated_by | BIGINT (FK -> users.id) | Pengguna yang terakhir mengubah data. |
| created_at / updated_at | TIMESTAMP | Metadata waktu, juga digunakan untuk sinkronisasi realtime. |

---

## 8. Kebutuhan Antarmuka (UI/UX)

### 8.1 Prinsip Umum

- Antarmuka dibangun menggunakan Bootstrap dan CSS kustom untuk memastikan tampilan konsisten, rapi, dan responsif di berbagai ukuran layar.
- Navigasi menu bersifat dinamis mengikuti role pengguna yang sedang login — menu khusus Superadmin tidak dirender pada tampilan pengguna dengan role User.
- Setiap aksi penting (hapus data, ubah konfigurasi field) disertai dialog konfirmasi.

### 8.2 Struktur Halaman Utama

| Halaman | Komponen Utama |
|---|---|
| Landing Page | Header/branding, deskripsi singkat aplikasi, tombol menuju halaman Login, footer. |
| Login | Form input username/email & password, tombol masuk, pesan validasi/kesalahan. |
| Dashboard | Navbar (termasuk ikon Pengaturan), sidebar menu (menyesuaikan role), kartu ringkasan (summary cards), grafik/statistik ringkas. |
| Database Hibah | Tabel data dengan header dinamis, toolbar pencarian & filter, tombol tambah data, aksi ubah/hapus per baris, paginasi. |
| Config Field | Daftar field yang telah dikonfigurasi, tombol tambah field baru, form pengaturan tipe field (textarea opsi muncul otomatis untuk tipe Checklist/List), pengaturan urutan tampil. |
| Pengaturan | Sub-menu Bahasa, sub-menu Tema, sub-menu Manajemen User (khusus Superadmin). |

### 8.3 Tema Tampilan (Theme)

| Tema | Karakteristik Warna |
|---|---|
| Light | Latar terang (putih/abu muda) dengan teks gelap — tampilan standar/default sistem. |
| Dark | Latar gelap (abu tua/hitam) dengan teks terang — mengurangi silau pada penggunaan malam hari. |
| Green Pastel | Nuansa hijau pastel lembut, selaras dengan tema bidang peternakan/pertanian. |
| Blue Sky | Nuansa biru muda yang menyegarkan dan profesional. |

---

## 9. Rencana Deployment

### 9.1 Strategi Deployment

- Aplikasi, database (MySQL), dan cache (Redis/Memcached) dikemas menggunakan Docker Compose sebagai beberapa service yang saling terhubung.
- Deployment dilakukan pada local server pribadi melalui CasaOS.
- Environment variable (kredensial database, konfigurasi cache, application key) dikelola melalui file `.env` yang tidak disertakan pada repositori kode.
- Volume Docker digunakan untuk menjamin persistensi data MySQL serta file upload (apabila ada).

### 9.2 Kebutuhan Lingkungan

| Komponen | Kebutuhan Minimum (indikatif) |
|---|---|
| Server Host | Local server dengan CasaOS terpasang dan mendukung Docker. |
| Container App | PHP >= 8.2 dengan ekstensi yang dibutuhkan Laravel, Nginx/Apache sebagai web server. |
| Container Database | MySQL versi 8.x. |
| Container Cache | Redis atau Memcached versi stabil terbaru. |
| Jaringan | Akses jaringan lokal (LAN) antar container dan dari perangkat pengguna ke server. |
| Port Aplikasi | Aplikasi web (container `app`) di-*expose* mulai dari port **9100** pada host CasaOS (mis. `http://<ip-server>:9100`). Port berikutnya (9101, 9102, dst.) dapat dialokasikan untuk service pendukung lain (mis. phpMyAdmin, Horizon/queue dashboard) apabila dibutuhkan. |

### 9.3 Tahapan Rilis (Indikatif — cocok dijadikan urutan sprint/vibe coding)

1. **Tahap 1** — Setup dasar: struktur project Laravel, koneksi MySQL, autentikasi, dan role Superadmin/User.
2. **Tahap 2** — Modul Config Field (`DB_Field`) beserta seluruh tipe field dan mekanismenya.
3. **Tahap 3** — Modul Database Hibah (`DB_Hibah`) dengan form dan tabel dinamis mengikuti `DB_Field`.
4. **Tahap 4** — Dashboard summary, integrasi caching, dan mekanisme realtime sync.
5. **Tahap 5** — Menu Pengaturan (bahasa, tema, manajemen user) dan pengujian role-based access control.
6. **Tahap 6** — Containerization (Dockerfile & docker-compose), deployment pada CasaOS, dan pengujian akhir (UAT).

---

## 10. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Superadmin dapat menambah, mengubah, menonaktifkan, dan mengatur urutan field pada Config Field, dan perubahan tersebut langsung tercermin pada form dan tabel Database Hibah.
- [ ] Tipe field Checklist dan List menampilkan textarea opsi (5 baris) secara otomatis saat dipilih, dan opsi yang dipisahkan tanda `;` berhasil diuraikan menjadi pilihan checkbox/dropdown pada form Database Hibah.
- [ ] Data yang ditambahkan/diubah/dihapus pada Database Hibah oleh satu pengguna langsung terlihat pembaruannya pada sesi pengguna lain yang sedang membuka halaman yang sama, tanpa perlu me-refresh manual.
- [ ] Pengguna dengan role User tidak dapat melihat maupun mengakses menu Config Field dan Manajemen User, baik melalui navigasi maupun akses langsung ke URL terkait.
- [ ] Dashboard menampilkan ringkasan data yang akurat dan waktu muat halaman terasa cepat, berkat pemanfaatan cache.
- [ ] Pengguna dapat mengganti bahasa (Indonesia/English) dan tema (Light/Dark/Green Pastel/Blue Sky), dan preferensi tersebut tetap tersimpan pada sesi berikutnya.
- [ ] Aplikasi berhasil di-build dan dijalankan melalui Docker Compose pada lingkungan CasaOS tanpa kesalahan konfigurasi.

---

## 11. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Perubahan konfigurasi field oleh Superadmin dapat memengaruhi data lama yang sudah tersimpan. | Data lama berpotensi tidak sesuai/hilang konteks jika field dihapus total. | Field yang sudah memiliki data disarankan dinonaktifkan (soft-disable), bukan dihapus permanen, agar data historis tetap dapat ditelusuri. |
| Ketergantungan pada layanan cache (Redis/Memcached) untuk performa dan realtime sync. | Jika service cache mati, performa dan sinkronisasi realtime dapat terganggu. | Terapkan fallback ke query database langsung serta restart policy otomatis pada container cache. |
| Server lokal (on-premise) rentan terhadap kegagalan perangkat keras/listrik. | Potensi downtime atau kehilangan data. | Terapkan jadwal backup berkala terhadap volume database serta dokumentasi prosedur restore. |
| Kesalahan validasi hak akses hanya diterapkan di sisi tampilan (frontend) saja. | Pengguna dengan role User berpotensi mengakses data/fungsi Superadmin melalui URL langsung. | Validasi role wajib diterapkan pula pada sisi server (middleware/policy) untuk setiap endpoint. |

---

## 12. Pengembangan Lanjutan (Out of Scope V1 / Future Enhancement)

- Export data Database Hibah ke format Excel/PDF.
- Modul pelaporan (reporting) dan visualisasi data lanjutan (grafik interaktif).
- Notifikasi (email/WhatsApp) untuk perubahan status data hibah.
- Audit trail/log aktivitas pengguna secara rinci.
- Import data massal (bulk import) dari file Excel/CSV ke Database Hibah.
- Aplikasi pendamping berbasis mobile (Android/iOS).
- Multi-level role (mis. Admin wilayah/Verifikator) di luar Superadmin dan User.
