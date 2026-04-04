#!/bin/bash
# Railway Environment Setup Script for JustDoIt

set -e

echo "========================================="
echo "JustDoIt - Railway Deployment Setup"
echo "========================================="
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "🔐 Generating random secrets..."
AUTH_SECRET=$(openssl rand -base64 32)
CRON_SECRET=$(openssl rand -base64 32)

echo ""
echo "📋 Please enter the following information:"
echo ""

read -p "Enter your Railway project ID (from railway.app): " PROJECT_ID
read -p "Enter your Resend API key (leave blank to skip): " RESEND_API_KEY

# Get the Railway domain
echo ""
echo "🚀 Fetching Railway domain..."
RAILWAY_DOMAIN=$(railway service list | grep "justdoit" | awk '{print $NF}')

if [ -z "$RAILWAY_DOMAIN" ]; then
    read -p "Enter your Railway app domain manually: " RAILWAY_DOMAIN
fi

FULL_URL="https://${RAILWAY_DOMAIN}"

echo ""
echo "✅ Setting environment variables on Railway..."
echo ""

# Login to railway
railway login

# Select the project
railway project select "$PROJECT_ID"

# Set variables
railway variables set DATABASE_URL --from-railway-postgres 2>/dev/null || echo "Note: Configure DATABASE_URL manually if PostgreSQL not yet linked"
railway variables set AUTH_SECRET "$AUTH_SECRET"
railway variables set NEXTAUTH_SECRET "$AUTH_SECRET"
railway variables set CRON_SECRET "$CRON_SECRET"
railway variables set AUTH_URL "$FULL_URL"
railway variables set NEXTAUTH_URL "$FULL_URL"
railway variables set APP_BASE_URL "$FULL_URL"
railway variables set NODE_ENV "production"

if [ ! -z "$RESEND_API_KEY" ]; then
    railway variables set RESEND_API_KEY "$RESEND_API_KEY"
    railway variables set EMAIL_FROM "Task Reminder <onboarding@resend.dev>"
fi

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Your JustDoIt app is now live at:"
echo "🌐 $FULL_URL"
echo ""
echo "🔍 Checking deployment status..."
railway service logs | head -20

echo ""
echo "Next steps:"
echo "1. Visit $FULL_URL in your browser"
echo "2. Register a new account"
echo "3. Create and manage tasks"
echo "4. Check dashboard analytics"
echo ""
echo "For troubleshooting, visit: https://docs.railway.app"
