#!/bin/bash
# Deployment Readiness Test Script
# This script verifies that all deployment files exist and are properly formatted

set -e

echo "========================================="
echo "JustDoIt - Deployment Readiness Test"
echo "========================================="
echo ""

# Test 1: Check critical files exist
echo "TEST 1: Checking critical deployment files..."
files=(
  "railway.json"
  ".env.production"
  "scripts/setup-railway.ps1"
  "DEPLOY_NOW.md"
  "00_START_HERE_DEPLOYMENT.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file MISSING"
    exit 1
  fi
done

echo ""
echo "TEST 2: Checking railway.json is valid JSON..."
if jq empty railway.json 2>/dev/null; then
  echo "✅ railway.json is valid JSON"
else
  echo "❌ railway.json is invalid JSON"
  exit 1
fi

echo ""
echo "TEST 3: Checking .env.production has NODE_ENV..."
if grep -q "NODE_ENV" .env.production; then
  echo "✅ .env.production contains NODE_ENV"
else
  echo "❌ .env.production missing NODE_ENV"
  exit 1
fi

echo ""
echo "TEST 4: Checking package.json build command..."
if grep -q "prisma generate && next build" package.json; then
  echo "✅ package.json has correct build command"
else
  echo "❌ package.json build command incorrect"
  exit 1
fi

echo ""
echo "TEST 5: Checking package.json start command..."
if grep -q "next start" package.json; then
  echo "✅ package.json has correct start command"
else
  echo "❌ package.json start command incorrect"
  exit 1
fi

echo ""
echo "TEST 6: Building application..."
if npm run build &> /dev/null; then
  echo "✅ Application builds successfully"
else
  echo "❌ Application build failed"
  exit 1
fi

echo ""
echo "========================================="
echo "✅ ALL TESTS PASSED"
echo "========================================="
echo ""
echo "Deployment readiness: VERIFIED"
echo "Application is ready for Railway deployment"
echo ""
