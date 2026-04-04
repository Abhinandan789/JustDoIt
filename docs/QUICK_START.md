# 🚀 Quick Start Guide - JustDoIt

Get JustDoIt running locally in 5 minutes.

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **PostgreSQL** 14+ ([download](https://www.postgresql.org/download/)) or use [Docker](https://www.docker.com/)
- **Git** ([download](https://git-scm.com/))

## Quick Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd JustDoIt
npm install
```

### 2. Setup Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb justdoit_dev

# Set connection string in .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/justdoit_dev"

# Run migrations
npx prisma migrate deploy
```

**Option B: Docker PostgreSQL**
```bash
docker run --name justdoit-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=justdoit_dev \
  -p 5432:5432 \
  -d postgres:15

# Then set in .env.local:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/justdoit_dev"
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your values
# At minimum, set:
# - DATABASE_URL
# - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
# - NEXTAUTH_URL=http://localhost:3000
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 → You should see the login page ✅

### 5. Create Test Account

1. Click "Register"
2. Enter:
   - Email: `test@example.com`
   - Password: `Test123!`
3. Click "Sign up"
4. Access dashboard → Create a task

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode

# Database
npm run prisma:migrate  # Create new migration
npm run db:push         # Push schema to DB (dev only)
npm run prisma:seed     # Seed test data

# Production
npm run build           # Build for production
npm start               # Start production server
npm run worker          # Run email worker

# Code Quality
npm run lint            # Check for linting issues
```

---

## 🧪 Verify Installation

```bash
# Run tests (should show 30/30 pass)
npm run test

# Build (should succeed in ~30-45s)
npm run build

# Check for errors
npm run lint
```

---

## 🔑 Create Admin User (Optional)

```bash
npx prisma studio    # Opens GUI database editor
# Navigate to User table
# Create new user with:
# - email: admin@example.com
# - password: (hash with bcryptjs online or just use test)
# - timezone: UTC
# - tier: ENTERPRISE
```

---

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Public auth routes
│   ├── (protected)/       # Protected routes
│   └── api/               # API endpoints
├── lib/                   # Utilities & services
│   ├── auth.ts           # NextAuth setup
│   ├── prisma.ts         # Prisma client
│   └── stripe.ts         # Stripe integration
├── components/            # React components
├── prisma/               # Database schema & migrations
├── tests/                # Unit tests
└── public/               # Static assets
```

---

## 🛠️ Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
rm -rf node_modules
npm install
npx prisma generate
```

### "Database connection refused"
```bash
# Check PostgreSQL is running
psql postgres

# Verify DATABASE_URL in .env.local is correct
# Format: postgresql://user:password@host:5432/database
```

### "NEXTAUTH_SECRET is not set"
```bash
# Generate a secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=your_generated_secret

# Restart dev server
```

### "Tests failing"
```bash
# Make sure your database is clean
npx prisma migrate reset  # Resets to clean state

# Then run tests
npm run test
```

### "Port 3000 already in use"
```bash
# Use different port
npm run dev -- -p 3001
```

---

## 📊 Next Steps

1. **Explore the code**: Check [lib/](lib/) and [app/](app/) directories
2. **Run tests**: `npm run test` to verify everything works
3. **Create tasks**: Build some test tasks in the dashboard
4. **Check analytics**: View 7-day analytics on dashboard
5. **Test email**: Missed tasks trigger email reminders
6. **Read docs**: Check [README.md](README.md) for full feature list

---

## 🚀 Ready to Deploy?

Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide for production setup:
- Set up Stripe for payments
- Configure monitoring (Sentry, Datadog)
- Deploy to Vercel or your hosting
- Set up CRON jobs for reminders

---

## 📞 Need Help?

- **Questions**: Check [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
- **Stripe setup**: See [STRIPE_SETUP.md](STRIPE_SETUP.md)
- **Monitoring**: See [MONITORING.md](MONITORING.md)
- **Issues**: Create GitHub issue with error output

---

**Happy coding! 🎉**
