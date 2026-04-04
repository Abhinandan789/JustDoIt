# Railway Deployment Guide for JustDoIt

## Prerequisites
- Railway account ([sign up here](https://railway.app))
- Project already created on Railway
- GitHub repository connected to Railway

## Deployment Steps

### 1. Database Setup (PostgreSQL)
If you haven't already set up a database:
1. Go to your Railway project dashboard
2. Click **+ New** 
3. Select **Database** → **PostgreSQL**
4. Railway will automatically create `DATABASE_URL` environment variable

### 2. Configure Environment Variables
In Railway dashboard, go to your **JustDoIt** service → **Variables** tab:

**Required Variables:**
```
# Database
DATABASE_URL=postgresql://[auto-populated by Railway]

# Authentication Secrets (generate random 32+ character strings)
AUTH_SECRET=[generate-random-secret]
NEXTAUTH_SECRET=[generate-random-secret]
CRON_SECRET=[generate-random-secret]

# URLs (replace with your Railway domain)
AUTH_URL=https://justdoit-production-[random].up.railway.app
NEXTAUTH_URL=https://justdoit-production-[random].up.railway.app
APP_BASE_URL=https://justdoit-production-[random].up.railway.app

# Email Service (Resend)
RESEND_API_KEY=[your-resend-api-key]
EMAIL_FROM=Task Reminder <onboarding@resend.dev>

# Environment
NODE_ENV=production
```

### 3. Trigger Deployment
1. Push code to your main/master branch
2. Railway automatically detects the push and starts building
3. Monitor the build in the **Deployments** tab
4. Once complete, your app will be live at the Railway URL

### 4. Verify Deployment
1. Check Railway **Deployments** tab for status (should show green checkmark)
2. Visit your app URL from the Railway domain
3. Check **Logs** tab for any runtime errors

## Troubleshooting

### App crashes on startup
- **Issue**: Missing DATABASE_URL
- **Fix**: Ensure PostgreSQL database is linked and DATABASE_URL is set in variables

### Auth pages show errors
- **Issue**: Missing AUTH_SECRET or NEXTAUTH_SECRET
- **Fix**: Generate random 32-character secrets and add to variables

### Database migrations fail
- **Issue**: Database not initialized
- **Fix**: Railway runs `npm run build` which includes `prisma generate`. First deployment may take longer.

### CORS or URL errors
- **Issue**: AUTH_URL/NEXTAUTH_URL don't match actual domain
- **Fix**: Update variables to match your Railway deployment domain

## Build Process
Railway uses the following build command (defined in `package.json`):
```bash
npm run build
```

This runs:
1. `prisma generate` - generates Prisma client
2. `next build` - builds Next.js app

## Start Command
Railway uses:
```bash
npm start
```

Which runs: `next start` - starts the production server

## Environment File Hierarchy
- `.env` - local development defaults
- `.env.local` - local overrides (git-ignored)
- `.env.production` - production defaults
- Railway **Variables** tab - production overrides (highest priority)

## Monitoring

### Check Logs
1. Go to your service in Railway
2. Click **Logs** tab
3. Filter by "Error" to find issues

### Check Metrics
1. Go to your service in Railway  
2. Click **Metrics** tab
3. Monitor CPU, memory, and request count

### Enable Debug Logs
Add to Railway variables:
```
DEBUG=prisma:*
```

## Zero-Downtime Deployments
- New code pulls automatically when you push to main
- Database migrations run automatically
- Old processes gracefully shutdown after new ones start
