#!/bin/bash
set -e
ng build
tsc --project src/server/tsconfig.json
sudo docker build -t professionalprogrammingers/gebeo .
sudo docker push professionalprogrammingers/gebeo

ssh -t gebeo@gebeo.jmalexan.com 'sudo docker pull professionalprogrammingers/gebeo; sudo docker stop gebeo; sudo docker rm gebeo; sudo docker run -p 80:8080 -v ~/volumes/tokens:/app/tokens -v ~/volumes/guilds:/app/guilds --name gebeo -d --rm professionalprogrammingers/gebeo'
