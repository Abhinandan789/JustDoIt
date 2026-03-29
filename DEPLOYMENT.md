# Production Deployment Guide

JustDoIt is production-ready with comprehensive security, performance optimization, and monitoring. Follow this guide to deploy safely.

## 📋 Pre-Deployment Checklist

- [ ] All 30 tests passing locally (`npm run test`)
- [ ] Production build succeeds (`npm run build`)
- [ ] All environment variables configured (see below)
- [ ] PostgreSQL production database created
- [ ] Stripe account and API keys ready
- [ ] Email service (Resend) configured
- [ ] Monitoring services configured (optional but recommended)
- [ ] Code review completed on deployment PR
- [ ] Database backups configured

## 🔐 Environment Variables

Create `.env.production` in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@prod-db.example.com/justdoit

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://yourdomain.com

# Email Service (Resend.com)
RESEND_API_KEY=re_your_api_key_here

# CRON Job Security (generate with: openssl rand -base64 32)
CRON_SECRET=your-generated-cron-secret-here

# Stripe (for subscription tiers)
STRIPE_SECRET_KEY=sk_live_your_stripe_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Monitoring
DATADOG_API_KEY=your_datadog_key_here
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Generate Secrets Securely

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate CRON HMAC secret
openssl rand -base64 32
```

## 📦 Database Setup

### 1. Create Production PostgreSQL Database

```bash
# Using managed service (e.g., AWS RDS, Vercel Postgres, Railway)
# Create a PostgreSQL 14+ database
# Note the connection string for DATABASE_URL
```

### 2. Run Migrations

```bash
# Set DATABASE_URL to production database
export DATABASE_URL="postgresql://user:pass@host/justdoit"

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db execute --stdin < prisma/seed.ts  # Optional: seed test data
```

### 3. Verify Database Connection

```bash
npx prisma studio  # GUI to verify schema
```

## 🚀 Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

Vercel is already configured with `vercel.config.ts`.

```bash
# Install Vercel CLI
npm i -g vercel

# Link to project
vercel link

# Deploy to staging environment
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add RESEND_API_KEY
vercel env add CRON_SECRET
# ... add all env variables

# Deploy to production
vercel deploy --prod
```

### Option 2: Deploy to Self-Hosted Server

```bash
# Build the application
npm run build

# Start production server
NODE_ENV=production npm start

# Or use PM2 for process management
npm i -g pm2
pm2 start "npm start" --name justdoit --env production
pm2 save
pm2 startup
```

### Option 3: Deploy with Docker

Create `Dockerfile` in root:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t justdoit:latest .
docker run -p 3000:3000 --env-file .env.production justdoit:latest
```

## 🔒 Security Configuration

### 1. HTTPS/SSL
- ✅ Vercel: Automatic HTTPS
- Self-hosted: Use reverse proxy (nginx) with Let's Encrypt

### 2. CORS Headers
Already configured in middleware for API endpoints

### 3. CRON Endpoint Protection
- HMAC-SHA256 validation enabled
- Only requests with valid X-Signature header accepted
- IP logging for unauthorized attempts

Set CRON_SECRET in production environment.

### 4. Database Connection
- PostgreSQL connection pooling enabled via Prisma
- Use connection string with SSL: `postgresql://...?sslmode=require`

### 5. NextAuth Configuration
- JWT tokens secure and signed with NEXTAUTH_SECRET
- Cookies marked as Secure and HttpOnly
- CSRF protection enabled

## 📊 CRON Job Setup

Schedule tasks via external CRON service or GitHub Actions.

### Using GitHub Actions (Free)

Create `.github/workflows/cron.yml`:

```yaml
name: CRON Jobs

on:
  schedule:
    - cron: '0 14 * * *'  # Daily at 14:00 UTC (adjust for your timezone)

jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run reminder CRON
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
          CRON_HMAC_SECRET: ${{ secrets.CRON_HMAC_SECRET }}
        run: |
          curl -X POST https://yourdomain.com/api/cron/reminders \
            -H "Content-Type: application/json" \
            -H "X-Signature: $(echo -n '' | openssl dgst -sha256 -hmac $CRON_HMAC_SECRET -binary | base64)" \
            -d '{}'
```

### Using External CRON Service

1. EasyCron.com, cron-job.org, or similar
2. POST to `https://yourdomain.com/api/cron/reminders`
3. Add X-Signature header with HMAC-SHA256 of request body

## 📈 Performance & Monitoring

### Database Performance
- ✅ 5 composite indexes deployed
- Query profiling: `EXPLAIN ANALYZE` on slow queries
- Connection pool size: 20 (Prisma default, increase for high traffic)

### Application Monitoring

#### Option 1: Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
```

Initialize in `app/layout.tsx`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### Option 2: Datadog (APM)
```bash
npm install dd-trace
```

Initialize before app starts:
```typescript
const tracer = require('dd-trace').init({
  service: 'justdoit',
  env: process.env.NODE_ENV,
});
```

#### Option 3: CloudWatch (AWS)
```bash
npm install aws-sdk
```

Logger already outputs JSON for CloudWatch parsing (see `lib/logger.ts`).

### Structured Logging
All logs are JSON-formatted in production for easy parsing:
```json
{
  "level": "info",
  "message": "Email processing completed",
  "timestamp": "2026-03-29T14:30:00Z",
  "meta": {
    "succeeded": 42,
    "failed": 2,
    "durationMs": 3421
  }
}
```

## 🧪 Pre-Production Testing

### 1. Load Testing
```bash
npm install -g artillery

# Create loadtest.yml
artillery quick --count 100 --num 1000 https://yourdomain.com/dashboard
```

### 2. Security Testing
```bash
npm audit  # Check dependencies
npm audit fix  # Fix vulnerabilities
```

### 3. Database Integrity
```bash
# Check for orphaned records
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tasks WHERE \"userId\" NOT IN (SELECT id FROM \"User\");"
```

## 🔄 Post-Deployment

### 1. Verify Health
- Access https://yourdomain.com → Should load login page
- Login with test account → Should access dashboard
- Test task creation → Verify database write
- Check structured logs → Should see JSON output

### 2. Monitor Metrics
- Response times: < 1s for dashboard
- Database queries: < 100ms typical
- Error rate: < 0.1%
- CRON job success: 100%

### 3. Backup Configuration
```bash
# Enable automated backups
# PostgreSQL: Weekly snapshots (7-day retention minimum)
# Application: Git commits + GitHub backup
```

## 🔄 Rollback Plan

```bash
# If deployment fails, return to previous version
git revert HEAD
npm run build
vercel deploy --prod  # or redeploy previous Docker image
```

## 📞 Support & Debugging

### Common Issues

**"NEXTAUTH_SECRET is not set"**
- Ensure `.env.production` has NEXTAUTH_SECRET
- Restart application after env changes

**"Database connection refused"**
- Verify DATABASE_URL is correct
- Check firewall rules allow inbound traffic
- Ensure PostgreSQL is running

**"Prisma Client generation failed"**
- Delete `node_modules/.prisma`
- Run `npx prisma generate`
- Rebuild application

**"CRON job returns 401"**
- Verify CRON_SECRET matches X-Signature header
- Check CRON service can reach your domain (no firewall blocks)

### Logs Location
- Vercel: https://vercel.com/dashboard → Logs tab
- Self-hosted: `pm2 logs` or docker logs
- Application: Check `/var/log/justdoit.log` or stdout

## 🎯 Feature Flags (Monetization)

Subscription tiers are configured in `lib/feature-gates.ts`:

- **FREE**: 50 tasks, no API access
- **PRO**: Unlimited tasks, basic API
- **ENTERPRISE**: Custom limits, full API

Update user tier in database:
```sql
UPDATE "User" SET tier = 'PRO' WHERE id = 'user_id';
```

## 📊 Operations Dashboard

Monitor key metrics:
- Active users: `SELECT COUNT(DISTINCT "userId") FROM "Task" WHERE "createdAt" > NOW() - INTERVAL '7 days';`
- Failed emails: `SELECT COUNT(*) FROM "Task" WHERE missedEmailSentAt IS NULL AND eodDeadline < NOW();`
- Average response time: Check application logs
- Database pool usage: `SELECT count(*) FROM pg_stat_activity;`

## 🚨 Incident Response

**Email delivery down:**
1. Check RESEND_API_KEY validity
2. Monitor retry queue: `lib/retry-queue.ts` handles 3x retries
3. Manual retry: Re-run CRON job

**Database performance degradation:**
1. Check slow query log: `SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;`
2. Verify indexes exist: `\d+ task` in psql
3. Scale read replicas if needed

**Authentication issues:**
1. Verify NEXTAUTH_SECRET matches across instances
2. Check database connection
3. Clear session database: Check Prisma session storage

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Production](https://next-auth.js.org/deployment)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)
- [Resend Email Docs](https://resend.com/docs)

---

**Last Updated**: March 29, 2026  
**Version**: 1.0 - Production Ready
