#!/bin/bash
ng build
tsc --project src/server/tsconfig.json
sudo docker kill gebeo
sudo docker rm gebeo
sudo docker build -t professionalprogrammingers/gebeo .
sudo docker run -p 80:8080 -v ~/Programming/GeBeO/tokens:/app/tokens -v ~/Programming/GeBeO/guilds:/app/guilds --name gebeo professionalprogrammingers/gebeo
