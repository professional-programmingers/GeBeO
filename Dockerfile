FROM node:carbon

WORKDIR /app

VOLUME /app/tokens /app/guilds

COPY . /app

CMD npm i && node -r tsconfig-paths/register GeBeO.js
