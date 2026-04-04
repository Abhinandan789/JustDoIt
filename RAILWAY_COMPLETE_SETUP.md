# Complete Railway Deployment Guide - WORKING SETUP

Your app built successfully but isn't running. Follow these steps to get it working.

## Step 1: Set Up PostgreSQL Connection

1. In Railway > JustDoIt project > "Plugins"
2. Add PostgreSQL (if not already added)
3. Wait for it to provision (2-3 minutes)

Railway auto-injects `DATABASE_URL` - no manual setup needed.

## Step 2: Generate NEXTAUTH_SECRET

Open your terminal and run:
```bash
openssl rand -base64 32
```

Copy the output (example: `aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890`)

## Step 3: Set Environment Variables in Railway

1. Go to https://railway.app
2. Open "JustDoIt" project
3. Click the "Variables" tab
4. Add these variables:

| Key | Value |
|-----|-------|
| `NEXTAUTH_SECRET` | [Paste the generated secret from Step 2] |
| `AUTH_SECRET` | [Paste the generated secret from Step 2] |
| `NEXTAUTH_URL` | `https://justdoit-production-5a19.up.railway.app` |
| `APP_BASE_URL` | `https://justdoit-production-5a19.up.railway.app` |
| `NODE_ENV` | `production` |

(Note: Replace the domain with your actual Railway app domain if different)

## Step 4: Redeploy the Application

1. In Railway > Deployments
2. Find the latest deployment (green checkmark means successful build)
3. Click "Redeploy" button
4. Wait 2-3 minutes for app to restart

## Step 5: Verify It Works

1. Go to https://justdoit-production-5a19.up.railway.app
2. You should see the login page
3. Check Railway logs if still getting errors

## Troubleshooting

### If still seeing "Failed to Load Page":

1. Check Railway > Environment tab - verify all 5 variables are set
2. Check Railway > Build Logs - look for build errors
3. Check Railway > Deploy Logs - look for startup errors
4. Check Railway > Runtime Logs - might show what's crashing

### If getting database errors:

1. Go to Railway > PostgreSQL plugin
2. Copy the `DATABASE_URL` value
3. In JustDoIt project > Variables, ensure `DATABASE_URL` exists
4. If missing: Paste the connection string there

### If getting NextAuth errors:

1. Verify `NEXTAUTH_SECRET` is set (not empty)
2. Verify `NEXTAUTH_URL` matches your production domain
3. Ensure both match exactly (trailing slash, protocol, etc.)

## Alternative: Manual Environment Setup

If Railway auto-inject doesn't work, manually set `DATABASE_URL`:

1. In Railway > PostgreSQL > Variables tab
2. Find the `DATABASE_URL`
3. Copy the full connection string
4. Go to JustDoIt project > Variables
5. Click "+" and add:
   - Key: `DATABASE_URL`
   - Value: [Paste the connection string]

---

## What These Variables Do

- **DATABASE_URL**: Connects to PostgreSQL for user data, tasks, sessions
- **NEXTAUTH_SECRET**: Signs JWT tokens for authentication
- **AUTH_SECRET**: Alternative/backup for auth (same or different)
- **NEXTAUTH_URL**: Tells NextAuth what your production domain is
- **APP_BASE_URL**: Used in redirects and links throughout the app
- **NODE_ENV**: Tells app it's in production mode

All are required for the app to function properly.

---

**Status**: Follow these steps and the app should load successfully.
**Expected**: You'll see login page after completing all steps above.
