# Highveld Herbal Co. — White-Label South African Dispensary Website Template

A production-ready, single-tenant, cloneable full-stack botanical & herbal dispensary website template designed for South African dispensaries (default demo targeted at **Pretoria, Gauteng**).

Built with a restrained, editorial apothecary aesthetic—solid earthy colour blocks (`#F7F3EA`, `#23452F`, `#B85C38`), fine `1px` borders, Newsreader serif headings, and Inter body typography—strictly avoiding generic AI/SaaS gradients, glassmorphism, neon colours, or stoner clichés.

---

## 1. Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components by default, Server Actions, TypeScript in strict mode)
- **Styling**: Tailwind CSS 3.4 with CSS custom properties (`src/app/globals.css`)
- **Typography**: Self-hosted `@fontsource/newsreader` (editorial serif headings) and `@fontsource/inter` (UI & body)
- **Database & ORM**: PostgreSQL + Prisma ORM (`@prisma/client` + `@prisma/adapter-pg`)
- **Authentication**: NextAuth.js (`next-auth`) credentials provider for Admin (`ADMIN`) and Counter Staff (`STAFF`) with `bcryptjs` password hashing, rate limiting, and JWT sessions
- **Validation**: Zod (`src/lib/validation/index.ts`)
- **Accessible UI Primitives**: Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-accordion`) styled with custom editorial tokens
- **CMS Content**: Markdown stored in PostgreSQL (`ContentPage`, `Product.descriptionMarkdown`, `FaqItem`) rendered safely via `react-markdown` + `rehype-sanitize`
- **Testing**: Vitest (unit tests) and Playwright (end-to-end smoke tests)
- **Localisation**: South African English (`en-ZA`), prices stored in integer ZAR cents and formatted as `R 250,00`, timestamps formatted in `Africa/Johannesburg` (SAST)

---

## 2. Quick Start (Local Development)

### Option A: Using Docker Compose PostgreSQL

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```
3. **Start PostgreSQL 16 via Docker Compose**
   ```bash
   docker compose up -d
   ```
4. **Generate Prisma client, run schema migration, and seed demo data**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```
5. **Start the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

### Option B: Using Included Embedded Local PostgreSQL (No Docker Required)

If Docker is not installed on your machine, you can start a real local PostgreSQL instance on port `5432` using the included script:

```bash
npm run db:local-server
```

Then in a second terminal:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

---

## 3. Environment Variables (`.env.example`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/highveld_herbal?schema=public` |
| `NEXTAUTH_SECRET` | Secret used to sign admin JWT sessions | `replace-with-a-secure-random-32-byte-secret-in-production` |
| `NEXTAUTH_URL` | Canonical auth URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL for SEO & sitemap | `http://localhost:3000` |
| `NEXT_PUBLIC_DEMO_MODE` | Shows/hides the top "White-Label Demo Template" bar | `"true"` (`"false"` in production) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Store WhatsApp number in international digits | `27820000000` |
| `ADMIN_EMAIL` | Seeded `ADMIN` email | `admin@highveldherbal.co.za` |
| `ADMIN_PASSWORD` | Seeded `ADMIN` password | `ChangeMePretoria2026!` |
| `STAFF_EMAIL` | Seeded `STAFF` email | `staff@highveldherbal.co.za` |
| `STAFF_PASSWORD` | Seeded `STAFF` password | `StaffPretoria2026!` |
| `RESEND_API_KEY` | Optional Resend API key for emails (logs to console if blank) | `""` |
| `EMAIL_FROM` | Sender address for transactional emails | `Highveld Herbal Co. <orders@example.co.za>` |

---

## 4. Admin Portal & Role Authorization

- **Login URL**: `http://localhost:3000/admin/login`
- **Default Seeded Admin (`ADMIN`)**: `admin@highveldherbal.co.za` / `ChangeMePretoria2026!`
- **Default Seeded Staff (`STAFF`)**: `staff@highveldherbal.co.za` / `StaffPretoria2026!`

> **Security Warning**: Change the seeded admin and staff passwords immediately after first login via `/admin/users` ("Change My Password") before publishing to production.

### Role Capabilities
- **`ADMIN`**: Full access to dashboard, orders, products, categories, brands, enquiries, customers, legal content pages, critical store settings (`/admin/settings`), staff user management (`/admin/users`), and audit logs (`/admin/audit`).
- **`STAFF`**: Can view and manage orders, products, categories, brands, enquiries, and legal content pages, and change their own password, but **cannot** modify store-wide settings or manage staff/admin accounts.

---

## 5. How Reservations & Inventory Stock Work

By default, the store runs in **Reservation / Order Request Mode (`reservation`)**:

1. **Client Cart (`localStorage`)**: Stores **only** `{ variantId, quantity }`. Client prices are never trusted.
2. **Checkout Validation (`src/server/actions/checkout.ts`)**:
   - Validates customer details, South African phone number (`+27` or `0...`), delivery address (if `DELIVERY`), and mandatory checkboxes (`ageConfirmed`, `termsAccepted`, `privacyAccepted`).
   - Records exact server timestamps (`ageConfirmedAt`, `termsAcceptedAt`, `privacyAcceptedAt`) on the `Order` record.
   - Inside an atomic PostgreSQL transaction (`prisma.$transaction`), verifies `availableStock = stockQuantity - reservedQuantity >= requestedQuantity`, recalculates all ZAR totals server-side, increments `reservedQuantity`, and logs an `InventoryMovement` (`RESERVE`).
3. **Order Lifecycle & Stock Transitions (`src/lib/inventory.ts`)**:
   - `PENDING` / `CONFIRMED` / `READY_FOR_COLLECTION` / `OUT_FOR_DELIVERY`: Stock remains reserved.
   - `CANCELLED`: Releases `reservedQuantity` back to available stock (`RELEASE`).
   - `COMPLETED`: Deducts physical `stockQuantity` and releases `reservedQuantity` (`DEDUCT_COMPLETE`).
   - Stock and reserved quantities are guarded against ever going negative.

---

## 6. White-Label Customisation Guide

1. **Default Branding & Contact Details**: Edit `src/config/site.ts` or update live via `/admin/settings`.
2. **Feature Flags & Sales Mode**: Edit `src/config/features.ts` or toggle between `reservation`, `enquiry` (replaces add-to-cart with direct product enquiry links), and `checkout` in `/admin/settings`.
3. **Theme Colours & Fonts**: Edit CSS variables in `src/app/globals.css` and `src/config/theme.ts`.
4. **Replacing Demo Product Images**:
   - Demo botanical specimen SVGs are stored in `public/images/demo/` and generated by `scripts/generate-demo-assets.ts`.
   - Replace files in `public/images/demo/` or enter hosted image URLs in `/admin/products/[id]`.

---

## 7. Integrating Email, WhatsApp, Cloud Storage & Future SA Payments

- **Email Notifications (`src/lib/notifications.ts`)**: Set `RESEND_API_KEY` and `EMAIL_FROM` in `.env` to send live order confirmation emails via Resend. When omitted, formatted notification payloads are logged to stdout.
- **WhatsApp Deep Links (`src/lib/utils.ts`)**: Every order confirmation page (`/order/[publicId]`) and admin order detail page (`/admin/orders/[id]`) includes pre-populated `https://wa.me/27...` links. No WhatsApp Business API subscription is required in V1.
- **Cloud Image Storage (`src/app/api/upload/route.ts`)**: Local development supports uploading to `public/uploads`. For serverless production on Vercel, replace the file write in `src/app/api/upload/route.ts` with `@vercel/blob`, AWS S3 (`af-south-1`), Cloudinary, or Supabase Storage.
- **Future South African Payment Providers (`src/lib/payments.ts`)**: Implement the `PaymentProviderAdapter` interface in `src/lib/payments.ts` to connect **Yoco**, **Paystack**, **Ozow**, **Peach Payments**, or **PayFast** when transitioning to `checkout` mode.

---

## 8. Commands Reference

```bash
npm run dev              # Start Next.js dev server on 0.0.0.0:3000
npm run build            # Generate Prisma client and run production Next.js build
npm run start            # Start production server on 0.0.0.0:3000
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript strict compiler check
npm test                 # Run Vitest unit tests (money, stock, validation)
npm run test:e2e         # Run Playwright end-to-end smoke tests
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Apply PostgreSQL schema migrations
npm run db:seed          # Seed categories, brands, products, orders, FAQs, and legal pages
npm run db:local-server  # Run embedded PostgreSQL server on port 5432
```

---

## 9. Legal & Compliance Warning

> **IMPORTANT SOUTH AFRICAN LEGAL DISCLAIMER**:
> Commercial activities involving cannabis, hemp, and botanical preparations in South Africa are subject to evolving legislation, SAHPRA scheduling, and constitutional jurisprudence. This software template is provided strictly as technical infrastructure. None of the placeholder policies (`/legal/*`), disclaimers, or configuration defaults constitute legal advice. Every dispensary operator must have their operational model, sales mode, age-verification procedures, and legal pages reviewed by a qualified South African attorney before publishing.
