# Lobby

A premium waiting room with a shared check-in portal for Roman and Kai.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env and set your Google Meet link:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_MEET_LINK=https://meet.google.com/your-actual-link
```

3. Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Check-ins are stored locally in `.data/checkins.json` during development.

## Deploy to Vercel

1. Push to GitHub and import the repo in [Vercel](https://vercel.com).
2. Add `NEXT_PUBLIC_MEET_LINK` in Project Settings → Environment Variables.
3. **For shared check-ins in production**, add a [Vercel KV](https://vercel.com/docs/storage/vercel-kv) store to the project. Vercel will inject `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.

Without KV, check-ins won't persist across serverless instances in production.

## Pages

- `/` — Waiting room with Meet link
- `/lobby` — Check-in portal for Roman and Kai
