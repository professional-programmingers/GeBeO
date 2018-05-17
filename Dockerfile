FROM node:carbon

WORKDIR /app

VOLUME /app/tokens /app/guilds

COPY . /app

#install dependencies at container creation time instead of
#image creation time to avoid using up all of developer's
#upload speed
CMD npm i && node -r tsconfig-paths/register GeBeO.js
