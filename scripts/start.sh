#!/bin/bash
set -e

echo "Starting JustDoIt application..."
echo "Environment: $NODE_ENV"
echo "Port: ${PORT:-3000}"

# Run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npm run prisma:migrate:deploy || true
else
  echo "Warning: DATABASE_URL not set, skipping migrations"
fi

# Start the application
echo "Starting Next.js server..."
npm run start
