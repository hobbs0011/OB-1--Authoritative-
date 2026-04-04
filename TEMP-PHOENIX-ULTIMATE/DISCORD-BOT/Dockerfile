# ============================================
# Train 6-7 Discord Bot — Production Dockerfile
# Optimized for Railway deployment
# ============================================

# Stage 1: Build (install native modules)
FROM node:20-slim AS builder

WORKDIR /app

# Install build tools for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Stage 2: Production (slim runtime)
FROM node:20-slim

WORKDIR /app

# Copy built node_modules and source
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Non-root user for security
RUN addgroup --system botuser && adduser --system --ingroup botuser botuser
RUN chown -R botuser:botuser /app
USER botuser

# Health signal (Railway uses this)
ENV NODE_ENV=production

CMD ["node", "src/index.js"]
