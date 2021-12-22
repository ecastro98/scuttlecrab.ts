FROM node:16.13.1 as DEPENDENCIES

WORKDIR /application

COPY package.json package-lock.json ./

RUN npm install

ENV NODE_ENV=production

CMD ["yarn", "start"]
