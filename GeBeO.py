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
print(discord_token)
f.close()

#discord_token = "MTc0NjU1NDY4MjczMjcwNzg2.DBylVQ.bBXPN-KyP3b4gHLc0LbuJ9xFYA0"
#print(discord_token)

client = discord.Client()

dsclient = datastore.Client(project="grillbybot")

async def wednesday_detector():
    currently_wednesday = False
    tz = pytz.timezone('America/Los_Angeles')
    while True:
        current_time = datetime.now(tz)
        if current_time.weekday() == 2:
            if not currently_wednesday:
                currently_wednesday = True
                my_dudes = "<:MyDudes:304341572168712193> "
                await client.send_message(client.get_channel('137685095111720961'), my_dudes * 3 + "It is Wednesday my dudes" + my_dudes * 3)
        else:
            currently_wednesday = False
        time.sleep(1)


@client.event
async def on_ready():
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    print('------')
    loop = asyncio.get_event_loop()
    asyncio.run_coroutine_threadsafe(wednesday_detector(), loop)


@client.event
async def on_message(message):
    print(message.author.name + ": " + message.content)

    if message.content.startswith('!test'):
        counter = 0
        tmp = await client.send_message(message.channel, 'Calculating messages...')
        async for log in client.logs_from(message.channel, limit=100):
            if log.author == message.author:
                counter += 1
        await client.edit_message(tmp, 'You have {} messages.'.format(counter))

    elif message.content.startswith('!sleep'):
        await asyncio.sleep(5)
        await client.send_message(message.channel, 'Done sleeping')

    elif message.content.startswith('!ayy'):
        nickname = message.server.me.nick
        await client.delete_message(message)
        await client.change_nickname(message.server.me, "ayy")
        await client.send_message(message.channel, "lmao")
        await client.change_nickname(message.server.me, nickname)

    elif message.content.startswith('!metoo') or message.content.startswith('!me2'):
        nickname = message.server.me.nick
        await client.delete_message(message)
        await client.change_nickname(message.server.me, "Me Too")
        await client.send_message(message.channel, "Thanks")
        await client.change_nickname(message.server.me, nickname)

    elif message.content.startswith('!blowme'):
        await client.delete_message(message)
        await client.send_message(message.channel, "*sucks " + message.author.nick + " off*")

    elif message.content.startswith('!esad'):
        await client.delete_message(message)
        await client.send_file(message.channel, "eatshitanddie.png")

    elif message.content.startswith('!kermit'):
        await client.delete_message(message)
        await client.send_file(message.channel, "kermit.gif")

    elif message.content.startswith('!saymyname'):
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

    elif message.content.startswith('!fullstop'):
        sys.exit()



client.run(discord_token)
