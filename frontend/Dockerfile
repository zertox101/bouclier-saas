# Stage 1: Building the code
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies (including devDependencies for build)
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --ignore-scripts
RUN npm rebuild better-sqlite3

# Copy source
COPY . .

# Generate Prisma Client
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate

# Ensure public folder exists for runtime copy
RUN mkdir -p /app/public

# Build the application
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Production image
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dev.db ./dev.db

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/dev.db"

CMD ["node", "server.js"]
