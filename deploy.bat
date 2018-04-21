docker build -t professionalprogrammingers/gebeo .
docker push professionalprogrammingers/gebeo

ssh gebeo@gebeo.jmalexan.com sudo docker stop gebeo
ssh gebeo@gebeo.jmalexan.com sudo docker rm gebeo
ssh gebeo@gebeo.jmalexan.com sudo docker pull professionalprogrammingers/gebeo
ssh gebeo@gebeo.jmalexan.com sudo docker run -v ~/volumes/tokens:/app/tokens -v ~/volumes/guilds:/app/guilds --name gebeo -d --rm professionalprogrammingers/gebeo
