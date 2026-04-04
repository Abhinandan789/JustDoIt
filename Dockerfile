# Multi-stage build for JustDoIt Next.js app optimized for Railway/Docker

# Build stage
FROM node:18.20.5-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./
COPY next.config.ts ./
COPY .eslintrc.* ./

# Install dependencies
RUN npm ci

# Generate Prisma client (without database connection)
ENV PRISMA_SKIP_VALIDATION=true
RUN npm run prisma:generate

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:18.20.5-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm run prisma:generate

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/middleware.ts ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
