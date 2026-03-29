# Stripe Integration Guide

Complete setup for monetizing JustDoIt with Stripe subscription tiers.

## 📋 Prerequisites

- Stripe account (https://dashboard.stripe.com)
- Stripe CLI for local testing
- Environment variables configured

## 🔧 Setup Steps

### 1. Create Stripe Account

1. Go to https://stripe.com and create account
2. Complete identity verification
3. Navigate to Dashboard → API keys
4. Copy your **Publishable Key** and **Secret Key**

### 2. Create Pricing Plans in Stripe Dashboard

Log into Stripe Dashboard and create three products:

#### Plan 1: Free Tier (No Stripe Product)
- Hardcoded in application
- 50 tasks limit
- No payment required

#### Plan 2: Pro Tier
1. Go to Products → Create product
2. Name: "JustDoIt Pro"
3. Recurring pricing:
   - Price: $9.99/month
   - Billing interval: Monthly
   - Copy the **Price ID** (starts with `price_`)

#### Plan 3: Enterprise Tier
1. Go to Products → Create product
2. Name: "JustDoIt Enterprise"
3. Recurring pricing:
   - Price: $99.99/month
   - Billing interval: Monthly
   - Copy the **Price ID**

### 3. Set Environment Variables

Add to `.env.production`:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxx

# Stripe Price IDs
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxxxxxxx

# Stripe webhook (generated after setup)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
```

For local development, use `.env.local` with test keys (available in Dashboard → API keys → View test data).

### 4. Set Up Webhook Endpoint

1. Go to Stripe Dashboard → Webhooks
2. Click **Add an endpoint**
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Copy the **Webhook Signing Secret**
6. Add to environment variables as `STRIPE_WEBHOOK_SECRET`

### 5. Set Up Stripe CLI for Local Testing

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Windows (via Scoop)
scoop install stripe

# Or download from https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to local development server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret and add to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxxxxxxx
```

## 💳 Integration Features

### 1. Checkout Page
- Hosted checkout at `/api/checkout`
- Handles subscription creation
- Redirects to dashboard on success

### 2. Billing Portal
- Customer self-service at `/api/billing-portal`
- Allows users to manage subscriptions
- View invoices, update payment methods

### 3. Webhook Handler
- Listens for subscription events
- Automatically updates user tier in database
- Handles payment failures

### 4. Pricing Plans Component
```typescript
import { SubscriptionPlans } from "@/components/SubscriptionPlans";

export default function PricingPage() {
  return (
    <SubscriptionPlans
      currentTier="FREE"
      onUpgrade={upgradeSubscription}
    />
  );
}
```

### 5. Server Actions
```typescript
import { upgradeSubscription, manageBilling } from "@/actions/billing-actions";

// Upgrade to Pro
const checkoutUrl = await upgradeSubscription(proPriceId);
window.location.href = checkoutUrl;

// Manage subscription
const portalUrl = await manageBilling();
window.location.href = portalUrl;
```

## 🧪 Testing

### Test Credit Cards

Use these cards in test mode (Stripe Dashboard must be in test mode):

| Scenario | Card Number | Exp | CVC |
|----------|-------------|-----|-----|
| Successful | 4242 4242 4242 4242 | 04/26 | 242 |
| Declined | 4000 0000 0000 0002 | 04/26 | 242 |
| Requires Auth (3D Secure) | 4000 0025 0000 3155 | 04/26 | 242 |

### Local Testing Workflow

```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded

# Use test cards on checkout page
```

### Test User Upgrade Flow

1. Login to application
2. Go to `/profile` → Subscription plans
3. Click "Upgrade to Pro"
4. Use test card: 4242 4242 4242 4242
5. Complete checkout
6. Verify database updated: `SELECT tier FROM "User" WHERE id = 'test_user'`

## 📊 Monitoring

### Check Subscription Status

```bash
# List all subscriptions
stripe subscriptions list

# Get specific subscription
stripe subscriptions retrieve sub_xxxxx

# Retrieve customer
stripe customers retrieve cus_xxxxx
```

### Monitor Webhook Deliveries

1. Stripe Dashboard → Webhooks
2. Select your endpoint
3. View recent events and delivery logs
4. Check for failed deliveries (retry if needed)

### Database Queries

```sql
-- Users by subscription tier
SELECT tier, COUNT(*) FROM "User" GROUP BY tier;

-- Active subscriptions
SELECT id, email, tier, "subscriptionExpiresAt" FROM "User" 
WHERE tier != 'FREE' AND "subscriptionExpiresAt" > NOW();

-- Expired subscriptions (should be downgraded to FREE)
SELECT id, email, tier FROM "User" 
WHERE tier != 'FREE' AND "subscriptionExpiresAt" < NOW();
```

## 🔐 Security Best Practices

### 1. Webhook Signature Verification
✅ Already implemented in `lib/stripe.ts`:
```typescript
event = stripe.webhooks.constructEvent(body, signature, secret);
```

### 2. API Key Protection
- Use environment variables (never hardcode)
- Rotate keys regularly
- Use restricted keys when possible

### 3. HTTPS Only
- All requests encrypted in transit
- Vercel provides automatic HTTPS
- Self-hosted: Use Let's Encrypt

### 4. PCI Compliance
- Never store card details (Stripe handles this)
- Use Stripe-hosted checkout (no payment data on your servers)
- Use Stripe Elements for custom UI

### 5. Rate Limiting
Add rate limiting to API endpoints:
```typescript
// Use middleware or external service like Redis
// Recommend: 100 requests/minute per user for checkout
// Recommend: 10 requests/minute per user for billing portal
```

## 📝 Database Schema Updates

The `User` model already includes subscription fields:

```prisma
model User {
  // ... existing fields
  tier              String  @default("FREE") // "FREE" | "PRO" | "ENTERPRISE"
  stripeCustomerId  String?
  subscriptionExpiresAt DateTime?
  tasksLimit        Int? // null = unlimited
}
```

Migration already applied in Phase 4.

## 🚀 Production Checklist

- [ ] Stripe account created and verified
- [ ] API keys in `.env.production`
- [ ] Price IDs created and configured
- [ ] Webhook endpoint configured
- [ ] Webhook signing secret in `.env.production`
- [ ] SSL certificate configured (https://yourdomain.com)
- [ ] Database backups enabled
- [ ] Test full upgrade flow with real card (contact Stripe)
- [ ] Monitor webhook deliveries
- [ ] Set up alerts for failed payments
- [ ] Document user payment support process

## 🆘 Troubleshooting

### "Webhook signature verification failed"
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook secret matches Stripe dashboard
- Ensure webhook is forwarded to correct endpoint

### "Payment succeeded but tier not updated"
- Check webhook is receiving events: Stripe Dashboard → Webhooks → View events
- Verify database connection in webhook handler
- Check logs for errors: `lib/logger.ts` outputs JSON

### "Checkout session creation fails"
- Verify `STRIPE_PRO_PRICE_ID` and `STRIPE_ENTERPRISE_PRICE_ID` are set
- Confirm price IDs exist in Stripe dashboard
- Check `STRIPE_SECRET_KEY` is valid

### "Users not downgrading when subscription expires"
- Stripe webhook should auto-downgrade on cancellation
- Manual query to check: `SELECT * FROM "User" WHERE tier = 'PRO' AND "subscriptionExpiresAt" < NOW();`
- Add cron job to check and downgrade if needed

## 📚 Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe SDK for Node.js](https://github.com/stripe/stripe-node)
- [Stripe CLI Guide](https://stripe.com/docs/stripe-cli)
- [Next.js Stripe Integration](https://stripe.com/docs/payments/checkout/build-with-nextjs)
- [PCI Compliance Guide](https://stripe.com/docs/security/pci-compliance)

---

**Last Updated**: March 29, 2026  
**Version**: 1.0 - Production Ready
