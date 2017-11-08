from datetime import datetime
import asyncio
import pytz
import discord
from discord.ext import commands
import time
import os
import random
import json
import sys

startup_extensions = ["simplesay", "complexsay", "react", "timer", "filebased"]

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

bot : commands.Bot = commands.Bot(command_prefix='!', max_messages=5000)

wednesday_self_reply = ["IT IS",
                        "IT IS IT IS",
                        "IT IS!"
                        ]

async def wednesday_detector():
    await bot.wait_until_ready()
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
        await bot.change_presence(game=discord.Game(name=str(christmas_count.days) + " days to Christmas"), status=discord.Status.online, afk=False)
        current_weekday = current_time.weekday()
        if current_weekday != last_weekday:
            last_weekday = current_weekday
            if current_weekday == 2:
                my_dudes = "<:MyDudes:304341572168712193> "
                chan = bot.get_channel(wed_detector_channel)
                msg = my_dudes * 3 + "It is Wednesday my dudes" + my_dudes * 3
                await bot.send_message(chan, msg)
                await asyncio.sleep(30)
                await bot.send_message(chan, wednesday_self_reply[random.randrange(len(wednesday_self_reply))])
        await asyncio.sleep(60)

@bot.event
async def on_ready():
    print('Logged in as')
    print(bot.user.name)
    print(bot.user.id)

    bot.loop.create_task(wednesday_detector())  # Start up wednesay detector
    todelete = []
    for rolemsg in role_msg_list:
        rolemsg_channel = bot.get_channel(rolemsg["msg_chan_id"])
        try:
            rolemsg_message = await bot.get_message(rolemsg_channel, rolemsg["msg_id"])
            bot.messages.append(rolemsg_message)
        except discord.NotFound:
            todelete.append(rolemsg)
    role_msg_list[:] = [r for r in role_msg_list if r not in todelete]
    role_msg_cache = open("cache/rolemsg.txt", "w")
    role_msg_cache.write(json.dumps(role_msg_list))
    print('------')


@bot.event
async def on_reaction_add(reaction, user):
    print("reaction detected")
    for rmsg in role_msg_list:
        if reaction.message.id == rmsg["msg_id"]:
            if reaction.emoji == "✅":
                for r in reaction.message.server.roles:
                    if r.name == rmsg["role_name"]:
                        await bot.add_roles(user, r)
                        return
            else:
                await bot.remove_reaction(reaction.message, reaction.emoji, user)


@bot.event
async def on_reaction_remove(reaction, user):
    for rmsg in role_msg_list:
        if reaction.message.id == rmsg["msg_id"]:
            for r in reaction.message.server.roles:
                if r.name == rmsg["role_name"]:
                    await bot.remove_roles(user, r)
                    return
'''
@bot.event
async def on_message(message):
    global cache_counter
    is_admin = message.author.top_role.permissions.administrator
    print(message.author.top_role.name)
    print(message.author.name + ": " + message.content)
    if message.author.id == bot.user.id:
        return
    if is_admin:
        print("ISADMIN")
    cache_counter = cache_counter + 1
    if cache_counter > 4500:
        cache_counter = 0
        todelete = []
        for rolemsg in role_msg_list:
            rolemsg_channel = bot.get_channel(rolemsg["msg_chan_id"])
            try:
                rolemsg_message = await bot.get_message(rolemsg_channel, rolemsg["msg_id"])
                bot.messages.append(rolemsg_message)
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

    elif command in ['!rolemsg']:
        if is_admin:
            await bot.delete_message(message)
            if len(args_split) < 2:
                await bot.send_message(message.channel, "Wrong")
            else:
                role = None
                print(args_split[-1])
                for r in message.server.roles:
                    if r.name == args_split[-1]:
                        role = r
                if role is None:
                    await bot.send_message(message.channel, "Can't find that role")
                    return
                sent_msg = await bot.send_message(message.channel, " ".join(args_split[0:-1]))
                await bot.add_reaction(sent_msg, "✅")
                role_msg = {}
                role_msg["msg_id"] = sent_msg.id
                role_msg["msg_chan_id"] = sent_msg.channel.id
                role_msg["role_name"] = args_split[-1]
                role_msg_list.append(role_msg)
                role_msg_cache = open("cache/rolemsg.txt", "w")
                role_msg_cache.write(json.dumps(role_msg_list))
        else:
            await bot.delete_message(message)
            await bot.send_message(message.channel, "Sorry, you must be admin to use that command!")

    elif command in ['!headcount']:
        if is_admin:
            await bot.send_message(message.channel, "here!")
        else:
            await bot.delete_message(message)
            await bot.send_message(message.channel, "Sorry, you must be admin to use that command!")

    elif command in ['!d']:
        if DEBUG:
            exec(arg)
            '''

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--debug':
            print("Running with debug mode on! Don't run this in production!")
            DEBUG = True
    for extension in startup_extensions:
        try:
            print("loading extension")
            bot.load_extension("cogs." + extension)
        except Exception as e:
            exc = '{}: {}'.format(type(e).__name__, e)
            print('Failed to load extension {}\n{}'.format(extension, exec))
    bot.run(discord_token)
