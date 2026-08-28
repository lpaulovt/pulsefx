# syntax=docker/dockerfile:1

# ---- build ----
FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm install --workspace=@pulsefx/api --workspace=@pulsefx/shared-types --include-workspace-root
COPY tsconfig.base.json ./
COPY apps/api apps/api
COPY packages/shared-types packages/shared-types
RUN npm run build -w apps/api

# ---- runtime ----
FROM node:24-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm install --workspace=@pulsefx/api --workspace=@pulsefx/shared-types --include-workspace-root --omit=dev
COPY --from=build /repo/apps/api/dist apps/api/dist
COPY --from=build /repo/packages/shared-types packages/shared-types
COPY apps/api/migrations apps/api/migrations
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
