FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 8010

CMD [ "npm","start" ]
