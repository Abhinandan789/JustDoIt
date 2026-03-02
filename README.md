# JustDoIt - Discipline Task Tracker

A full-stack Next.js application for discipline-driven task execution.

Core behavior:
- Users create tasks with an `eodDeadline`.
- `MISSED` is derived when `status = PENDING` and current time passes `eodDeadline`.
- A worker job sends one missed-task email and marks `missedEmailSentAt`.
- Dashboard tracks missed tasks and streaks.
- Analytics shows completion and focus trends.

## Tech Stack
- Next.js 14+ App Router (current scaffold uses Next 16)
- TypeScript
- TailwindCSS
- PostgreSQL
- Prisma ORM
- Auth.js (`next-auth`) credentials provider
- Resend (email)
- node-cron worker (local/dev)
- Vercel Cron + API route (production)
- Recharts (analytics)
- Vitest (tests)

## Features
- Authentication: register/login/logout (credentials)
- Protected routes: `/dashboard`, `/tasks`, `/analytics`, `/profile`
- Task CRUD: create, update, delete, complete/reopen
- Derived status: `PENDING | COMPLETED | MISSED`
- Missed time indicator: `Missed by X`
- Missed-task email notification (one-time send)
- Streak system:
  - resets to `0` when tasks become missed
  - daily rollover increments on successful/no-task days
  - tracks `longestStreak`
- Analytics metrics:
  - completed today
  - completed this week
  - average completion time
  - completion rate
  - missed tasks count
- Focus timer:
  - 25/5 Pomodoro
  - logs `FocusSession`

## Project Structure
```text
app/
  (auth)/login
  (auth)/register
  (protected)/dashboard
  (protected)/tasks
  (protected)/tasks/new
  (protected)/tasks/[id]
  (protected)/analytics
  (protected)/profile
  api/auth/[...nextauth]
  api/cron/reminders
actions/
components/
lib/
worker/
prisma/
utils/
tests/
```

## Prerequisites
1. Node.js 20+
2. npm
3. PostgreSQL database

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create environment file:
   ```bash
   copy .env.example .env
   ```
3. Update `.env` values (database URL, auth secret, resend key).
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Apply schema to database:
   ```bash
   npm run db:push
   ```
6. (Optional) seed demo user:
   ```bash
   npm run prisma:seed
   ```

## Run Locally
1. Start Next.js app:
   ```bash
   npm run dev
   ```
2. Start reminder worker in a second terminal:
   ```bash
   npm run worker
   ```
3. Open `http://localhost:3000`

## Production (Vercel)
1. Set Vercel env vars:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXTAUTH_SECRET`
   - `AUTH_URL`
   - `NEXTAUTH_URL`
   - `APP_BASE_URL`
   - `EMAIL_FROM`
   - `RESEND_API_KEY` (optional, but required for email sending)
   - `CRON_SECRET`
2. Apply Prisma schema to your production database:
   ```bash
   npm run prisma:migrate:deploy
   ```
3. Vercel cron invokes:
   - `GET /api/cron/reminders` every minute
   - guarded with `Authorization: Bearer <CRON_SECRET>`

## Worker Logic
The reminders job runs every minute and processes tasks where:
- `status = PENDING`
- `missedEmailSentAt IS NULL`
- `eodDeadline <= now`

For each matched task:
1. Send `Task Not Completed` email via Resend.
2. On success, set `missedEmailSentAt`.
3. Reset user `currentStreak` to `0`.

## Testing
Run tests:
```bash
npm run test
```

Covered:
- authentication credential verification
- task CRUD server action behavior
- MISSED detection
- worker behavior and safety
- email sending logic
- focus session logging
- streak helper logic

## Notes
- No AI features/endpoints/dependencies are included.
- `MISSED` is intentionally derived in code, not stored as a DB enum value.
- With Next.js 16, `middleware.ts` is still supported but warns to migrate to `proxy.ts` in the future.
