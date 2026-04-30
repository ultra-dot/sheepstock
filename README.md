<p align="center">
  <img src="public/logo.png" alt="SheepStock Logo" width="80" />
</p>

<h1 align="center">🐑 SheepStock</h1>

<p align="center">
  <strong>Sistem Manajemen Peternakan Domba & Kambing Modern</strong><br/>
  <em>Lacak, kelola, dan optimalkan peternakan Anda dengan teknologi QR Tagging & Dashboard real-time.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
</p>

---

## ✨ Tentang Proyek

**SheepStock** adalah platform manajemen peternakan berbasis web yang dibangun untuk membantu peternak domba dan kambing mengelola operasional harian mereka secara digital. Dari pencatatan ternak, manajemen kandang, inventaris pakan, hingga pelacakan kesehatan — semuanya terintegrasi dalam satu dashboard yang intuitif dan modern.

Proyek ini dikembangkan sebagai bagian dari mata kuliah **Rekayasa Perangkat Lunak (RPL)** di **IPB University**.

---

## 🚀 Fitur Unggulan

### 📊 Dashboard Interaktif
- Statistik real-time: total ternak, tingkat kesehatan, rata-rata berat badan
- Grafik populasi per kandang (Radar Chart)
- Grafik distribusi kesehatan ternak

### 🐑 Inventori Ternak
- CRUD data ternak (domba & kambing) lengkap
- Auto-generate ID unik untuk setiap ternak baru
- Filter, search, dan pagination data

### 🏠 Manajemen Kandang
- Kartu kandang visual dengan progress bar kapasitas
- Fitur **Mutasi Ternak** antar kandang (batch move)
- Pencatatan pemberian pakan per kandang
- Status kebersihan kandang

### 📷 Auto-Tagging QR Code
- **Generate QR Code** otomatis untuk setiap ternak
- **Cetak label stiker** dalam layout grid 3-kolom (siap gunting)
- Dukungan berbagai ukuran kertas (A4, F4, Letter)
- **Scan QR via kamera** HP/Laptop langsung dari browser
- Switch kamera depan/belakang untuk tablet & HP

### 📋 Laporan & Cetak
- Generate laporan profesional (kop surat, tabel, tanda tangan)
- Preview split-screen (filter kiri, preview kanan)
- Print-optimized layout dengan `@media print`
- Blok tanda tangan anti-terpotong halaman

### 📦 Inventaris Pakan & Obat
- Pencatatan stok gudang (pakan, obat, vitamin)
- Riwayat transaksi masuk/keluar
- Alert stok menipis

### 🏥 Rekam Medis Kesehatan
- Pencatatan riwayat kesehatan per ternak
- Status: Sehat, Sakit, Karantina

### 🔐 Autentikasi
- Login & Register dengan email
- Verifikasi email
- Session management via Supabase Auth

### 🌐 Landing Page
- Desain modern dengan animasi Web3-inspired
- Responsive design untuk semua perangkat
- Embedded interactive map (IPB University)
- Form kontak terintegrasi

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Backend** | Supabase (PostgreSQL, Auth, RLS) |
| **Charts** | Recharts |
| **QR Code** | react-qr-code, @yudiel/react-qr-scanner |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 📁 Struktur Proyek

```
sheepstock/
├── public/                    # Aset statis (logo, gambar)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Halaman autentikasi (login, register, verify)
│   │   ├── (dashboard)/       # Halaman dashboard
│   │   │   ├── cages/         # Manajemen kandang
│   │   │   ├── dashboard/     # Overview dashboard
│   │   │   ├── health/        # Rekam medis kesehatan
│   │   │   ├── inventory/     # Inventaris pakan & obat
│   │   │   ├── livestock/     # Inventori ternak + QR tags
│   │   │   ├── reports/       # Generator laporan
│   │   │   └── settings/      # Pengaturan akun
│   │   ├── (landing)/         # Landing page publik
│   │   └── actions/           # Server Actions (auth, cages, inventory, livestock)
│   ├── components/
│   │   ├── dashboard/         # Komponen khusus dashboard
│   │   ├── qr/                # QR Scanner & Sticker Grid
│   │   ├── reports/           # Template laporan
│   │   └── ui/                # shadcn/ui components
│   └── lib/                   # Utilities & Supabase client
├── .env.example               # Template environment variables
├── package.json
└── tsconfig.json
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- Akun [Supabase](https://supabase.com) (gratis)

### 1. Clone Repository

```bash
git clone https://github.com/ultra-dot/sheepstock.git
cd sheepstock
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

Isi file `.env.local` dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 5. Build untuk Production

```bash
npm run build
npm start
```

---

## 📸 Screenshots

> _Screenshots akan ditambahkan segera._

<!-- 
Uncomment dan isi path screenshot:
| Dashboard | Inventori Ternak | QR Scanner |
|---|---|---|
| ![Dashboard](docs/ss-dashboard.png) | ![Livestock](docs/ss-livestock.png) | ![QR](docs/ss-qr.png) |
-->

---

## 🗂️ Database Schema

Aplikasi ini menggunakan **Supabase PostgreSQL** dengan Row Level Security (RLS). Tabel utama:

| Tabel | Deskripsi |
|---|---|
| `profiles` | Data profil pengguna |
| `livestocks` | Data ternak (domba/kambing) |
| `cages` | Data kandang & kapasitas |
| `health_records` | Riwayat kesehatan ternak |
| `inventory_items` | Stok gudang (pakan, obat) |
| `inventory_transactions` | Riwayat transaksi inventaris |
| `feeding_logs` | Log pemberian pakan |

---

## 🤝 Tim Pengembang

Proyek ini dikembangkan oleh mahasiswa **IPB University** sebagai tugas mata kuliah Rekayasa Perangkat Lunak (RPL) Semester 4.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<p align="center">
  Dibuat dengan ❤️ oleh Tim SheepStock — IPB University
</p>
