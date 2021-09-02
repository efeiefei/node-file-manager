FROM node

ENV DIRECTORY="./"

COPY ./ /usr/src/app

WORKDIR /usr/src/app

RUN npm i

WORKDIR /usr/src/app/lib

EXPOSE 3000

CMD node --harmony index.js -p 3000 -d $DIRECTORY

