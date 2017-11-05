from datetime import datetime
import asyncio
from random import randint
import pytz
import discord
import requests
import emojitable
import time
from cowpy import cow
import re
import os
import random
import json
import sys

expanding_channels = None
DEBUG = False

if not os.path.exists("cache"):
    os.makedirs("cache")

if not os.path.exists("images"):
    os.makedirs("images")

if not os.path.exists("sounds"):
    os.makedirs("sounds")

role_msg_list = None
if os.path.isfile("cache/rolemsg.txt") and os.stat("cache/rolemsg.txt").st_size != 0:
    role_msg_list = json.loads(open("cache/rolemsg.txt", "r").read())
else:
    role_msg_list = []
    open("cache/rolemsg.txt", 'w+')

f = open("tokens/discord.cfg", "r")
discord_token = f.read().strip()
f.close()

cache_counter = 0

client = discord.Client(max_messages=5000)

wednesday_self_reply = ["IT IS",
                        "IT IS IT IS",
                        "IT IS!"
                        ]

async def wednesday_detector():
    await client.wait_until_ready()
    wed_detector_channel = "370316975659810816"
    tz = pytz.timezone('America/Los_Angeles')
    current_time = datetime.now(tz)
    last_weekday = current_time.weekday()
    print("Started wednesday detector at: " + str(datetime.now(tz)))
    while True:
        print("Checking for day change!")
        print("Current time: " + str(current_time))
        print("Weekday = " + str(current_time.weekday()))
        christmas = datetime(current_time.year, 12, 25, tzinfo=tz)
        if christmas < current_time:
            christmas = datetime(current_time.year + 1, 12, 25, tzinfo=tz)
        christmas_count = christmas - current_time
        await client.change_presence(game=discord.Game(name=str(christmas_count.days) + " days to Christmas"), status=discord.Status.online, afk=False)
        current_weekday = current_time.weekday()
        if current_weekday != last_weekday:
            last_weekday = current_weekday
            if current_weekday == 2:
                my_dudes = "<:MyDudes:304341572168712193> "
                chan = client.get_channel(wed_detector_channel)
                msg = my_dudes * 3 + "It is Wednesday my dudes" + my_dudes * 3
                await client.send_message(chan, msg)
                await asyncio.sleep(30)
                await client.send_message(chan, wednesday_self_reply[random.randrange(len(wednesday_self_reply))])
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


def after_sound_clip(player):
    player.vc.loop.create_task(player.vc.disconnect())


@client.event
async def on_ready():
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)

    client.loop.create_task(wednesday_detector())  # Start up wednesay detector
    todelete = []
    for rolemsg in role_msg_list:
        rolemsg_channel = client.get_channel(rolemsg["msg_chan_id"])
        try:
            rolemsg_message = await client.get_message(rolemsg_channel, rolemsg["msg_id"])
            client.messages.append(rolemsg_message)
        except discord.NotFound:
            todelete.append(rolemsg)
    role_msg_list[:] = [r for r in role_msg_list if r not in todelete]
    role_msg_cache = open("cache/rolemsg.txt", "w")
    role_msg_cache.write(json.dumps(role_msg_list))
    print('------')


@client.event
async def on_reaction_add(reaction, user):
    print("reaction detected")
    for rmsg in role_msg_list:
        if reaction.message.id == rmsg["msg_id"]:
            if reaction.emoji == "✅":
                for r in reaction.message.server.roles:
                    if r.name == rmsg["role_name"]:
                        await client.add_roles(user, r)
                        return
            else:
                await client.remove_reaction(reaction.message, reaction.emoji, user)


@client.event
async def on_reaction_remove(reaction, user):
    for rmsg in role_msg_list:
        if reaction.message.id == rmsg["msg_id"]:
            for r in reaction.message.server.roles:
                if r.name == rmsg["role_name"]:
                    await client.remove_roles(user, r)
                    return


@client.event
async def on_message(message):
    global cache_counter
    is_admin = message.author.top_role.permissions.administrator
    print(message.author.top_role.name)
    print(message.author.name + ": " + message.content)
    if is_admin:
        print("ISADMIN")
    cache_counter = cache_counter + 1
    if cache_counter > 4500:
        cache_counter = 0
        todelete = []
        for rolemsg in role_msg_list:
            rolemsg_channel = client.get_channel(rolemsg["msg_chan_id"])
            try:
                rolemsg_message = await client.get_message(rolemsg_channel, rolemsg["msg_id"])
                client.messages.append(rolemsg_message)
            except discord.NotFound:
                todelete.append(rolemsg)
        role_msg_list[:] = [r for r in role_msg_list if r not in todelete]
        role_msg_cache = open("cache/rolemsg.txt", "w")
        role_msg_cache.write(json.dumps(role_msg_list))
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

    elif command in ['!cowsay']:
        await client.delete_message(message)
        messages = client.logs_from(message.channel, limit=1, before=message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            random_cow = cow.milk_random_cow(to_edit)
            edited = '```' + re.sub('```', '', random_cow) + '```'
            await client.send_message(message.channel, edited)

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
        if len(args_split) == 0:
            listofimages = ""
            for img in sorted(os.listdir("images")):
                listofimages += img.split(".")[0] + "\n"
            await client.send_message(message.channel, listofimages)
        elif len(args_split) == 1:
            for img in os.listdir("images"):
                if img.split(".")[0] == args_split[0].lower():
                    await client.send_file(message.channel, "images/" + img)
                    break

    elif command in ['!iadd']:
        if is_admin:
            if len(message.attachments) == 0:
                imageerror = "Remember to attach an image"
                await client.send_message(message.channel, imageerror)
            else:
                imageattachment = message.attachments[0]
                print(imageattachment)
                if len(args_split) == 0:
                    nameerror = "Please specify a name for the image"
                    await client.send_message(message.channel, nameerror)
                else:
                    imgf = open("images/" + args_split[0].lower() + "." + imageattachment["url"].split(".")[-1], "wb")
                    imgf.write(requests.get(imageattachment["url"]).content)
                    imgf.close()
                    await client.send_message(message.channel, "Successfully added " + args_split[0].lower())
            await client.delete_message(message)
        else:
            await client.delete_message(message)
            await client.send_message(message.channel, "Sorry, you must be admin to use that command!")


    elif command in ['!irm']:
        if is_admin:
            await client.delete_message(message)
            if len(args_split) == 0:
                await client.send_message(message.channel, "Which image do I rm?")
            else:
                for img in os.listdir("images"):
                    if img.split(".")[0] == args_split[0]:
                        os.remove("images/" + img)
                        await client.send_message(message.channel, "Removed " + img.split(".")[0])
                        break
        else:
            await client.delete_message(message)
            await client.send_message(message.channel, "Sorry, you must be admin to use that command!")


    elif command in ['!rolemsg']:
        if is_admin:
            await client.delete_message(message)
            if len(args_split) < 2:
                await client.send_message(message.channel, "Wrong")
            else:
                role = None
                print(args_split[-1])
                for r in message.server.roles:
                    if r.name == args_split[-1]:
                        role = r
                if role is None:
                    await client.send_message(message.channel, "Can't find that role")
                    return
                sent_msg = await client.send_message(message.channel, " ".join(args_split[0:-1]))
                await client.add_reaction(sent_msg, "✅")
                role_msg = {}
                role_msg["msg_id"] = sent_msg.id
                role_msg["msg_chan_id"] = sent_msg.channel.id
                role_msg["role_name"] = args_split[-1]
                role_msg_list.append(role_msg)
                role_msg_cache = open("cache/rolemsg.txt", "w")
                role_msg_cache.write(json.dumps(role_msg_list))
        else:
            await client.delete_message(message)
            await client.send_message(message.channel, "Sorry, you must be admin to use that command!")

    elif command in ['!vote']:
        await client.delete_message(message)
        votekick_msg = await client.send_message(message.channel, arg)
        await client.add_reaction(votekick_msg, "✅")
        await client.add_reaction(votekick_msg, "❎")

    elif command in ['!headcount']:
        if is_admin:
            await client.send_message(message.channel, "here!")
        else:
            await client.delete_message(message)
            await client.send_message(message.channel, "Sorry, you must be admin to use that command!")
    
    elif command in ['!s']:
        if len(args_split) == 0:
            listofsounds = ""
            for snd in sorted(os.listdir("sounds")):
                listofsounds += snd.split(".")[0] + "\n"
            await client.send_message(message.channel, listofsounds)
        elif len(args_split) == 1:
            for snd in os.listdir("sounds"):
                if snd.split(".")[0] == args_split[0].lower():
                    vchan = message.author.voice.voice_channel
                    if vchan == None:
                        await client.send_message(message.channel, "You're not in a voice channel!")
                    else:
                        voice = await client.join_voice_channel(vchan)
                        player = voice.create_ffmpeg_player("sounds/" + snd, after=after_sound_clip)
                        player.vc = voice
                        player.start()
                    break

    elif command in ['!sadd']:
        if is_admin:
            if len(message.attachments) == 0:
                sounderror = "Remember to attach a sound file"
                await client.send_message(message.channel, sounderror)
            else:
                soundattachment = message.attachments[0]
                print(soundattachment)
                if len(args_split) == 0:
                    nameerror = "Please specify a name for the image"
                    await client.send_message(message.channel, nameerror)
                else:
                    sndf = open("sounds/" + args_split[0].lower() + "." + soundattachment["url"].split(".")[-1], "wb")
                    sndf.write(requests.get(soundattachment["url"]).content)
                    sndf.close()
                    await client.send_message(message.channel, "Successfully added " + args_split[0].lower())
            await client.delete_message(message)
        else:
            await client.delete_message(message)
            await client.send_message(message.channel, "Sorry, you must be admin to use that command!")


    elif command in ['!srm']:
        if is_admin:
            await client.delete_message(message)
            if len(args_split) == 0:
                await client.send_message(message.channel, "Which sound do I rm?")
            else:
                for snd in os.listdir("sounds"):
                    if snd.split(".")[0] == args_split[0]:
                        os.remove("sounds/" + snd)
                        await client.send_message(message.channel, "Removed " + snd.split(".")[0])
                        break
        else:
            await client.delete_message(message)
            await client.send_message(message.channel, "Sorry, you must be admin to use that command!")

    elif command in ['!sstop']:
        print("stopping voice")
        for vc in client.voice_clients:
            for m in vc.channel.voice_members:
                if message.author == m:
                    await vc.disconnect()
                    return
        await client.send_message(message.channel, "You're not in a voice chat!")

    elif command in ['!yt']:
        vchan = message.author.voice.voice_channel
        if vchan == None:
            await client.send_message(message.channel, "You're not in a voice channel!")
        else:
            voice = await client.join_voice_channel(vchan)
            player = await voice.create_ytdl_player(arg, after=after_sound_clip)
            player.vc = voice
            player.start()


    elif command in ['!d']:
        if DEBUG:
            exec(arg)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--debug':
            print("Running with debug mode on! Don't run this in production!")
            DEBUG = True
    client.run(discord_token)
