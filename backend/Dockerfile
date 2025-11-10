# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# 🧩 Installer les dépendances nécessaires à Prisma
RUN apk add --no-cache openssl libc6-compat

FROM base AS deps
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci || yarn install --frozen-lockfile || pnpm i --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS prod
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./package.json

# 🧠 Génère le client Prisma
RUN npx prisma generate

EXPOSE 3001
CMD ["node", "dist/main.js"]
``
