# Frontend Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_TOOLS_API_BASE

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_TOOLS_API_BASE=$NEXT_PUBLIC_TOOLS_API_BASE

# Install dependencies first (for caching)
RUN apk add --no-cache openssl python3 make g++
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

RUN apk add --no-cache openssl

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
