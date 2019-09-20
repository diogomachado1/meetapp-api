
FROM node:alpine

LABEL version="0.1.0"

COPY ./ /meetapp

WORKDIR /meetapp

RUN npm i && npm build

CMD npm start
