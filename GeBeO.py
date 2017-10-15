from datetime import datetime
import asyncio
from random import randint
import pytz
import discord
import emojitable
import time
from cowpy import cow
import re
import os
import random
import sys

expanding_channels = None
DEBUG = False

f = open("tokens/discord.cfg", "r")
discord_token = f.read().strip()
f.close()

client = discord.Client()

wednesday_self_reply = ["IT IS",
                        "IT IS IT IS",
                        "IT IS!"
                        ]


async def wednesday_detector():
    await client.wait_until_ready()
    currently_wednesday = True
    tz = pytz.timezone('America/Los_Angeles')
    print("Started wednesday detector at: " + str(datetime.now(tz)))
    while True:
        print("Checking for Wednesday!")
        current_time = datetime.now(tz)
        print("Current time: " + str(current_time))
        print("Weekday = " + str(current_time.weekday()))
        if current_time.weekday() == 2:
            if not currently_wednesday:
                currently_wednesday = True
                my_dudes = "<:MyDudes:304341572168712193> "
                chan = client.get_channel('137685095111720961')
                msg = my_dudes * 3 + "It is Wednesday my dudes" + my_dudes * 3
                await client.send_message(chan, msg)
                await asyncio.sleep(30)
                await client.send_message(chan, wednesday_self_reply[random.randrange(len(wednesday_self_reply))])
        else:
            currently_wednesday = False
        await asyncio.sleep(60)


async def timer(duration, length, channel):
    if duration < 1:
        return
    counter = 1
    text = "```diff\n-  0 |" + " "*length + "| " + str(duration) + "\n```"
    # Send message
    message = await client.send_message(channel, text)
    while counter <= duration:
        time.sleep(1)
        # Coloring
        if counter <= float(duration)/3:
            text = "```diff\n-"
        elif counter <= float(duration)*2/3:
            text = "```fix\n "
        else:
            text = "```diff\n+"
        # Countup counter
        text += "  " + str(counter) + " |"
        # Progress bar calculation
        progress = int(round(((float(counter)/duration*length))))
        strdur = str(duration)
        text += "-"*progress + " "*(length-progress) + "| " + strdur + "\n```"
        await client.edit_message(message, text)
        counter += 1
    await client.add_reaction(message, u"\U000023F0")


async def react(text, message):
    space_counter = 0
    for char in text:
        if char == ' ':
            emoji = emojitable.table[char][space_counter]
            space_counter += 1
        else:
            emoji = emojitable.table[char]
        await client.add_reaction(message, emoji)


@client.event
async def on_ready():
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    client.loop.create_task(wednesday_detector())  # Start up wednesay detector
    print('------')


@client.event
async def on_message(message):
    print(message.author.name + ": " + message.content)
    message_split = message.content.split(' ')
    command = message_split[0]
    # Args split into multiple (cannot have space as an argument)
    args_split = message_split[1:]
    arg = ' '.join(args_split)  # One arg with spaces.

    if command in ['!ayy']:
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
        nick = message.author.nick
        await client.send_message(message.channel, "*sucks " + nick + " off*")

    elif command in ['!esad']:
        await client.delete_message(message)
        await client.send_file(message.channel, "eatshitanddie.png")

    elif command in ['!kermit']:
        await client.delete_message(message)
        await client.send_file(message.channel, "kermit.gif")

    elif command in ['!cowsay']:
        await client.delete_message(message)
        messages = client.logs_from(message.channel, limit=1, before=message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            random_cow = cow.milk_random_cow(to_edit)
            edited = '```' + re.sub('```', '', random_cow) + '```'
            await client.send_message(message.channel, edited)

    elif command in ['!doubt', '!suspect']:
        await client.delete_message(message)
        await client.send_file(message.channel, "assets/doubt.png")

    elif command in ['!react'] and arg:
        last_message = []
        async for i in client.logs_from(message.channel, limit=2):
            last_message.append(i)
        last_message = last_message[1]
        client.loop.create_task(react(arg, last_message))
        await client.delete_message(message)

    elif command in ['!retard', '!rt']:
        await client.delete_message(message)
        messages = client.logs_from(message.channel, limit=1, before=message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            edited = ''
            for char in to_edit:
                if randint(0, 1) == 0:
                    edited += char.upper()
            await client.send_message(message.channel, edited)

    elif command in ['!mock']:
        await client.delete_message(message)
        messages = client.logs_from(message.channel, limit=1, before=message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            edited = ''
            for char in to_edit:
                if randint(0, 1) == 0:
                    edited += char.upper()
                else:
                    edited += char.lower()
            await client.send_message(message.channel, edited)

    elif command in ['!timer']:
        if len(args_split) == 1:
            duration = int(args_split[0])
            client.loop.create_task(timer(duration, 100, message.channel))
        elif len(args_split) == 2:
            duration = int(args_split[0])
            length = int(args_split[1])
            client.loop.create_task(timer(duration, length, message.channel))

    elif command in ['!i']:
        await client.delete_message(message)
        if len(args_split) == 0:
            listofimages = ""
            for img in os.listdir("images"):
                listofimages += img.split(".")[0] + "\n"
            await client.send_message(message.channel, listofimages)
        elif len(args_split) == 1:
            for img in os.listdir("images"):
                if img.split(".")[0] == args_split[0]:
                    await client.send_file(message.channel, "images/" + img)

    elif command in ['!d']:
        if DEBUG:
            exec(arg)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--debug':
            print("Running with debug mode on! Don't run this in production!")
            DEBUG = True
    client.run(discord_token)
