# 1. Stage: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Stage: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Kopyahin ang prisma config kung kinakailangan
COPY prisma.config.js ./

# I-generate ang Prisma Client
RUN npx prisma generate

# ✨ Kusa nitong ire-reset at ise-sync ang database tuwing magba-build sa Docker
# Tandaan: Siguraduhing nakatakda ang iyong DATABASE_URL sa .env o build args
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma db push --force-reset --accept-data-loss

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 3. Stage: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.js ./

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]