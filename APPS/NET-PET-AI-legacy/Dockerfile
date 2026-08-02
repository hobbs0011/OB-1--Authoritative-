# NET-PET-AI Local Development Environment
# Build: docker build -t net-pet-ai-dev .
# Run: docker run -it --rm -p 8787:8787 -v $(pwd):/app net-pet-ai-dev

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git bash

COPY package*.json ./

RUN npm ci --if-present

COPY . .

# Install wrangler globally for local testing
RUN npm install -g wrangler

# Expose wrangler dev server port
EXPOSE 8787

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8787/api/health || exit 1

# Default: run wrangler dev
CMD ["wrangler", "dev", "--ip", "0.0.0.0", "--port", "8787"]
