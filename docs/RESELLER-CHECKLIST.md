# White-Label Reseller & Client Launch Checklist

This checklist guides agencies, freelance engineers, and dispensary operators through cloning and launching a new single-tenant South African dispensary website from this template.

---

## Phase 1: Repository & Database Provisioning

- [ ] **1.1 Clone as a New Single-Tenant Repository**
  ```bash
  git clone <template-repo-url> client-dispensary-name
  cd client-dispensary-name
  rm -rf .git && git init
  ```
- [ ] **1.2 Provision a Dedicated PostgreSQL Database**
  - Recommended managed hosts with South African / low-latency EU regions:
    - **Supabase** (`aws-af-south-1` Cape Town)
    - **Neon** (Serverless Postgres)
    - **Railway** or **Render**
  - Copy the PostgreSQL connection string (`DATABASE_URL`).
- [ ] **1.3 Configure Environment Variables**
  - Copy `.env.example` to `.env` (for local setup) and configure the same variables in your hosting provider (e.g. Vercel Project Settings):
    - `DATABASE_URL`: PostgreSQL connection string
    - `NEXTAUTH_SECRET`: Generate a unique secret via `openssl rand -base64 32`
    - `NEXTAUTH_URL`: Full production domain (e.g. `https://www.clientdispensary.co.za`)
    - `NEXT_PUBLIC_SITE_URL`: Full production domain
    - `NEXT_PUBLIC_DEMO_MODE`: Set to `"false"` in production to hide the top demo template bar
    - `NEXT_PUBLIC_WHATSAPP_NUMBER`: Client WhatsApp number in international digits without `+` (e.g. `27821234567`)
    - `ADMIN_EMAIL` & `ADMIN_PASSWORD`: Strong initial credentials for seeding

---

## Phase 2: Brand & Visual Theme Customisation

- [ ] **2.1 Update Default Store Configuration (`src/config/site.ts`)**
  - Replace `brandName`, `shortName`, `tagline`, and `description`.
  - Update `addressLine1`, `suburb`, `city`, `province`, `postalCode`, `directionsUrl`, and `parkingNotes`.
  - Update `phone`, `whatsappNumber`, `whatsappDisplay`, `email`, and `privacyEmail`.
  - Update `hours` (`weekdays`, `saturday`, `sunday`, `publicHolidays`).
  - Update `deliveryFeeCents`, `freeDeliveryThresholdCents`, and `deliveryAreas`.
  - Update `vatNotice` (e.g. `"All prices include 15% VAT"` if the client is VAT-registered, or `"VAT not applicable"` if not).
- [ ] **2.2 Customise Colour Palette & Typography (`src/app/globals.css` & `src/config/theme.ts`)**
  - Adjust CSS variables in `:root` inside `src/app/globals.css`:
    - `--color-background` (default warm parchment `#F7F3EA`)
    - `--color-foreground` (default near-black `#1C1C19`)
    - `--color-primary` (default deep forest green `#23452F`)
    - `--color-secondary` (default burnt clay `#B85C38`)
    - `--color-muted` (default sand `#E7DECF`)
    - `--color-border` (default stone border `#D6CBB9`)
  - Keep solid colour blocks and high contrast (WCAG AA). Do not introduce neon gradients or backdrop blurs.
- [ ] **2.3 Replace Demo Botanical SVGs with Client Imagery**
  - Demo placeholders live in `public/images/demo/*.svg`.
  - Replace hero and category illustrations in `public/images/demo/` or upload real studio photography via the Admin Product Editor (`/admin/products`).
  - For production cloud image hosting on Vercel, configure S3 (`af-south-1`), Supabase Storage, Cloudinary, or Vercel Blob and paste the hosted HTTPS image URLs into the Admin Product Editor.

---

## Phase 3: Database Migration & Catalogue Setup

- [ ] **3.1 Apply Schema Migrations**
  ```bash
  npm run db:migrate
  ```
- [ ] **3.2 Seed Initial Structure (or Customise `prisma/seed.ts`)**
  ```bash
  npm run db:seed
  ```
- [ ] **3.3 Clean Demo Products & Orders Before Launch**
  - Sign in to `/admin` and archive or replace the fictional Highveld Herbal Co. products, categories, and brands, or edit `prisma/seed.ts` with the client's real menu before seeding.

---

## Phase 4: South African Legal & Compliance Review (Mandatory)

- [ ] **4.1 Attorney Review of All Legal Pages**
  - Have a qualified South African attorney review and approve all 8 legal pages in `/admin/content`:
    1. `/legal/privacy` (POPIA Privacy Policy)
    2. `/legal/terms` (Terms & Conditions)
    3. `/legal/cookies` (Cookie & Browser Storage Policy)
    4. `/legal/paia` (PAIA Section 51 Manual & Information Officer details)
    5. `/legal/age-policy` (18+ Age Verification Policy)
    6. `/legal/responsible-use` (Responsible Use & Non-Medical Notice)
    7. `/legal/delivery-collection` (Collection & Delivery Policy)
    8. `/legal/returns-refunds` (CPA Returns & Refunds Policy)
- [ ] **4.2 Verify Zero Medical Claims**
  - Confirm that no product descriptions claim to "cure", "treat", "heal", or "prevent" any disease or medical condition.
- [ ] **4.3 Verify Sales Mode**
  - In `/admin/settings`, confirm whether the client should operate in `reservation` mode (cart + reservation request without online card payment) or `enquiry` mode (direct product enquiries only).

---

## Phase 5: Quality Assurance & Handover

- [ ] **5.1 Run Automated Tests & Production Build**
  ```bash
  npm test
  npm run typecheck
  npm run lint
  npm run build
  ```
- [ ] **5.2 Test End-to-End Reservation Flow on Staging**
  - Verify the 18+ age gate appears on first visit.
  - Submit a test reservation and confirm the WhatsApp deep link (`wa.me/27...`) and email notification work.
- [ ] **5.3 Rotate Admin Password & Create Staff Accounts**
  - Log in at `/admin/login` as `ADMIN`.
  - Navigate to `/admin/users` and change the default seeded password immediately.
  - Create individual `STAFF` accounts for counter staff so every action in `/admin/audit` is attributed to a named staff member.
