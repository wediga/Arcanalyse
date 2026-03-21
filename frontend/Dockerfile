FROM node:22-alpine AS build

WORKDIR /app

ARG NEXT_PUBLIC_LISTMONK_URL
ARG NEXT_PUBLIC_LISTMONK_LIST_UUID
ARG NEXT_PUBLIC_FORMBRICKS_URL
ARG NEXT_PUBLIC_FORMBRICKS_ENV_ID

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
