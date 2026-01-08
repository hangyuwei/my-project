FROM node:18-alpine AS build
WORKDIR /app
COPY ecommerce-management-backend/package*.json ./
RUN npm install
COPY ecommerce-management-backend/ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY ecommerce-management-backend/package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server/index.js"]
