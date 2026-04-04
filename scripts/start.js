#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

async function runCommand(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function start() {
  try {
    // Skip migrations in development
    if (!isDev && process.env.DATABASE_URL) {
      console.log('🔄 Running database migrations...');
      try {
        await runCommand('npm', ['run', 'prisma:migrate:deploy']);
        console.log('✓ Migrations completed');
      } catch (err) {
        console.warn('⚠ Migration warning:', err.message);
        // Don't fail startup if migrations fail
      }
    }

    console.log('🚀 Starting Next.js server...');
    await runCommand('npm', ['run', 'start:next']);
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
