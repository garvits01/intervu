# ── Stage 1: Builder ──
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Copy source
COPY packages/db/ ./packages/db/
COPY apps/api/ ./apps/api/
COPY tsconfig.base.json ./

# Generate Prisma client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build API
RUN npx turbo run build --filter=@haveloc/api

# ── Stage 2: Runner ──
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]
