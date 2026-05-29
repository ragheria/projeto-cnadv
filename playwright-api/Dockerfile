FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

# Não baixa os browsers novamente — já vêm na imagem base
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "server.js"]
