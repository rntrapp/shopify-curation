FROM node:18.19-alpine3.18

WORKDIR /app

# Install dependencies only when needed
COPY package*.json ./
RUN npm ci

# Copy local code to the container
COPY . .

# Build the Next.js application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 8080

# Start the application
CMD ["npm", "start"] 