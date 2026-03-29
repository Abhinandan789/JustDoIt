# Railway Deployment Guide - Complete Setup

## Step 1: Get Neon Database (5 mins)

1. Go to https://neon.tech (free tier)
2. Sign up → Click "Create Project"
3. Create PostgreSQL database (free tier)
4. Copy connection string from "Connection string" tab (looks like):
   ```
   postgresql://user:password@ep-xxx.neon.tech/justdoit?sslmode=require
   ```

## Step 2: Add to Railway Variables

**In Railway Dashboard → JustDoIt → Variables:**

Add/Update these:

```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/justdoit?sslmode=require
AUTH_SECRET=JustDoIt2026ProductionSecret12345
NEXTAUTH_SECRET=JustDoIt2026NextAuthSecret12345
NEXTAUTH_URL=https://justdoit-production-5a19.up.railway.app/
AUTH_URL=https://justdoit-production-5a19.up.railway.app/
APP_BASE_URL=https://justdoit-production-5a19.up.railway.app/
EMAIL_FROM=Task Reminder <onboarding@resend.dev>
CRON_SECRET=CronSecret2026Production12345
RESEND_API_KEY=
```

**Replace:**
- `postgresql://...` → Your Neon connection string
- `justdoit-production-5a19.up.railway.app` → Your actual Railway domain

## Step 3: Deploy

Railway auto-redeploys when you save variables (2-3 mins)

Then visit: **https://your-railway-domain.up.railway.app**

Login:
- Email: `test@example.com`
- Password: `TestPassword123`

## Done! ✅
