# Medusa Backend Development Dockerfile
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache bash curl wget

# Install Bun for Medusa
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL=/root/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies with Bun
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:9000/health || exit 1

# Default command (override in docker-compose)
CMD ["bun", "run", "dev"]
