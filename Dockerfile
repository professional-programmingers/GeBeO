FROM node:carbon

RUN apt-get update && apt-get install -y wamerican-small

WORKDIR /app

VOLUME /app/tokens /app/guilds

COPY . /app

EXPOSE 80


#install dependencies at container creation time instead of
#image creation time to avoid using up all of developer's
#upload speed
CMD npm i && node -r ./tsconfig-paths-bootstrap.js src/server/GeBeO.js
