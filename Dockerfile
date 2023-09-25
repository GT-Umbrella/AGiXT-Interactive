FROM node:18.8-alpine AS deps
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
COPY package.json ./
RUN --mount=type=cache,target=/app/node_modules \
    npm install
COPY . .
RUN npm run build

FROM node:18.8-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 nodejs && adduser -D -u 1001 -G nodejs nextjs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
USER nextjs
EXPOSE 24498

CMD ["npm", "start"]
