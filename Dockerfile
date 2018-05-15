FROM node:carbon

WORKDIR /app

VOLUME /app/tokens /app/guilds

COPY . /app

RUN npm i

CMD ['node', '-r', 'tsconfig-register', 'GeBeO.js']