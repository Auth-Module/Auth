FROM node:16.15-alpine3.14

WORKDIR /app

COPY package.json /app/
COPY index.js /app/

RUN npm install

CMD node index