FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY dist ./dist/
COPY public ./public/

RUN npm install

COPY server ./server/

COPY dist ./dist/

EXPOSE 1337

CMD ["node", "server/app.js"]