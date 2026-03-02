# JustDoIt - Discipline Task Tracker

A full-stack Next.js application for discipline-driven task execution.

Core behavior:
- Users create tasks with an `eodDeadline`.
- `MISSED` is derived when `status = PENDING` and current time passes `eodDeadline`.
- A background worker sends one missed-task email and marks `missedEmailSentAt`.
- Dashboard tracks missed tasks and streaks.
- Analytics shows completion and focus trends.

## Tech Stack
- Next.js 14+ App Router (current scaffold uses Next 16)
- TypeScript
- TailwindCSS
- SQLite (current local runtime fallback in this repo)
- Prisma ORM
- Auth.js (`next-auth`) credentials provider
- Resend (email)
- node-cron worker
- Recharts (analytics)
- Vitest (tests)

## Features
- Authentication: register/login/logout (credentials)
- Protected routes: `/dashboard`, `/tasks`, `/analytics`, `/profile`
- Task CRUD: create, update, delete, complete/reopen
- Derived status: `PENDING | COMPLETED | MISSED`
- Missed time indicator: `Missed by X`
- Worker: overdue pending tasks trigger one email
- Streaks:
  - `currentStreak` resets when newly missed tasks are processed
  - daily rollover increments streak on successful or no-task days
  - `longestStreak` tracked
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
3. No separate DB server required for current local setup

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create environment file:
   ```bash
   copy .env.example .env
   ```
3. Update `.env` values (auth secret, resend key).
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Initialize local database schema:
   ```bash
   npm run db:init-sqlite
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

## Worker Logic
Cron runs every minute and processes tasks where:
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
