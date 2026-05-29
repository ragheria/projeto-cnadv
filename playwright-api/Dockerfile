ARG PLAYWRIGHT_VERSION=1.60.0
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy

WORKDIR /app

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Instala express via lockfile
COPY package*.json ./
RUN npm ci --omit=dev

# Instala playwright na versão exata da imagem base
ARG PLAYWRIGHT_VERSION
RUN npm install --no-save playwright@${PLAYWRIGHT_VERSION}

COPY . .

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "server.js"]
