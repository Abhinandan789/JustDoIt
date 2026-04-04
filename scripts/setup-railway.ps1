# Railway Environment Setup Script for JustDoIt (PowerShell)
# Run this with: powershell -ExecutionPolicy Bypass -File scripts/setup-railway.ps1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "JustDoIt - Railway Deployment Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if railway CLI is installed
$railwayInstalled = $null -ne (Get-Command railway -ErrorAction SilentlyContinue)

if (-not $railwayInstalled) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Generating random secrets..." -ForegroundColor Cyan

# Generate random secrets
$AUTH_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 256) }))
$CRON_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 256) }))

Write-Host ""
Write-Host "📋 Please enter the following information:" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ID = Read-Host "Enter your Railway project ID (from railway.app)"
$RESEND_API_KEY = Read-Host "Enter your Resend API key (leave blank to skip)" 

Write-Host ""
Write-Host "🚀 Fetching Railway domain..." -ForegroundColor Cyan

$RAILWAY_DOMAIN = Read-Host "Enter your Railway app domain (e.g., justdoit-prod-xxxx.up.railway.app)"
$FULL_URL = "https://$RAILWAY_DOMAIN"

Write-Host ""
Write-Host "✅ Setting environment variables on Railway..." -ForegroundColor Green
Write-Host ""

# Login to railway
Write-Host "Please login to Railway in the browser window that opens..." -ForegroundColor Yellow
railway login

# Select the project
Write-Host "Selecting project: $PROJECT_ID" -ForegroundColor Cyan
railway project select $PROJECT_ID

# Set variables
Write-Host "Setting AUTH_SECRET..." -ForegroundColor Cyan
railway variables set AUTH_SECRET $AUTH_SECRET

Write-Host "Setting NEXTAUTH_SECRET..." -ForegroundColor Cyan
railway variables set NEXTAUTH_SECRET $AUTH_SECRET

Write-Host "Setting CRON_SECRET..." -ForegroundColor Cyan
railway variables set CRON_SECRET $CRON_SECRET

Write-Host "Setting AUTH_URL..." -ForegroundColor Cyan
railway variables set AUTH_URL $FULL_URL

Write-Host "Setting NEXTAUTH_URL..." -ForegroundColor Cyan
railway variables set NEXTAUTH_URL $FULL_URL

Write-Host "Setting APP_BASE_URL..." -ForegroundColor Cyan
railway variables set APP_BASE_URL $FULL_URL

Write-Host "Setting NODE_ENV..." -ForegroundColor Cyan
railway variables set NODE_ENV "production"

if ($RESEND_API_KEY) {
    Write-Host "Setting RESEND_API_KEY..." -ForegroundColor Cyan
    railway variables set RESEND_API_KEY $RESEND_API_KEY
    
    Write-Host "Setting EMAIL_FROM..." -ForegroundColor Cyan
    railway variables set EMAIL_FROM "Task Reminder <onboarding@resend.dev>"
}

Write-Host ""
Write-Host "⚠️  IMPORTANT: DATABASE_URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you haven't set up PostgreSQL yet:" -ForegroundColor White
Write-Host "1. Go to your Railway project dashboard" -ForegroundColor White
Write-Host "2. Click '+ New'" -ForegroundColor White
Write-Host "3. Select 'Database' → 'PostgreSQL'" -ForegroundColor White
Write-Host "4. Confirm DATABASE_URL appears in Variables" -ForegroundColor White
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your JustDoIt app is now live at:" -ForegroundColor Cyan
Write-Host "🌐 $FULL_URL" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Checking deployment status..." -ForegroundColor Cyan
Write-Host ""

try {
    $logs = railway service logs 2>&1 | Select-Object -First 20
    Write-Host $logs
} catch {
    Write-Host "Could not fetch logs. Check Railway dashboard for status." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit $FULL_URL in your browser" -ForegroundColor White
Write-Host "2. Register a new account" -ForegroundColor White
Write-Host "3. Create and manage tasks" -ForegroundColor White
Write-Host "4. Check dashboard analytics" -ForegroundColor White
Write-Host ""
Write-Host "For troubleshooting, visit:" -ForegroundColor Cyan
Write-Host "📚 https://docs.railway.app" -ForegroundColor White
Write-Host ""
