# Monitoring, Error Tracking & Observability Guide

Complete setup for production monitoring with Sentry, Datadog, and CloudWatch.

## 📊 Three-Layer Monitoring Stack

1. **Application Errors** → Sentry (error tracking & grouping)
2. **Infrastructure Metrics** → Datadog/CloudWatch (performance & uptime)
3. **Structured Logs** → CloudWatch/ELK (debugging & audit trail)

---

## 🚨 Error Tracking with Sentry

### Setup

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Sign up and create organization
   - Create Next.js project
   - Copy your DSN (looks like `https://xxx@xxx.ingest.sentry.io/yyy`)

2. **Install Sentry SDK**
   ```bash
   npm install @sentry/nextjs
   ```

3. **Add Environment Variable**
   ```env
   SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
   ```

4. **Initialize Sentry in `app/layout.tsx`**
   ```typescript
   import * as Sentry from "@sentry/nextjs";

   if (process.env.SENTRY_DSN) {
     Sentry.init({
       dsn: process.env.SENTRY_DSN,
       environment: process.env.NODE_ENV,
       tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
       integrations: [
         new Sentry.Replay({
           maskAllText: true,
           blockAllMedia: true,
         }),
       ],
       replaysSessionSampleRate: 0.1,
       replaysOnErrorSampleRate: 1.0,
     });
   }
   ```

### Usage

**Capture Errors Automatically**
- Unhandled exceptions
- Promise rejections
- Server-side errors in API routes

**Manual Error Capture**
```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: "email",
      userId: user.id,
    },
    extra: {
      taskCount: tasks.length,
      retries: 3,
    },
  });
}
```

**Breadcrumbs (Action Trail)**
```typescript
Sentry.captureMessage("Task processing started", {
  level: "info",
  contexts: {
    action: {
      tasks_count: 42,
      duration_ms: 1500,
    },
  },
});
```

### Monitoring in Sentry

1. **Alerts**
   - Go to Alerts → Create Alert Rule
   - Set condition: "If issue occurs"
   - Route to: Email, Slack, PagerDuty
   - Severity levels: Critical errors, releases

2. **Release Tracking**
   ```typescript
   // Sentry detects releases from git tags
   // Push tag: git tag v1.2.3 && git push origin v1.2.3
   ```

3. **Performance Monitoring**
   - View transaction times
   - Identify slow API endpoints
   - Database query profiling

---

## 📈 Infrastructure Monitoring with Datadog

### Setup

1. **Create Datadog Account**
   - Go to https://www.datadoghq.com
   - Create organization
   - Get API key from Settings → API Keys

2. **Install Datadog APM Agent**
   ```bash
   npm install dd-trace
   ```

3. **Initialize in Server**
   ```typescript
   // instrumentation.ts (at root level)
   const tracer = require('dd-trace').init({
     service: 'justdoit',
     env: process.env.NODE_ENV,
     hostname: process.env.HOSTNAME,
     logInjection: true,
   });
   ```

4. **Enable in Next.js**
   Add to `next.config.ts`:
   ```typescript
   experimental: {
     instrumentationHook: true,
   }
   ```

### Metrics to Monitor

1. **Application Metrics**
   - Request latency (p50, p95, p99)
   - Error rate
   - Task creation rate
   - Email sending success rate

2. **Database Metrics**
   - Connection pool usage
   - Query latency
   - Index hit ratio
   - Transaction rollback rate

3. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network latency

### Create Dashboards

```yaml
# Datadog Dashboard Example
- name: JustDoIt Overview
  widgets:
    - Request Latency
      query: avg:trace.web.request.duration{service:justdoit}
    - Error Rate
      query: avg:trace.error_rate{service:justdoit}
    - Database Connection Pool
      query: avg:postgresql.connection_count{...}
```

### Alerting Rules

```yaml
- Alert: High Error Rate
  condition: "error_rate > 1%"
  duration: 5 minutes
  action: Notify Slack channel #alerts

- Alert: Slow Database Queries
  condition: "database_query_latency_p99 > 1000ms"
  duration: 10 minutes
  action: Notify #database-team

- Alert: Task Processing Queue Backlog
  condition: "queue_depth > 1000"
  duration: 1 minute
  action: Scale up workers
```

---

## 📝 Structured Logging with CloudWatch/ELK

### AWS CloudWatch Setup

1. **Create CloudWatch Log Group**
   ```bash
   aws logs create-log-group --log-group-name /justdoit/production
   ```

2. **Configure JSON Logging**
   - Application already outputs JSON (see `lib/logger.ts`)
   - CloudWatch automatically parses JSON fields
   - Search by: `{ $.level = "ERROR" }`, `{ $.userId = "user_123" }`

3. **Create Log Insights Queries**

   **Find errors in last hour**
   ```
   fields @timestamp, @message, level, userId
   | filter level = "ERROR"
   | stats count() as error_count by userId
   ```

   **Email sending performance**
   ```
   fields @timestamp, durationMs, success
   | filter @message like /Email/
   | stats avg(durationMs), sum(success) by bin(1m)
   ```

   **Database performance**
   ```
   fields @timestamp, query, duration
   | filter duration > 1000
   | stats avg(duration) as avg_ms, max(duration) as max_ms by query
   ```

### Send Logs to CloudWatch

In production `lib/logger.ts`, logs are already JSON. Forward them:

```typescript
// In Node.js server
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports: [
    new WinstonCloudWatch({
      logGroupName: '/justdoit/production',
      logStreamName: 'app-server',
      awsRegion: process.env.AWS_REGION,
    }),
    new winston.transports.Console(), // Also log to stdout
  ],
});
```

### ELK Stack Alternative (Self-Hosted)

For self-hosted deployments:

1. **Elasticsearch** - Search engine for logs
2. **Logstash** - Log pipeline (JSON parsing)
3. **Kibana** - Visualization dashboard

```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
```

---

## 🔔 Alert Configuration

### Critical Alerts (Page On-Call)

```yaml
- name: Application Down
  condition: "No requests in 5 minutes"
  action: PagerDuty critical

- name: Database Unreachable
  condition: "Database connection failures > 10"
  duration: 1 minute
  action: PagerDuty critical

- name: Stripe Webhook Failures
  condition: "Webhook error rate > 5%"
  duration: 5 minutes
  action: PagerDuty critical
```

### Warning Alerts (Morning Report)

```yaml
- name: High Error Rate
  condition: "Error rate > 0.5%"
  duration: 30 minutes
  action: Email #devops

- name: Slow Performance
  condition: "API latency p95 > 2s"
  duration: 30 minutes
  action: Email #devops

- name: Database Slow Queries
  condition: "15% of queries > 500ms"
  duration: 30 minutes
  action: Email #database-team
```

### Custom Alerts for JustDoIt

```yaml
- Alert: Email Queue Backlog
  metric: email_queue_depth
  threshold: > 500
  action: Scale email worker
  tags: [critical, email]

- Alert: Task Creation Spike
  metric: task_creation_rate
  threshold: > 100/min (2x normal)
  action: Notify #team
  duration: 5 minutes

- Alert: Subscription Payment Failures
  metric: stripe_charge_failure_rate
  threshold: > 2%
  action: PagerDuty + notify #billing
```

---

## 📊 Dashboard Metrics

### Real-Time Status Board

Key metrics to display:

1. **Uptime & Availability**
   - % requests successful (target: 99.9%)
   - Latest incident timestamp
   - Error rate trend (24h)

2. **Performance**
   - API response time p95
   - Database query latency p99
   - CRON job success rate

3. **Business Metrics**
   - Active users (24h)
   - Tasks created (24h)
   - Subscription revenue (MTD)
   - Free → Pro conversion rate

4. **Resource Utilization**
   - Database connections (pool usage %)
   - Memory usage (%)
   - CPU usage (%)
   - Disk space remaining

### Sample Query Patterns

**Sentry**
```
event.type:error 
release:>=1.0.0 
environment:production 
sdk.version:7.0.0
```

**Datadog**
```
service:justdoit 
env:production 
status:error
```

**CloudWatch**
```
{ $.level = "ERROR" && $.timestamp >= "2026-03-29T00:00:00Z" }
```

---

## 🧪 Testing Monitoring

### Test Error Tracking

```typescript
// Trigger Sentry error
throw new Error("Test Sentry integration");

// Check Sentry dashboard - error should appear in 1-2 minutes
```

### Test Log Parsing

```typescript
logger.error("Test error message", new Error("Test"), {
  meta: { userId: "test_user", taskId: "test_task" },
});

// Check CloudWatch Logs Insights
// Query: { $.userId = "test_user" }
// Should return the log entry
```

### Load Test Alerts

```bash
# Generate traffic to trigger alerts
artillery quick --count 100 --num 1000 https://yourdomain.com/dashboard

# Check Datadog/Sentry for metrics spike
```

---

## 📋 Implementation Checklist

- [ ] Sentry account created and DSN configured
- [ ] @sentry/nextjs installed and initialized
- [ ] Datadog account and API key configured
- [ ] dd-trace installed and initialized
- [ ] CloudWatch log group created
- [ ] Structured logging verification (JSON output)
- [ ] Sentry alerts configured (Slack/Email)
- [ ] Datadog dashboards created
- [ ] CloudWatch Insights queries saved
- [ ] Test error captured in Sentry
- [ ] Test log found in CloudWatch
- [ ] Team trained on alert response
- [ ] On-call rotation configured
- [ ] Documentation updated with runbooks

---

## 🚨 Runbooks

### Email Delivery Failure

1. **Detection**: Stripe webhook failures or email queue backlog
2. **Investigation**:
   ```bash
   # Check Resend API status
   curl -i https://api.resend.com/emails
   
   # Check logs
   # CloudWatch: { $.level = "ERROR" && $.meta.section = "email" }
   # Sentry: Errors with tag "section:email"
   ```
3. **Resolution**:
   - Verify RESEND_API_KEY is valid
   - Check email service status
   - Retry failed deliveries manually
4. **Prevention**: Add alert threshold on error rate

### Database Performance Degradation

1. **Detection**: API latency spike > 2s
2. **Investigation**:
   ```sql
   -- Find slow queries
   SELECT query, calls, mean_time FROM pg_stat_statements 
   ORDER BY mean_time DESC LIMIT 10;
   
   -- Check connection pool
   SELECT count(*) FROM pg_stat_activity;
   ```
3. **Resolution**:
   - Increase connection pool size
   - Run ANALYZE VERBOSE on slow tables
   - Check for missing indexes
4. **Scaling**: Add read replicas for high load

### Subscription Payment Issues

1. **Detection**: Stripe webhook failures or manual report
2. **Investigation**:
   ```bash
   # Check in Stripe dashboard
   stripe subscriptions list --status=past_due
   stripe charges list --created=">1day_ago" --status=failed
   ```
3. **Resolution**:
   - Contact user about payment method update
   - Retry payment after user updates card
   - Manual downgrade to FREE tier if needed
4. **Prevention**: Email reminders before expiration

---

## 📚 Additional Resources

- [Sentry Docs](https://docs.sentry.io/)
- [Datadog APM](https://docs.datadoghq.com/tracing/)
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)
- [ELK Stack Guide](https://www.elastic.co/guide/en/)
- [Structured Logging Best Practices](https://www.kartar.net/2015/12/structured-logging/)

---

**Last Updated**: March 29, 2026  
**Version**: 1.0 - Production Ready
