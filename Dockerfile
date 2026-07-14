# syntax=docker/dockerfile:1

# Monorepo build: context must be the repo root so the `server` app can resolve
# its @repo/db and @repo/shared workspace dependencies.

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @repo/db db:generate
RUN pnpm --filter @repo/shared build
RUN pnpm --filter server build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3001
CMD ["node", "apps/server/dist/main.js"]
