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

startup_extensions = ["simplesay", "complexsay", "react", "timer", "filebased", "rolemsg", "daydetector", "debug"]

f = open("tokens/discord.cfg", "r")
discord_token = f.read().strip()
f.close()

bot : commands.Bot = commands.Bot(command_prefix='!', max_messages=5000)

@bot.listen
async def on_ready():
    print('Logged in as')
    print(bot.user.name)
    print(bot.user.id)
    print('------')

if __name__ == '__main__':
    if not os.path.exists("cache"):
        os.makedirs("cache")

    for extension in startup_extensions:
        try:
            print("loading extension")
            bot.load_extension("cogs." + extension)
        except Exception as e:
            exc = '{}: {}'.format(type(e).__name__, e)
            print('Failed to load extension {}\n{}'.format(extension, exec))
    bot.run(discord_token)
