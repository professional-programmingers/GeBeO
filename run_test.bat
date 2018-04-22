docker kill gebeo
docker rm gebeo
docker build -t professionalprogrammingers/gebeo .
docker run -v tokens:/app/tokens -v guilds:/app/guilds --name gebeo -d --rm professionalprogrammingers/gebeo
