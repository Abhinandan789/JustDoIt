# Deployment Readiness Test Script (PowerShell)
# This script verifies that all deployment files exist and are properly formatted

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "JustDoIt - Deployment Readiness Test" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check critical files exist
Write-Host "TEST 1: Checking critical deployment files..." -ForegroundColor Yellow
$files = @(
  "railway.json",
  ".env.production",
  "scripts/setup-railway.ps1",
  "DEPLOY_NOW.md",
  "00_START_HERE_DEPLOYMENT.md"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "✅ $file exists" -ForegroundColor Green
  } else {
    Write-Host "❌ $file MISSING" -ForegroundColor Red
    exit 1
  }
}

Write-Host ""
Write-Host "TEST 2: Checking railway.json is valid JSON..." -ForegroundColor Yellow
try {
  $railwayConfig = Get-Content railway.json | ConvertFrom-Json
  Write-Host "✅ railway.json is valid JSON" -ForegroundColor Green
} catch {
  Write-Host "❌ railway.json is invalid JSON" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "TEST 3: Checking .env.production has NODE_ENV..." -ForegroundColor Yellow
$envContent = Get-Content .env.production -Raw
if ($envContent -match "NODE_ENV") {
  Write-Host "✅ .env.production contains NODE_ENV" -ForegroundColor Green
} else {
  Write-Host "❌ .env.production missing NODE_ENV" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "TEST 4: Checking package.json build command..." -ForegroundColor Yellow
$pkgJson = Get-Content package.json | ConvertFrom-Json
if ($pkgJson.scripts.build -match "prisma generate && next build") {
  Write-Host "✅ package.json has correct build command" -ForegroundColor Green
} else {
  Write-Host "❌ package.json build command incorrect" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "TEST 5: Checking package.json start command..." -ForegroundColor Yellow
if ($pkgJson.scripts.start -match "next start") {
  Write-Host "✅ package.json has correct start command" -ForegroundColor Green
} else {
  Write-Host "❌ package.json start command incorrect" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "TEST 6: Building application..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Application builds successfully" -ForegroundColor Green
} else {
  Write-Host "❌ Application build failed" -ForegroundColor Red
  Write-Host $buildOutput
  exit 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment readiness: VERIFIED" -ForegroundColor Green
Write-Host "Application is ready for Railway deployment" -ForegroundColor Green
Write-Host ""
