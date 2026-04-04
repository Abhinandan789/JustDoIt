# DEPLOYMENT CHECKLIST - PRINT THIS AND CHECK OFF ITEMS

## Pre-Deployment (Do BEFORE Starting)
- [ ] I have a Railway account (railway.app)
- [ ] I am logged into Railway
- [ ] I can see my JustDoIt project in Railway
- [ ] I have a text editor open for copying values

## Step 1: Create PostgreSQL Database
- [ ] Click "+ New" in Railway dashboard
- [ ] Click "Database"
- [ ] Click "PostgreSQL"
- [ ] Wait for creation (watch loading bar)
- [ ] CHECK: DATABASE_URL now appears in Variables ✓

## Step 2: Get Secrets
- [ ] Open PowerShell
- [ ] Run: [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 256) }))
- [ ] Copy result → This is your SECRET1
- [ ] Run the same command again
- [ ] Copy result → This is your SECRET2
- [ ] Run the same command one more time
- [ ] Copy result → This is your SECRET3

## Step 3: Get Your Domain
- [ ] In Railway, go to Deployments tab
- [ ] Look for domain like: justdoit-xxxxx.up.railway.app
- [ ] Copy it → This is YOUR_DOMAIN

## Step 4: Add Variables to Railway
In Railway Variables tab, add each variable (copy-paste exactly):

### Variable 1
- [ ] Name: AUTH_SECRET
- [ ] Value: (paste SECRET1)
- [ ] Click Save

### Variable 2
- [ ] Name: NEXTAUTH_SECRET
- [ ] Value: (paste SECRET1 - SAME as above)
- [ ] Click Save

### Variable 3
- [ ] Name: CRON_SECRET
- [ ] Value: (paste SECRET2)
- [ ] Click Save

### Variable 4
- [ ] Name: AUTH_URL
- [ ] Value: https://justdoit-YOUR_DOMAIN.up.railway.app
- [ ] (Replace YOUR_DOMAIN with actual domain)
- [ ] Click Save

### Variable 5
- [ ] Name: NEXTAUTH_URL
- [ ] Value: https://justdoit-YOUR_DOMAIN.up.railway.app
- [ ] (Replace YOUR_DOMAIN with actual domain)
- [ ] Click Save

### Variable 6
- [ ] Name: APP_BASE_URL
- [ ] Value: https://justdoit-YOUR_DOMAIN.up.railway.app
- [ ] (Replace YOUR_DOMAIN with actual domain)
- [ ] Click Save

### Variable 7
- [ ] Name: NODE_ENV
- [ ] Value: production
- [ ] Click Save

## Step 5: Deploy
- [ ] Go to Deployments tab
- [ ] Watch build progress
- [ ] CHECK: Green checkmark appears
- [ ] Click the domain link

## Step 6: Verify
- [ ] JustDoIt login page loads
- [ ] Click "Register"
- [ ] Create a test account
- [ ] Login successful

## SUCCESS!
- [ ] App is running at: https://justdoit-YOUR_DOMAIN.up.railway.app
- [ ] You can now start using JustDoIt

---

If you get stuck on any step, check DEPLOYMENT_VERIFICATION.md for help.
