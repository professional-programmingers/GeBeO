tsc
sudo docker build -t professionalprogrammingers/gebeo .
sudo docker push professionalprogrammingers/gebeo

ssh -t gebeo@gebeo.jmalexan.com 'sudo docker pull professionalprogrammingers/gebeo; sudo docker stop gebeo; sudo docker rm gebeo; sudo docker run -v ~/volumes/tokens:/app/tokens -v ~/volumes/guilds:/app/guilds --name gebeo -d --rm professionalprogrammingers/gebeo'
