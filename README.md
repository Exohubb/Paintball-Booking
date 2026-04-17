<div align="center">

# 🎯 Paintball Booking

### Competitive Slot Booking System for XPLOIT vs ECELL Paintball Tournament

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Realtime-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

A full-stack team slot booking platform built for a college paintball tournament between two competing clubs — **XPLOIT** and **ECELL**. Features phone OTP authentication, Google reCAPTCHA, atomic team bookings, real-time slot availability, and JWT-secured API routes.

</div>

---

## ✨ Features

- **🛡️ reCAPTCHA Gate** — Google reCAPTCHA v2 on entry, blocking bots before auth
- **📱 Phone OTP Authentication** — Phone number verified via OTP; JWT issued on success
- **📝 User Registration** — Collects name, scholar ID, and gender; persisted to PostgreSQL
- **🏟️ Team Slot Booking** — Teams of 4 book time slots per club (XPLOIT or ECELL)
- **👥 Team Member Management** — Leader adds 3 more members with full profile details
- **🔒 Atomic Transactions** — PostgreSQL stored functions ensure no double-booking
- **⚡ Real-time Updates** — Supabase Realtime pushes slot changes to all browsers instantly
- **🔁 Team Slot Claiming** — Pre-claimed slots with expiry timers for multi-step booking
- **🚦 Rate Limiting** — IP-based middleware blocks >30 API requests/minute
- **📱 Responsive Design** — Mobile-first, neon-themed UI with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Full-stack React with server components & API routes |
| **Language** | TypeScript 5.3 | Type-safe frontend and backend |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS with custom neon theme |
| **Animations** | Framer Motion 11 | Page transitions, entrance animations |
| **Database** | Supabase (PostgreSQL) | Persistent users, slots, bookings |
| **Realtime** | Supabase Realtime | Live slot availability via WebSocket pub/sub |
| **Auth** | JWT via `jose` + httpOnly cookies | Stateless phone-based session tokens |
| **OTP / Phone** | Custom OTP flow | Phone verification with 24h JWT sessions |
| **CAPTCHA** | `react-google-recaptcha` | Google reCAPTCHA v2 bot protection |
| **Validation** | Zod | Runtime schema validation on all API inputs |
| **Date Handling** | date-fns 3 | Slot time formatting and comparison |
| **Rate Limiting** | Edge Middleware (in-memory) | 30 req/min per IP on all `/api/*` routes |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (Client)                       │
│                                                               │
│  / (splash)  →  /auth/captcha  →  /auth/otp  →  /auth/details │
│                                        ↓                      │
│                                   /slots  (booking UI)        │
│                                                               │
│  Components: SlotGrid, SlotCard, BookingModal,                │
│              TeamClaimModal, TeamDetailsModal, Toast           │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS + Fetch + Realtime WS
┌───────────────────────────▼──────────────────────────────────┐
│                    Next.js 14 App Router                      │
│                                                               │
│  API Routes (Edge-compatible):                                │
│  POST /api/verify-phone     → Issue JWT cookie                │
│  POST /api/book-slot        → Atomic slot booking             │
│  POST /api/claim-team-slot  → Claim slot with expiry          │
│  POST /api/add-team-members → Register 4 team members         │
│                                                               │
│  Middleware: IP rate limiter (30 req/min) on /api/*           │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                                       ▼
┌───────────────────┐                ┌──────────────────────┐
│  Supabase         │                │  Supabase Realtime   │
│  PostgreSQL       │                │                      │
│                   │                │  Pub/Sub on:         │
│  users            │                │  - slots table       │
│  slots            │                │  - bookings table    │
│  bookings         │                │                      │
│  otp_verifications│                │  Live slot count     │
│                   │                │  pushed to all       │
│  Stored Functions:│                │  connected clients   │
│  book_slot()      │                └──────────────────────┘
│  add_team_members()│
└───────────────────┘
```

### Authentication Flow

```
User visits / → reCAPTCHA verify
     ↓
Enter phone → OTP sent → OTP verified
     ↓
POST /api/verify-phone → JWT created → set as httpOnly cookie
     ↓
Fill details (name, scholar ID, gender) → saved to users table
     ↓
/slots → JWT verified in API routes → booking allowed
```

---

## 📁 Project Structure

```
Paintball-Booking/
├── app/
│   ├── page.tsx                    # Splash screen with animated entry & redirect
│   ├── layout.tsx                  # Root layout with fonts and global styles
│   ├── globals.css                 # Tailwind base + custom neon CSS variables
│   ├── auth/
│   │   ├── captcha/page.tsx        # Google reCAPTCHA gate (step 1)
│   │   ├── otp/page.tsx            # Phone OTP entry (step 2)
│   │   └── details/page.tsx        # User details form (step 3)
│   ├── slots/
│   │   └── page.tsx                # Main booking page with real-time slot grid
│   └── api/
│       ├── verify-phone/route.ts   # Verify OTP response, issue JWT
│       ├── book-slot/route.ts      # Atomic slot booking with JWT auth
│       ├── claim-team-slot/route.ts# Claim a team slot with expiry timer
│       └── add-team-members/route.ts # Insert 4 team members per booking
│
├── components/
│   ├── SlotGrid.tsx                # Main grid layout for all time slots
│   ├── SlotCard.tsx                # Individual slot card (available/booked)
│   ├── TeamSlotCard.tsx            # Team-specific slot card with member count
│   ├── BookingModal.tsx            # Confirmation modal before booking
│   ├── TeamClaimModal.tsx          # Claim team slot modal
│   ├── TeamDetailsModal.tsx        # 4-member team details entry form
│   ├── OTPForm.tsx                 # OTP input component
│   ├── DetailsForm.tsx             # User registration form
│   ├── Captcha.tsx                 # reCAPTCHA wrapper component
│   ├── LoadingSkeleton.tsx         # Skeleton loader for slot grid
│   └── Toast.tsx                   # Success/error notification toasts
│
├── lib/
│   ├── auth.ts                     # JWT sign & verify (using jose)
│   ├── rateLimit.ts                # Rate limiter utility
│   ├── utils.ts                    # Shared helpers
│   └── supabase/
│       ├── client.ts               # Supabase browser client
│       └── server.ts               # Supabase server client (SSR-safe)
│
├── supabase/
│   ├── schema.sql                  # Full DB schema + indexes + stored functions
│   ├── policies.sql                # Row Level Security policies + Realtime
│   └── config.sql                  # Additional configs
│
├── types/
│   └── index.ts                    # Shared TypeScript types (Slot, User, TeamBooking…)
│
├── middleware.ts                   # IP rate limiting on all /api/* routes
├── tailwind.config.ts              # Neon color palette (xploit, ecell, neon)
├── next.config.js                  # Next.js config
└── tsconfig.json                   # TypeScript config
```

---

## 🚀 Local Development

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- Google reCAPTCHA v2 site key

### 1. Clone the repo

```bash
git clone https://github.com/Exohubb/Paintball-Booking.git
cd Paintball-Booking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# JWT
JWT_SECRET=your-very-long-random-secret-key-here

# Google reCAPTCHA v2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### 4. Set up the database

Run these SQL files in your Supabase SQL Editor **in order**:

```bash
# 1. Create tables, indexes, and stored functions
supabase/schema.sql

# 2. Enable RLS policies and Realtime
supabase/policies.sql
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema

```sql
-- Users (registered participants)
users (id, phone, name, scholar_number, gender, created_at)

-- Slots (time slots per club)
slots (id, start_time, end_time, slot_name, club, is_booked, booked_by, booked_at)

-- Bookings (one per user per club)
bookings (id, user_id, slot_id, club, created_at)

-- OTP tracking
otp_verifications (id, phone, otp_hash, attempts, verified, expires_at, created_at)
```

**Atomic booking** is handled by a PostgreSQL stored function `book_slot()` using `FOR UPDATE` locking to prevent race conditions:

```sql
SELECT is_booked FROM slots WHERE id = p_slot_id FOR UPDATE;
-- Checks: not already booked, user has no existing booking
-- Then: UPDATE slots + INSERT bookings in the same transaction
```

---

## 🔌 API Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/verify-phone` | POST | None | Verify OTP result, issue JWT cookie |
| `/api/book-slot` | POST | JWT cookie | Book a slot atomically |
| `/api/claim-team-slot` | POST | JWT cookie | Claim a team slot with expiry |
| `/api/add-team-members` | POST | None | Add 4 team members to a booking |

All routes are validated with **Zod** schemas. All `/api/*` routes are rate-limited to **30 requests/minute per IP** via Next.js middleware.

---

## 🔒 Security

| Concern | Implementation |
|---|---|
| Bot protection | Google reCAPTCHA v2 on app entry |
| Session auth | `jose` JWT, signed HS256, 24h expiry, httpOnly cookie |
| Input validation | Zod schemas on every API route |
| Race conditions | PostgreSQL `FOR UPDATE` row locking in `book_slot()` |
| Abuse prevention | IP-based rate limit: 30 req/min via Edge Middleware |
| Data isolation | Supabase Row Level Security (RLS) on all tables |
| HTTPS only | `secure: true` on cookies in production |

---

## 📦 Dependencies

```json
{
  "next": "^14.1.0",                    // React framework (App Router)
  "react": "^18.2.0",                   // UI library
  "@supabase/supabase-js": "^2.39.3",   // Database + Realtime client
  "@supabase/ssr": "^0.1.0",            // SSR-safe Supabase session handling
  "framer-motion": "^11.0.3",           // Animations and transitions
  "jose": "^5.2.0",                     // JWT sign/verify (Edge-compatible)
  "react-google-recaptcha": "^3.1.0",   // reCAPTCHA v2 component
  "zod": "^3.22.4",                     // Runtime schema validation
  "date-fns": "^3.3.1",                 // Date formatting for slot times
  "tailwindcss": "^3.4.1",              // Utility CSS framework
  "typescript": "^5.3.3"                // Type safety
}
```

---

## 🎨 Design System

Custom neon color palette defined in `tailwind.config.ts`:

| Token | Color | Use |
|---|---|---|
| `xploit.primary` | `#00ff88` (neon green) | XPLOIT club accent |
| `ecell.primary` | `#00d4ff` (neon blue) | ECELL club accent |
| `neon.purple` | `#8338ec` | Headings, gradients |
| `neon.pink` | `#ff006e` | Alerts, highlights |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Made with ♥ by <a href="https://github.com/Exohubb">Exohubb</a>
</div>
