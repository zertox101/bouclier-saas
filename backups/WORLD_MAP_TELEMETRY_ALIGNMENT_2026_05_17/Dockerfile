# Frontend Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (for caching)
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npx prisma generate
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Production image, copy all the files and run next
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
