FROM node:18.19-alpine3.18 AS builder

WORKDIR /app

# Install dependencies only when needed
COPY package*.json ./
RUN npm ci

# Copy local code to the container
COPY . .

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM node:18.19-alpine3.18 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built standalone server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080

# Start the standalone server
CMD ["node", "server.js"] 