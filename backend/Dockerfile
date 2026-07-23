FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
RUN npm install

COPY prisma ./prisma
COPY generated ./generated
COPY src ./src
COPY tsconfig*.json ./
COPY prisma.config.ts ./prisma.config.ts

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app


COPY package*.json ./

# had --omit=dev which removes dev dependencies for deployment purposes. No need for this since we stay in development phase or now.
RUN npm install 

ENV NODE_ENV=production \
    PORT=3000
    
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]



