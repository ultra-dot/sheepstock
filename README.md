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

**SheepStock** adalah platform manajemen peternakan berbasis web yang dibangun untuk membantu peternak domba dan kambing mengelola operasional harian mereka secara digital. Dari pencatatan ternak, manajemen kandang, inventaris pakan, hingga pelacakan kesehatan — semuanya terintegrasi dalam satu dashboard yang intuitif, modern, dan sangat responsif.

Proyek ini dikembangkan sebagai bagian dari mata kuliah **Rekayasa Perangkat Lunak (RPL)** di **IPB University**.

---

## 🚀 Fitur Unggulan

### 📊 Dashboard Interaktif & Responsif
- Statistik real-time: total ternak, tingkat kesehatan, rata-rata berat badan
- Visualisasi data tingkat lanjut (Populasi, Pertumbuhan/ADG, Status Kesehatan)
- Desain *Glassmorphism* modern
- **Mobile-First Data Views:** Semua tabel data (Livestock, Health, Inventory, Audit Logs) otomatis berubah menjadi *Card View* di layar smartphone untuk UX yang maksimal.

### 🐑 Manajemen & Inventori Ternak
- CRUD data ternak (domba & kambing) lengkap
- Auto-generate ID unik untuk setiap ternak baru
- Fitur Harvest/Panen (Pencatatan ternak terjual atau mati)
- Filter, search, dan pagination data

### 🏠 Manajemen Kandang & Pakan Massal
- Kartu kandang visual dengan progress bar kapasitas
- Fitur **Mutasi Ternak** antar kandang (batch move)
- **Beri Pakan Massal (Bulk Feeding):** Distribusi pakan ke beberapa kandang sekaligus dengan kalkulasi otomatis pemotongan stok gudang.
- Status kebersihan kandang

### 📷 Auto-Tagging QR Code
- **Generate QR Code** otomatis untuk setiap ternak
- **Cetak label stiker** dalam layout grid 3-kolom (siap gunting)
- Dukungan berbagai ukuran kertas (A4, F4, Letter)
- **Scan QR via kamera** HP/Laptop langsung dari browser (dengan fitur *fast-scan timbang*)
- Switch kamera depan/belakang untuk tablet & HP

### 📦 Inventaris Pakan & Obat
- Pencatatan stok gudang (pakan, obat, vaksin, peralatan)
- Riwayat transaksi masuk/keluar
- Alert stok menipis dengan badge indikator warna
- Support aset optimasi `.webp` agar dashboard tetap ringan

### 🏥 Rekam Medis Kesehatan
- Pencatatan riwayat penyakit dan tindakan pengobatan
- Status: Sehat, Sakit, Karantina, Pemulihan
- Keterkaitan langsung dengan stok obat gudang

### 🛡️ Keamanan & Audit Logs (Checkpoint)
- **Role-Based Access Control (RBAC):** Admin (Full Access) & Staff (Limited Access)
- **Audit Logs:** Perekaman aktivitas mutasi sistem (CREATE, UPDATE, DELETE).
- **Fitur Restore (Checkpoint):** Memungkinkan admin membatalkan kesalahan mutasi data kembali ke state sebelumnya.

### 📋 Laporan & Cetak
- Generate laporan profesional (kop surat, tabel, tanda tangan)
- Preview split-screen (filter kiri, preview kanan)
- Print-optimized layout dengan `@media print`
- Blok tanda tangan anti-terpotong halaman

### 🌐 Landing Page
- Desain modern dengan animasi Web3-inspired
- Gambar aset terkompresi `.webp` (Super Fast Load)
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

---

## 📁 Struktur Proyek

```
sheepstock/
├── docs/                      # Dokumentasi, File Konteks AI (PROJECT_CONTEXT.md), Wireframes
├── public/                    # Aset statis (logo, gambar optimasi .webp)
├── sql/                       # Migrasi Supabase, Skema DB, dan Utility Scripts SQL
├── src/
│   ├── app/
│   │   ├── (auth)/            # Halaman autentikasi (login, register, verify)
│   │   ├── (dashboard)/       # Halaman dashboard (cages, harvest, health, inventory, livestock, dll)
│   │   ├── (landing)/         # Landing page publik
│   │   └── actions/           # Server Actions (auth, cages, inventory, livestock, audit)
│   ├── components/
│   │   ├── dashboard/         # Komponen khusus dashboard & Client Views
│   │   ├── qr/                # QR Scanner & Sticker Grid
│   │   ├── reports/           # Template laporan
│   │   └── ui/                # shadcn/ui components
│   └── lib/                   # Utilities & Supabase SSR client
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

*(Catatan: Jangan lupa me-run file SQL dari folder `sql/` ke SQL Editor Supabase Anda untuk setup awal)*

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🗂️ Database Schema

Aplikasi ini menggunakan **Supabase PostgreSQL** dengan arsitektur multi-tenant via Row Level Security (RLS). Tabel utama:

| Tabel | Deskripsi |
|---|---|
| `profiles` | Data profil dan role pengguna (Admin/Staff) |
| `livestocks` | Data ternak inti (domba/kambing, berat, gender) |
| `cages` | Data kandang, status, & kapasitas |
| `health_records` | Riwayat rekam medis dan pengobatan |
| `inventory_items` | Gudang pakan, obat, vaksin, dan peralatan |
| `inventory_transactions` | Riwayat keluar masuk inventaris |
| `feeding_records` | Pencatatan pemberian pakan |
| `weighing_records` | Historis penimbangan berat badan (ADG) |
| `harvest` | Data penjualan dan mortalitas ternak |
| `audit_logs` | Log aktivitas mutasi beserta checkpoint data (JSONB) |

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
