FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_ENV_ID
ENV VITE_ENV_ID=$VITE_ENV_ID
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 3001
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3001}"]
