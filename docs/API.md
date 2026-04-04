# 📚 API Documentation - JustDoIt

Complete REST API reference for JustDoIt.

---

## Authentication

All endpoints (except `/login`, `/register`, `/api/cron/*`, `/api/webhooks/*`) require authentication via NextAuth session.

### Login

```http
POST /api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

email=user@example.com&password=password123
```

**Response**: Sets `next-auth.session-token` cookie

---

## 📋 Tasks API

### Create Task

```http
POST /api/actions (Server Action)

{
  "title": "Finish report",
  "description": "Q1 financial report",
  "eodDeadline": "2026-03-30T17:00:00Z",
  "timezone": "America/New_York"
}
```

**Response**:
```json
{
  "id": "task_123",
  "userId": "user_1",
  "title": "Finish report",
  "status": "PENDING",
  "createdAt": "2026-03-29T10:00:00Z",
  "eodDeadline": "2026-03-30T17:00:00Z"
}
```

**Errors**:
- 401: Unauthorized
- 400: Invalid input
- 403: FREE tier limit reached (50 tasks) → Upgrade prompt shown

### List Tasks (with Pagination)

```http
GET /api/tasks?cursor=xxx&limit=25

# First page: no cursor
GET /api/tasks?limit=25

# Next page: use cursor from previous response
GET /api/tasks?cursor=eyJpZCI6InRhc2tfMzAifQ&limit=25
```

**Response**:
```json
{
  "tasks": [
    {
      "id": "task_1",
      "title": "Task title",
      "status": "PENDING",
      "eodDeadline": "2026-03-30T17:00:00Z",
      "createdAt": "2026-03-29T10:00:00Z"
    }
  ],
  "nextCursor": "eyJpZCI6InRhc2tfMjUifQ",
  "hasMore": true,
  "total": 142
}
```

**Query Parameters**:
- `cursor` (string, optional): Pagination cursor
- `limit` (number, optional): Items per page (1-100, default 25)
- `status` (string, optional): "PENDING", "COMPLETED", "ARCHIVED"

### Get Task Detail

```http
GET /api/tasks/:id
```

**Response**:
```json
{
  "id": "task_1",
  "title": "Finish report",
  "description": "Q1 report",
  "status": "PENDING",
  "eodDeadline": "2026-03-30T17:00:00Z",
  "createdAt": "2026-03-29T10:00:00Z",
  "user": {
    "id": "user_1",
    "email": "user@example.com"
  }
}
```

### Update Task

```http
PATCH /api/actions (Server Action)

{
  "id": "task_1",
  "title": "Updated title",
  "status": "COMPLETED"
}
```

### Delete Task

```http
DELETE /api/actions (Server Action)

{
  "id": "task_1"
}
```

---

## ⏱️ Focus Sessions API

### Start Focus Session

```http
POST /api/focus-sessions (Server Action)

{
  "taskId": "task_1",
  "durationMinutes": 25
}
```

**Response**:
```json
{
  "id": "session_1",
  "taskId": "task_1",
  "duration": 25,
  "startedAt": "2026-03-29T10:00:00Z",
  "status": "ACTIVE"
}
```

### Complete Focus Session

```http
PATCH /api/focus-sessions/:id (Server Action)

{
  "completed": true
}
```

---

## 📊 Analytics API

### Get 7-Day Analytics

```http
GET /api/analytics?timezone=America/New_York
```

**Response**:
```json
{
  "data": [
    {
      "date": "2026-03-23",
      "tasksCompleted": 5,
      "focusMinutes": 147
    },
    {
      "date": "2026-03-24",
      "tasksCompleted": 3,
      "focusMinutes": 89
    }
  ],
  "totalCompleted": 28,
  "totalFocusMinutes": 987,
  "averagePerDay": 4,
  "streak": 7
}
```

**Query Parameters**:
- `timezone` (string, optional): User's timezone (default: UTC)
- `days` (number, optional): Days to retrieve (1-90, default 7)

---

## 👤 User Profile API

### Get Current User

```http
GET /api/user
```

**Response**:
```json
{
  "id": "user_1",
  "email": "user@example.com",
  "username": "john",
  "timezone": "America/New_York",
  "tier": "PRO",
  "subscriptionExpiresAt": "2026-04-29T23:59:59Z",
  "createdAt": "2026-03-01T10:00:00Z"
}
```

### Update Profile

```http
PATCH /api/profile (Server Action)

{
  "username": "john_updated",
  "timezone": "Europe/London"
}
```

---

## 💳 Billing & Subscriptions API

### Create Checkout Session

```http
POST /api/checkout

{
  "priceId": "price_pro_monthly"
}
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_xxxxx"
}
```

### Get Billing Portal URL

```http
POST /api/billing-portal
```

**Response**:
```json
{
  "url": "https://billing.stripe.com/session/cs_test_xxxxx"
}
```

### Webhook: Subscription Updated

```http
POST /api/webhooks/stripe
X-Stripe-Signature: t=timestamp,v1=signature

{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "customer": "cus_xxxxx",
      "metadata": {
        "userId": "user_1"
      },
      "current_period_end": 1680115200
    }
  }
}
```

**Processing**:
- Updates user `tier` to PRO or ENTERPRISE
- Sets `subscriptionExpiresAt` date
- On cancellation: downgrades to FREE

---

## 🔒 CRON Jobs API

### Trigger Missed Task Reminders

```http
POST /api/cron/reminders
X-Signature: <hmac-sha256-signature>
Content-Type: application/json

{}
```

**X-Signature Header**:
Generated with HMAC-SHA256 of request body using `CRON_SECRET`:
```bash
signature=$(echo -n <body> | openssl dgst -sha256 -hmac $CRON_SECRET -binary | xxd -p -c 256)
```

**Response** (200 OK):
```json
{
  "processed": 42,
  "duration": "3.2s"
}
```

**Errors**:
- 401: Invalid or missing X-Signature
- 500: Internal server error

**Security**:
- Requires valid HMAC signature
- IP address logged for auditing
- Only allows POST requests

---

## ⚠️ Error Responses

All errors return JSON with status code and message:

```json
{
  "error": "Unauthorized",
  "code": "AUTH_001"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (invalid input) |
| 401 | Unauthorized (auth required) |
| 403 | Forbidden (rate limit / tier limit) |
| 404 | Not found |
| 409 | Conflict (already exists) |
| 429 | Too many requests |
| 500 | Server error |

---

## 🚦 Rate Limiting

Current limits (can be increased):

| Endpoint | Limit |
|----------|-------|
| `/api/checkout` | 10 requests/min per user |
| `/api/billing-portal` | 10 requests/min per user |
| `/api/cron/*` | 1 request/hour (HMAC validated) |
| `/api/tasks` | 100 requests/min per user |
| `/api/auth/*` | 5 requests/min per IP |

---

## 🔐 Security Headers

All responses include:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📊 Testing Endpoints

### Health Check

```bash
curl https://yourdomain.com/api/health
# Returns: { "status": "ok" }
```

### Test Stripe Connection (Dev Only)

```bash
curl -X POST https://yourdomain.com/api/test/stripe \
  -H "Authorization: Bearer dev_token"
```

---

## 🛠️ Common Workflows

### Create Task and Start Focus Session

```bash
# 1. Login
curl -X POST /api/auth/callback/credentials \
  -d "email=user@example.com&password=pass123"

# 2. Create task
curl -X POST /api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Task",
    "eodDeadline": "2026-03-30T17:00:00Z"
  }'

# 3. Start focus session (use task ID from response)
curl -X POST /api/focus-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task_1",
    "durationMinutes": 25
  }'
```

### Upgrade to PRO

```bash
# 1. Create checkout session
curl -X POST /api/checkout \
  -H "Content-Type: application/json" \
  -d '{ "priceId": "price_pro_monthly" }'

# 2. Redirect user to returned URL
# 3. User completes payment on Stripe
# 4. Webhook updates user tier to PRO
```

---

## 📖 SDK Support

**Current**: REST API only (HTTP client)

**Planned**: JavaScript SDK for easier integration

---

## 📞 Support

- **Documentation**: [README.md](README.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: Check logs in Sentry or CloudWatch

---

**Last Updated**: March 29, 2026  
**Version**: 1.0.0 - Production Ready
