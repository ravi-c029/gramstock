# GramStock Cloud — Implementation Plan & Status

**Tagline:** One Platform. Every Business. Your Inventory, Your Way.  
**Architecture:** Next.js 16 (Turbopack, TypeScript, React 19, Tailwind CSS), Prisma ORM, Multi-Tenant Adaptive Schema Engine, Dual-Mode Storage (Local Filesystem / AWS S3), Real-Time KPI Analytics & Auditing.

---

## 1. Project Instruction Files Read
- `START_HERE_MASTER_PROMPT.txt` — Core engineering instructions & quality guidelines
- `project_struct.txt` — Master product specification, visual direction, design tokens, and functional phases

---

## 2. Stack & Repository Status
- **Framework:** Next.js 16 with App Router, React 19, TypeScript (Strict)
- **Styling & UI:** Tailwind CSS, Radix UI primitives, Lucide icons, Centralized Design Tokens (CSS custom properties)
- **Data Layer:** Unified repository pattern (`src/lib/data-store.ts`) supporting PostgreSQL (via Prisma Client) with resilient file-backed local storage (`.data/gramstock-dev.json`) for local development without external service dependencies.
- **Storage:** Dual-mode storage abstraction (`adapter.ts` supporting local uploads and AWS S3 with presigned URLs).
- **Import Engine:** Heuristic classification engine (`analyzer.ts`) with type inference, duplicate/missing data detection, and canonical field mapping.
- **Test Datasets:** 5 pre-built downloadable sample CSVs in `public/samples/` for Kirana, Pharmacy, Restaurant, Garments, and Hardware retail.
- **Verification:** TypeScript (`tsc --noEmit`) passes with 0 errors, Next.js production build (`npm run build`) completed with 0 errors, and Browser Subagent executed end-to-end integration flow.

---

## 3. Milestones & Checklist

### Milestone 1: Environment & Persistence Foundation
- [x] Prisma schema with multi-tenant isolation, adaptive schemas, items, import jobs, and telemetry (`prisma/schema.prisma`)
- [x] Dual-mode storage abstraction (Local disk development / AWS S3 production)
- [x] Environment configuration templates (`.env.example` and local `.env`)
- [x] Unified resilient repository (`src/lib/data-store.ts`) supporting local development fallback and PostgreSQL
- [x] Preloaded sample businesses across all 5 target categories (Kirana, Pharmacy, Restaurant, Garments, General Retail)

### Milestone 2: Adaptive Import Flow
- [x] Heuristic analysis engine (`src/lib/import/analyzer.ts`)
- [x] File upload & analysis API (`/api/import/analyze`) supporting multipart/form-data, raw CSV, and one-click sample datasets
- [x] Ingestion & schema persistence API (`/api/import/process`)
- [x] 4-Step Import Wizard UI (`/imports`):
  - Step 1: File dropzone (CSV/XLSX) and 1-click built-in datasets
  - Step 2: Heuristic Analysis & Category Confirmation with explainable match reasons
  - Step 3: Schema Editor (reorder, add custom fields, map canonical columns, set data types)
  - Step 4: Preview & Validation (row-by-row error detection and duplicate warnings)
  - Step 5: Final ingestion to inventory & job summary

### Milestone 3: Inventory Workspace & Management
- [x] Multi-tenant business context switcher & persistent state (`useBusiness()`)
- [x] Dynamic Inventory Data Table (`/inventory`):
  - Adaptive columns rendered according to active schema definition
  - Live search by product name, SKU, and category
  - Filter tabs: All, Low Stock, Out of Stock, Expiring Soon
  - Quick stock adjustments (+1, -1) and custom adjustments with audit reasons
  - Add Item modal conforming dynamically to active schema
  - CSV export of active inventory table

### Milestone 4: Adaptive Data-Driven Dashboard
- [x] Real-time KPI Stat Cards (`/dashboard`): Total SKUs, Inventory Valuation, Low Stock Warnings, Expiring Soon
- [x] Adaptive Category-Specific Visualizations (Recharts Bar & Distribution)
- [x] Immutable Stock Movement Audit Log table
- [x] Truthful Data Engine Status banner ("Local Development Store" vs "PostgreSQL Connected")

### Milestone 5: Verification & Quality Assurance
- [x] TypeScript verification (`npx tsc --noEmit` — 0 errors)
- [x] Production build verification (`npm run build` — 20 routes generated successfully)
- [x] Next.js dev server running on `http://localhost:3000`
- [x] Browser subagent end-to-end functional verification passed
