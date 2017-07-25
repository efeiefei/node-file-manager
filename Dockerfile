FROM node:8.2.1-alpine as builder

WORKDIR /app
COPY . /app
RUN npm install --production

FROM node:8.2.1-alpine

WORKDIR /app
COPY --from=builder /app/ /app/

VOLUME /srv
EXPOSE 8080
ENTRYPOINT ["node","lib/index.js","-p","8080","/srv"]
