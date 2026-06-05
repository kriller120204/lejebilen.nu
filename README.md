# Lejebilen.nu

Fuld-stack biludlejningsplatform for Ølstykke Auto. Bygget med Next.js 15, Prisma 6 og PostgreSQL.

## Tech-stak

| Lag | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL (Neon / Supabase) |
| Betaling | QuickPay v10 |
| Email | Resend |
| SMS | 46elks |
| Digital signatur | Penneo (TODO/mock) |
| Regnskab | e-conomic (TODO/mock) |

## Kom i gang

### 1. Klon og installer

```bash
git clone <repo>
cd lejebilen.nu
npm install
```

### 2. Opret miljøvariabler

```bash
cp .env.example .env.local
```

Rediger `.env.local` og udfyld mindst `DATABASE_URL`.

### 3. Initialisér databasen

```bash
npm run db:push     # Opretter tabeller
npm run db:seed     # Tilføjer testdata (11 biler, 7 kunder, 9 bookinger)
```

### 4. Start udviklingsserver

```bash
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000).

Admin-panel: [http://localhost:3000/admin](http://localhost:3000/admin)
Standard adgangskode: `admin123` (sat i `.env.local`)

---

## Miljøvariabler

| Variabel | Påkrævet | Beskrivelse |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `ADMIN_PASSWORD` | ✅ | Adgangskode til admin-panel |
| `ADMIN_SECRET` | ✅ | Session-token (tilfældig streng) |
| `NEXT_PUBLIC_URL` | ✅ | Offentlig URL, fx `https://lejebilen.nu` |
| `QUICKPAY_API_KEY` | Betaling | QuickPay API-nøgle |
| `QUICKPAY_PRIVATE_KEY` | Betaling | QuickPay private key (checksum) |
| `QUICKPAY_MERCHANT_ID` | Betaling | QuickPay merchant ID |
| `RESEND_API_KEY` | Email | Resend API-nøgle |
| `EMAIL_FROM` | Email | Afsenderadresse, fx `noreply@lejebilen.nu` |
| `FORTYSIX_ELKS_USERNAME` | SMS | 46elks brugernavn |
| `FORTYSIX_ELKS_PASSWORD` | SMS | 46elks adgangskode |
| `SMS_FROM` | SMS | Afsendernavn, fx `Lejebilen` |
| `PENNEO_CLIENT_ID` | Signatur | Penneo OAuth client ID |
| `PENNEO_CLIENT_SECRET` | Signatur | Penneo OAuth client secret |
| `PENNEO_ENV` | Signatur | `sandbox` eller `production` |
| `ECONOMIC_SECRET_TOKEN` | Regnskab | e-conomic secret token |
| `ECONOMIC_AGREEMENT_GRANT_TOKEN` | Regnskab | e-conomic agreement token |

> **Mock-tilstand:** Alle integrationer logger til konsollen når env-variabler mangler. Betal­ing, email, SMS, signatur og regnskab virker dermed i dev uden live-credentials.

---

## NPM-scripts

```bash
npm run dev          # Udviklingsserver (localhost:3000)
npm run build        # Produktionsbuild
npm run start        # Start produktionsserver
npm run db:push      # Anvend schema ændringer (uden migration)
npm run db:seed      # Seed testdata
npm run db:studio    # Åbn Prisma Studio
npm run db:generate  # Regenerer Prisma-klient
npm run db:reset     # Reset DB og seed (destruktivt!)
```

---

## Projektstruktur

```
app/
  page.tsx                  # Forside (hero, søgning, bilgrid)
  layout.tsx                # Root layout
  biler/[id]/page.tsx       # Bil-detalje + tilgængelighed
  booking/[carId]/page.tsx  # 5-trins booking flow
  admin/
    page.tsx                # Dashboard (KPI'er, seneste bookinger)
    bookinger/page.tsx      # Gantt-kalender + liste
    biler/page.tsx          # Flådestyring
    kunder/page.tsx         # Kundeliste
    login/page.tsx          # Login
  api/
    cars/                   # GET alle, POST opret
    cars/[id]/              # GET, PUT, DELETE
    cars/available/         # GET tilgængelige biler for periode
    bookings/               # GET alle, POST opret (+ QuickPay-link)
    bookings/[id]/          # GET, PATCH, DELETE
    customers/              # GET alle, POST opret
    customers/[id]/         # GET, PUT
    payments/quickpay/      # POST initiér betaling
    payments/quickpay/callback/  # POST QuickPay webhook
    admin/login/            # POST log ind, DELETE log ud
    admin/stats/            # GET dashboard KPI'er

components/
  SiteHeader.tsx            # Topnavigation
  SiteFooter.tsx            # Footer med betalingschips
  AdminSidebar.tsx          # Admin-sidebar med aktiv-tilstand
  ImageSlot.tsx             # Billede-placeholder
  CarCard.tsx               # Bilkort til grid
  CarGrid.tsx               # Bilgrid med kategorifiltre
  SearchBox.tsx             # Dato/tid-søgeboks
  AvailabilityCalendar.tsx  # Mini-kalender med belægning
  GanttCalendar.tsx         # Gantt-kalender til admin
  BookingFlow.tsx           # 5-trins booking (client component)
  BookingDrawer.tsx         # Admin: booking-detalje drawer
  CarDrawer.tsx             # Admin: opret/rediger bil drawer
  CustomerDrawer.tsx        # Admin: kundedetalje drawer

lib/
  db.ts                     # Prisma-klient singleton
  quickpay.ts               # QuickPay v10 API
  mail.ts                   # Resend email
  sms.ts                    # 46elks SMS
  penneo.ts                 # Penneo digital signatur (TODO/mock)
  economical.ts             # e-conomic regnskab (TODO/mock)
  utils.ts                  # Formateringsfunktioner m.m.

prisma/
  schema.prisma             # 9-tabel databaseschema
  seed.ts                   # Testdata (11 biler, 7 kunder, 9 bookinger)

middleware.ts               # Beskyt /admin-ruter med cookie-auth
```

---

## Deployment (Vercel)

1. Push til GitHub
2. Opret nyt Vercel-projekt og peg på repo
3. Tilføj alle env-variabler under Settings → Environment Variables
4. `DATABASE_URL` skal pege på Neon eller Supabase (ikke localhost)
5. Kør `npm run db:push` mod produktions-DB første gang

### QuickPay webhook

Gå til QuickPay Dashboard → Integrationer → Callbacks og sæt:

```
https://lejebilen.nu/api/payments/quickpay/callback
```

---

## Kendte TODO'er / næste skridt

- [ ] Rigtig filupload til kørekort (fx Vercel Blob eller S3)
- [ ] PDF-generering af lejekontrakt (Penneo eller pdf-lib)
- [ ] Rigtig Penneo-integration (OAuth flow)
- [ ] e-conomic faktura ved afsluttet booking
- [ ] Inspektion-flow (skaderapport med billeder)
- [ ] E-mail-skabeloner med HTML-design
- [ ] Admin: brugeradministration (flere admin-brugere)
- [ ] Admin: export til CSV/Excel
