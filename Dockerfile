FROM node:18-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production
COPY server/ .
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm","start"]
