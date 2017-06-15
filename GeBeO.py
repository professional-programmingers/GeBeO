import os
import sys
import time
from datetime import datetime
import asyncio
import threading
import pytz
import discord
from google.cloud import datastore

f = open("tokens/discord.cfg", "r")
discord_token = f.read().strip()
f.close()

client = discord.Client()

dsclient = datastore.Client(project="grillbybot")

async def wednesday_detector():
    await client.wait_until_ready()
    currently_wednesday = True
    tz = pytz.timezone('America/Los_Angeles')
    print("Started wednesday detector at: " + str(datetime.now(tz)))
    while True:
        print("Checking for Wednesday!")
        current_time = datetime.now()
        print(current_time.weekday())
        if current_time.weekday() == 2:
            if not currently_wednesday:
                currently_wednesday = True
                my_dudes = "<:MyDudes:304341572168712193> "
                await client.send_message(client.get_channel('137685095111720961'), my_dudes * 3 + "It is Wednesday my dudes" + my_dudes * 3)
        else:
            currently_wednesday = False
        await asyncio.sleep(60)

client.loop.create_task(wednesday_detector())

@client.event
async def on_ready():
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    print('------')
    #loop = asyncio.get_event_loop()
    #asyncio.run_coroutine_threadsafe(wednesday_detector(), loop)


@client.event
async def on_message(message):
    print(message.author.name + ": " + message.content)
    message_split = message.content.split(' ')
    command = message_split[0]
    args = message_split[1:]
    print(command)

    if command in ['!test']:
        counter = 0
        tmp = await client.send_message(message.channel, 'Calculating messages...')
        async for log in client.logs_from(message.channel, limit=100):
            if log.author == message.author:
                counter += 1
        await client.edit_message(tmp, 'You have {} messages.'.format(counter))

    elif command in ['!sleep']:
        await asyncio.sleep(5)
        await client.send_message(message.channel, 'Done sleeping')

    elif command in ['!ayy']:
        print("TEST!!!")
        nickname = message.server.me.nick
        await client.delete_message(message)
        await client.change_nickname(message.server.me, "ayy")
        await client.send_message(message.channel, "lmao")
        await client.change_nickname(message.server.me, nickname)

    elif command in ['!metoo', '!me2']:
        nickname = message.server.me.nick
        await client.delete_message(message)
        await client.change_nickname(message.server.me, "Me Too")
        await client.send_message(message.channel, "Thanks")
        await client.change_nickname(message.server.me, nickname)

    elif command in ['!blowme']:
        await client.delete_message(message)
        await client.send_message(message.channel, "*sucks " + message.author.nick + " off*")

    elif command in ['!esad']:
        await client.delete_message(message)
        await client.send_file(message.channel, "eatshitanddie.png")

    elif command in ['!kermit']:
        await client.delete_message(message)
        await client.send_file(message.channel, "kermit.gif")

    elif command in ['!saymyname']:
        print("test")
        query = dsclient.query(kind='Usernames')
        query.add_filter('DiscordUsername', '=', message.author.name)
        results = list(query.fetch(1))
        print(len(results))
        if len(results) == 0:
            await client.send_message(message.channel, "Sorry " + message.author.nick + ", can't find your name, try registering")
        else:
            print("madeit")
            await client.send_message(message.channel, "LeagueUsername: " + results[0]['LeagueUsername'])

    elif command in ['!fullstop']:
        sys.exit()


#if __name__ == "__main__":
client.run(discord_token)
