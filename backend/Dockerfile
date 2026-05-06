# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies including development ones for potential build scripts
COPY package*.json ./
RUN npm install

# Copy source code and configuration
COPY . .

# Generate High-Fidelity Prisma Client
RUN npx prisma generate

# --- Stage 2: Runtime ---
FROM node:20-alpine

WORKDIR /app

# High-Fidelity Production Metadata
LABEL org.opencontainers.image.title="Arteo Backend (Platinum Edition)"
LABEL org.opencontainers.image.version="2.1.0"
LABEL org.opencontainers.image.description="Single-server Arteo API Engine"

# Copy verified production dependencies and generated prisma client
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/Server.js ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env.example ./.env.example

# Environment Configuration (Platinum Defaults)
ENV NODE_ENV=production
ENV PORT=5000

# Expose High-Fidelity Port (Synchronized with Phase 136)
EXPOSE 5000

# Start Arteo API server
CMD ["node", "Server.js"]
