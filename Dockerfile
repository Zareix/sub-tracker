##### DEPENDENCIES

FROM oven/bun:1.2.10-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

##### BUILDER

FROM oven/bun:1.2.10-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_LINT=true
ENV DEBUG=1 
ENV SKIP_ENV_VALIDATION=1 

RUN bun run build;

##### RUNNER

FROM oven/bun:1.2.10-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_PATH=/app/db/db.sqlite
ENV UPLOADS_FOLDER=/app/uploads

CMD ["server.js"]