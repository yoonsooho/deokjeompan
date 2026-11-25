FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/
RUN npm ci --no-audit --no-fund
COPY apps apps
COPY packages packages
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && mkdir -p /app/data /app/apps/web/.next/cache && chown -R node:node /app/data /app/apps/web/.next
ENV NODE_ENV=production
USER node
