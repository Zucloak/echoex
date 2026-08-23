# Multi-stage Dockerfile for Echoex Node Anchor
FROM node:22-alpine AS runtime

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

COPY bin ./bin
COPY src ./src

ENV NODE_ENV=production
ENV ECHOEX_SERVER=https://bulkmetadataeditor.com

ENTRYPOINT ["node", "bin/echoex-node.js"]
