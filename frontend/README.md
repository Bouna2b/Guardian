# Guardian Frontend (Next.js 14)

## Overview
Next.js 14 App Router app styled with Tailwind. Connects to Guardian API at `NEXT_PUBLIC_API_URL`.

## Setup
```
cd frontend
npm i
cp .env.local.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_KEY, NEXT_PUBLIC_API_URL
npm run dev
```

## Structure
- `app/` pages: landing, onboarding, dashboard, admin, settings, pricing
- `app/api/`: subscribe, upload, mandate
- `components/`: layout, ui, dashboard, onboarding
- `lib/`: `supabaseClient`, `apiClient`, `utils`
- `styles/globals.css`

## Notes
- Newsletter route posts to Brevo when `BREVO_API_KEY` is set.
- Upload/mandate API routes forward requests to backend `NEXT_PUBLIC_API_URL`.
- For auth-protected pages (dashboard/admin/settings), add Supabase auth and Next middleware.
