# Railway Environment Variables - Required for Production

## CRITICAL (App Won't Start Without These)

### DATABASE_URL
Railway should auto-inject this if you connected PostgreSQL plugin.
- Format: `postgresql://user:password@host:port/database?sslmode=require`
- If not set: Check Railway > PostgreSQL plugin connection

### NEXTAUTH_SECRET
Generate a random secret for NextAuth JWT signing:
```bash
# Generate on your local machine:
openssl rand -base64 32
```
Then set in Railway > Variables:
- Key: `NEXTAUTH_SECRET`
- Value: [Generated secret]

### NEXTAUTH_URL
Must be your production URL:
- Key: `NEXTAUTH_URL`
- Value: `https://justdoit-production-5a19.up.railway.app`

---

## IMPORTANT (App Works Better With These)

### AUTH_SECRET
Same as NEXTAUTH_SECRET or different if needed
- Key: `AUTH_SECRET`
- Value: [Same or different secret]

### APP_BASE_URL
Application base URL:
- Key: `APP_BASE_URL`
- Value: `https://justdoit-production-5a19.up.railway.app`

---

## OPTIONAL (Can Leave Empty)

- `RESEND_API_KEY` - Email sending (if not set, email features disabled)
- `EMAIL_FROM` - Email sender address
- `CRON_SECRET` - Scheduled job security

---

## How to Set Variables in Railway

1. Go to https://railway.app
2. Open JustDoIt project
3. Click "Variables" tab
4. Add each variable from the CRITICAL section above
5. Redeploy the application

The app will restart with the new environment variables.

---

## Debugging Checklist

- [ ] DATABASE_URL is set and points to PostgreSQL
- [ ] NEXTAUTH_SECRET is set (random 32+ character string)
- [ ] NEXTAUTH_URL is set to your production domain
- [ ] AUTH_SECRET is set
- [ ] APP_BASE_URL is set to production URL
- [ ] App has been redeployed after setting variables

If still not working:
1. Check Railway deployment logs for errors
2. Verify PostgreSQL database is accessible
3. Check that none of the critical variables are blank
