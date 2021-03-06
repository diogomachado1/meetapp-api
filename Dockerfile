
FROM node:lts-alpine

LABEL version="0.1.0"

COPY ./ /meetapp

WORKDIR /meetapp

RUN yarn && yarn build

CMD yarn start
