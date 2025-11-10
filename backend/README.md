# Guardian Backend (Nest.js)

## Overview
Backend API for Guardian SaaS. Built with Nest.js, Prisma (Supabase PostgreSQL), and integrations (Stripe, Yousign, Brevo). Ready for Render/Railway.

## Requirements
- Node.js 18+
- PostgreSQL (Supabase)
- Redis (for future BullMQ jobs)

## Setup
1. Copy env
```
cp .env.example .env
```
2. Install deps
```
npm i
```
3. Prisma generate
```
npm run prisma:generate
```
4. Dev
```
npm run start:dev
```

## Environment
See `.env.example`.

## API Endpoints
- auth: POST /auth/login, POST /auth/register
- user: GET /user/profile, POST /user/upload-id
- mandate: POST /mandate/create, POST /mandate/sign
- scan: POST /scan/start, GET /scan/history
- deletion: POST /deletion/request, GET /deletion/status?id={id}
- subscription: POST /subscription/create, POST /subscription/webhook
- newsletter: POST /newsletter/subscribe
- admin: GET /admin/users, GET /admin/deletions, GET /admin/export

## Tests
```
npm test
```
