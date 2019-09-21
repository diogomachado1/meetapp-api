
FROM node:alpine

LABEL version="0.1.0"

COPY ./ /meetapp

WORKDIR /meetapp

RUN yarn && yarn build

RUN ls

CMD yarn start
