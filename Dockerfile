# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Install dependencies against the lockfile for reproducible builds.
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

# Compile TypeScript → dist/
COPY src/ ./src/
RUN npm run build

# Drop dev dependencies so only runtime deps are carried forward.
RUN npm prune --omit=dev

# ---- Production stage ----
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && chown -R node:node /app

# Run as the built-in, non-root `node` user (uid/gid 1000 in node:alpine).
USER node

# The server speaks the Model Context Protocol over stdio.
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
