# Dr. Arwa Bohra — E-Consultation Platform (`drarwabohra.com`)

Official website and voice-call E-Consultation booking platform for **Dr. Arwa Bohra — Homeopathic Consultant & Skin/Hair Specialist**.

Experience expert classical homeopathy from home with nationwide medicine delivery, integrated consultation plans (Plan A & Plan B), bestseller remedies, live slot booking, and full admin management.

## Quick start

```bash
npm install        # or: ln -s ../kota-property/node_modules node_modules
cp .env.example .env.local   # set ADMIN_PASSWORD
npm run dev        # http://localhost:3000
```

Admin panel: **http://localhost:3000/admin** — sign in with the
`ADMIN_PASSWORD` from `.env.local` (default `arwaadmin2026`, dev only).

`npx tsc --noEmit` — typecheck · `npm run build` — production build.

## Architecture

| Layer | Files |
|---|---|
| Data layer (server only — imports `node:fs`) | `lib/data.ts` |
| Slot engine (pure, server-safe) | `lib/slots.ts` |
| Client-safe helpers (formatting etc.) | `lib/data-client.ts` |
| Admin auth (cookie `drb_admin` + session JSON store) | `lib/auth.ts` |
| Input sanitizers for admin APIs | `lib/validation.ts` |
| JSON store | `data/*.json` |
| Admin UI | `app/admin/*`, `components/admin/*` |
| Admin APIs | `app/api/admin/*` (+ `/api/auth/login`, `/api/auth/logout`) |

**The contract:** `lib/data.ts` exports are locked — other builders code
against them. Do not rename types or functions there. If you add pure
helpers, mirror them in `lib/data-client.ts` because `lib/data.ts` can
never be imported by a client component (webpack `UnhandledSchemeError:
node:fs`).

## Admin panel

- `/admin` — login or dashboard (today's appointments, stat cards, quick links)
- `/admin/appointments` — all bookings, newest first; filter by date +
  status; per-row actions: confirm, reschedule (live slot picker), cancel,
  mark visited, mark no-show
- `/admin/schedule` — weekly hours grid per consult mode, slot duration,
  blocked dates
- `/admin/treatments` — CRUD (shows on public site immediately)
- `/admin/testimonials` — CRUD with sample toggle
- `/admin/videos` — CRUD for the homepage “Videos” carousel (see below)
- `/admin/settings` — clinic identity, contact, fees, home-page copy,
  cancellation policy, payment mode, integration placeholders

Every admin mutation revalidates public paths (`/`, `/book`, `/treatments`)
via `revalidatePath`.

## Videos section

The homepage shows a swipeable **“Videos” carousel** (touch swipe, arrow
buttons, dots) between the Treatments and booking-steps sections — but **only
when at least one active video exists**, so the public site never shows an
empty state.

- **Admin → Videos → Add video**: paste a title and the video URL. The type
  is auto-detected and shown live in the form:
  - YouTube: `youtube.com/watch?v=…`, `youtu.be/…`, `/shorts/…`, `/embed/…`
  - Instagram: `instagram.com/reel/…`, `/p/…` (public posts/reels)
  - Anything else is rejected with a plain-language error.
- YouTube entries render as click-to-play cards (thumbnail + play button;
  the iframe only mounts after the visitor taps). Instagram entries render
  the public-post embed with an “Instagram pe dekho” outbound link.
- Reorder with the ↑ / ↓ buttons, hide/show with the toggle, edit or
  delete any entry. Changes appear on the homepage immediately.
- Video entries are stored in `data/videos.json` (same JSON-file pattern as
  treatments/testimonials) — empty by default; the clinic adds real links.

**Instagram embed note:** the embed renders Meta’s public-post page in an
iframe. It needs the post/reel to be public; private accounts or region-
restricted posts will not render, in which case the card falls back to an
“Instagram pe dekho” link. If embeds ever stop rendering (Meta changes
their embed endpoint), links added in admin still work as outbound links.

## Bookings

Ids are sequential `DRB-0001`, `DRB-0002`, … and each booking carries a
short `token` for patient look-ups. New bookings start as `pending`.

## JSON-persistence caveat (important before production)

`data/*.json` is a Phase A convenience for single-instance hosting. On
serverless platforms (e.g. Vercel) the filesystem is **ephemeral between
cold starts and is not shared across instances** — two concurrent users
could read/write different copies. Before real traffic, move the store in
`lib/data.ts` to a real database (Postgres/Supabase/Firebase). The
function-level contract (`getSettings`, `addBooking`, …) is deliberately
narrow so the swap touches only that file.

## Integration points (Phase B — not live)

- **OTP:** `settings.otpMode` is `"demo"`; the MSG91 key field is a labelled
  placeholder. No SMS is sent.
- **Payments:** `settings.paymentMode` is `"pay-at-clinic"`; the
  Razorpay/UPI key field is a labelled placeholder. No payment is taken.
- **Slots:** `lib/slots.ts` is the single source of truth for availability —
  public booking UI must call `generateSlots`, never hand-roll windows.

## Seed data notes

- Phone/WhatsApp use clearly-marked placeholders (`9999999999` /
  `919999999999`) — **do not invent the clinic's real number**; it is
  replaced in Admin → Settings.
- `registration` is empty; the site footer should render “to be updated by
  clinic” when empty.
- All 3 testimonials are `sample: true` and the public UI must show a
  “Sample” badge until the clinic replaces them.
- No medical facts, credentials, experience years or patient counts are
  invented anywhere. Keep it that way.

## Design tokens

Calm clinical premium: paper `#FBFAF8`, ink `#1A1A1A`, deep emerald
`#0E5E4A` (CTAs, badges, active states), sparse gold `#C9A24B` for tiny
highlights only. Serif display (Tiro Devanagari Serif) + clean sans
(Mukta), both Devanagari-capable. **No gradients, no purple, no emojis in
the UI.** Mobile-first, generous whitespace.
