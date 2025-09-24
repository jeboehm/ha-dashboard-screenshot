FROM node:lts-slim@sha256:c407baf6e71f4127777b0b660b162e3c88c1974067b1be9f1f962709ea817d59

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libpango-1.0-0 \
    libcairo2 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN --mount=type=cache,target=/root/.npm npm install

USER node
RUN npx playwright install chromium

USER root
COPY . .

USER node

VOLUME [ "/app/output" ]

ENTRYPOINT [ "/app/node_modules/.bin/tsx", "src/main.ts" ]
CMD [""]
