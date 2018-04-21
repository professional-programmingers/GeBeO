FROM python:3.6.5-slim

WORKDIR /app

VOLUME /app/tokens /app/guilds

COPY . /app

RUN echo 'deb http://httpredir.debian.org/debian/ jessie-backports main' >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get install ffmpeg -y

# Install discord.py from the local copy, and the rest of the requirements
RUN pip install ./discord.py
RUN pip install -r requirements.txt

# Set the startup command for the container
CMD ["python", "GeBeO.py"]
