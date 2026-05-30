# SheepStock Project Context

This document is intended to provide a comprehensive, high-level overview of the **SheepStock** project. If you are an AI assistant or a new developer joining the project, **read this first** to understand the architecture, tech stack, database schema, and design patterns.

---

## 1. Project Overview
**SheepStock** is a comprehensive farm management system (dashboard) specifically designed for sheep and goat farming. It handles livestock tracking via QR codes, health monitoring, cage management, feed and inventory management, and harvest/sales recording. 

The application is designed to be mobile-first and responsive, as it is often used by farm staff directly in the field (cages) using smartphones.

## 2. Tech Stack
- **Framework:** [Next.js (App Router)](https://nextjs.org/) version 16.1.6
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Tailwind Merge + clsx
- **UI Components:** Radix UI primitives, Lucide React (icons), Recharts (data visualization)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth)
- **QR Code Handling:** `react-qr-code` (generation), `@yudiel/react-qr-scanner` (scanning)
- **Email:** Resend (for Auth verification/reset password)

---

## 3. Core Architecture & Folder Structure
The project uses Next.js App Router with Route Groups to isolate layouts.

```text
sheepstock/
├── docs/                   # Documentation, specifications, wireframes, and this context file.
├── public/                 # Static assets (images, svg). Images are optimized to .webp.
├── sql/                    # All Supabase PostgreSQL migrations, ERD, and setup scripts.
├── src/
│   ├── app/
│   │   ├── (auth)/         # Auth routes: /login, /register, /forgot-password, /verify-email
│   │   ├── (dashboard)/    # Core app routes: /dashboard, /livestock, /cages, /health, /inventory, etc.
│   │   ├── (landing)/      # Public landing page: /
│   │   ├── actions/        # Server Actions for DB operations (Supabase SSR)
│   │   └── auth/           # Auth callback routes for Supabase
│   ├── components/
│   │   ├── dashboard/      # Client components for the dashboard (e.g., livestock-client.tsx)
│   │   └── ui/             # Reusable UI components (buttons, dialogs, sidebar, etc.)
│   └── lib/                # Utility functions, Supabase clients (server/client/middleware)
└── tailwind.config.ts / globals.css  # Styling configuration
```

---

## 4. Design Guidelines & Patterns
### 1. Aesthetics (Glassmorphism)
The project heavily utilizes a "Glassmorphism" aesthetic.
- **Backgrounds:** Usually `bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl`.
- **Borders:** Subtle borders `border border-white/50 dark:border-slate-800/50`.
- **Colors:** Emerald (Primary/Success), Amber (Warning/Edit), Rose (Danger/Delete), Blue (Info).

### 2. Mobile Responsive Pattern (CRITICAL)
Because farm workers use phones, data-heavy tables MUST be responsive. We use a strict pattern:
- **Mobile Card View:** `<div className="md:hidden">...</div>` displays data as stacked cards.
- **Desktop Table View:** `<div className="hidden md:block">...table...</div>` displays standard tables.
**NEVER** create a horizontally scrolling table on mobile without a card fallback. 

### 3. Server Actions & Client Components
- Data fetching and mutations are handled via **Next.js Server Actions** inside `src/app/actions/`.
- UI state, modals, and interactivity are handled in `*-client.tsx` components inside `src/components/dashboard/`.

---

## 5. Database Schema (Supabase PostgreSQL)
The database utilizes Row Level Security (RLS) to ensure users can only access data belonging to their farm (multi-tenant architecture via `user_id`).

### Core Tables
1. **`profiles`**: Extends `auth.users`. Contains `role` (admin/staff), `name`, `phone`.
2. **`cages`**: Represents pens. Tracks `capacity`, `current_occupancy`, `status`, `temperature`.
3. **`livestocks`**: Individual animals. Tracks `qr_code` (unique), `type` (domba/kambing), `gender`, `weight`, `status` (healthy, sick, sold, dead), and which `cage_id` they are in.
4. **`health_records`**: Logs sickness, treatments, and linked `inventory_items` (medicine) used.
5. **`inventory_items`**: Manages feed, medicine, vaccines, equipment. Tracks `current_stock` and `min_stock_alert`.
6. **`inventory_transactions`**: Logs stock in/out movements.
7. **`feeding_records`**: Logs when a cage is fed and how much feed was deducted from inventory.
8. **`weighing_records`**: Logs historical weight changes of livestock (ADG tracking).
9. **`harvest`**: Logs sold/dead livestock for financial and mortality reporting.
10. **`audit_logs`**: System activity tracker (CREATE, UPDATE, DELETE). Has a JSONB `old_data` column for the **Restore** feature.

*Full schema details can be found in `sql/erd.sql` and `sql/setup_new_project.sql`.*

---

## 6. Key Features & Modules
- **QR Code System:** Every livestock has a unique QR code. The app includes a `/scan` module using the device camera to instantly view/edit an animal's profile, record weight, or log health data.
- **Bulk Feeding:** `BulkFeedModal` allows distributing feed across multiple active cages, automatically deducting from the inventory.
- **Role-Based Access Control (RBAC):** Admins have full access. Staff have limited access (e.g., cannot delete audit logs or manage users).
- **Audit Logs & Checkpoints:** Every critical mutation writes to `audit_logs`. The system allows restoring previous states for accidental modifications.
- **Analytics Dashboard:** Visualizes population, health percentage, inventory value, and growth trends using Recharts.

---

## 7. Current Project State (As of May 2026)
- **Stable Foundation:** Routing, Auth, Supabase RLS, and Server Actions are fully implemented and stable.
- **Responsive Cleanup Completed:** All major modules (`livestock`, `health`, `inventory`, `audit-logs`, `cages`) have been fully refactored to support the mobile card pattern (`md:hidden`).
- **Asset Optimization:** Heavy images (PNGs) in the landing and auth pages have been converted to highly compressed `.webp` formats for performance.
- **Ready for:** Feature enhancements, advanced reporting, or mobile app wrappers (PWA/Capacitor).
