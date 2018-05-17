#!/bin/bash
set -e
tsc
sudo docker kill gebeo
sudo docker rm gebeo
sudo docker build -t professionalprogrammingers/gebeo .
sudo docker run -v ~/Programming/GeBeO/tokens:/app/tokens -v ~/Programming/GeBeO/guilds:/app/guilds --name gebeo professionalprogrammingers/gebeo
