# Lobby

A premium waiting room with a shared check-in portal for Roman and Kai.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env and add Supabase credentials:

```bash
cp .env.example .env.local
```

3. Create the database table — in your [Supabase](https://supabase.com) project, open **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).

4. Add to `.env.local` (from Supabase **Project Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Use the **service role** key (server-only). Never expose it in client code.

5. Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase env vars, check-ins fall back to `.data/checkins.json` during local development.

## Deploy to Vercel

1. Push to GitHub and import the repo in [Vercel](https://vercel.com).
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in **Project Settings → Environment Variables**.
3. Run `supabase/schema.sql` in your Supabase project if you haven't already.

## Pages

- `/` — Waiting room
- `/lobby` — Check-in portal for Roman and Kai
