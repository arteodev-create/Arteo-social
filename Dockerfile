FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/libs ./libs
RUN npm ci

COPY backend ./
RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "Server.js"]
