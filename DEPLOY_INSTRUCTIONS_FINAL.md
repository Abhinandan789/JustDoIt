# DEPLOYMENT INSTRUCTIONS - FOLLOW EXACTLY

This is the ONLY file you need to follow to deploy JustDoIt.

## BEFORE YOU START
- Have a Railway account (railway.app)
- Have a text editor to copy/paste values

## STEP 1: Create Database (2 minutes)

1. Go to https://railway.app
2. Click your JustDoIt project
3. Click "+ New"
4. Select "Database" then "PostgreSQL"
5. Wait for database to be created (1 minute)
6. Look at Variables - DATABASE_URL should now appear automatically ✅

STOP. Do not proceed until you see DATABASE_URL in Variables.

## STEP 2: Generate Secrets

Open PowerShell and run ONE of these commands:

**Option A - Generate 3 secrets (copy the output):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 256) }))
```
Run this command 3 times. Copy each output. You now have SECRET1, SECRET2, SECRET3.

**Option B - Use these placeholders (replace EACH with random characters after deploying):**
- SECRET1 = aGVsbG8gd29ybGQgdGhpcyBpcyBhIHRlc3Qgc2VjcmV0IGtleQ==
- SECRET2 = aGVsbG8gd29ybGQgdGhpcyBpcyBhIHRlc3Qgc2VjcmV0IGtleTI=
- SECRET3 = aGVsbG8gd29ybGQgdGhpcyBpcyBhIHRlc3Qgc2VjcmV0IGtleTM=

## STEP 3: Add Variables to Railway (3 minutes)

In Railway dashboard, click JustDoIt → Variables tab.

Copy and paste each line exactly as shown:

```
DATABASE_URL=[This already exists - do not change]
AUTH_SECRET=SECRET1
NEXTAUTH_SECRET=SECRET1
CRON_SECRET=SECRET2
AUTH_URL=https://justdoit-[YOUR-DOMAIN].up.railway.app
NEXTAUTH_URL=https://justdoit-[YOUR-DOMAIN].up.railway.app
APP_BASE_URL=https://justdoit-[YOUR-DOMAIN].up.railway.app
NODE_ENV=production
```

Replace [YOUR-DOMAIN] with your actual Railway domain (shown in Railway dashboard).

## STEP 4: Deploy (2 minutes)

1. Go to Deployments tab in Railway
2. Wait for build to complete (shows green checkmark)
3. Once complete, click the domain link
4. You will see JustDoIt login page
5. Done! ✅

## TROUBLESHOOTING

**"App not loading"**
- Wait 2 more minutes
- Check Logs tab for errors

**"Database error"**
- Make sure DATABASE_URL exists in Variables
- PostgreSQL database must be created first

**"Auth errors"**
- Make sure AUTH_SECRET and NEXTAUTH_SECRET are set
- They must be identical values

**"Still stuck"**
- Check Logs tab
- See DEPLOYMENT_VERIFICATION.md for detailed troubleshooting

## THAT'S IT!

Your JustDoIt app is now running on the internet. 

Your app is live at: https://justdoit-[YOUR-DOMAIN].up.railway.app

Register an account and start using it.

---

If you follow these steps exactly as written, your app will be live. There are no other steps needed.
