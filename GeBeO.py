from discord.ext import commands
from BotGeBeO import *
import json
import os

startup_extensions = ["configcmds", "simplesay", "complexsay", "react", "timer", "images", "sounds", "rolemsg", "daydetector", "debugcmds", "github"]


if __name__ == '__main__':
    f = open("tokens/discord.cfg", "r")
    discord_token = f.read().strip()
    f.close()

    bot = BotGeBeO(command_prefix='!', max_messages=5000, pm_help=True)

    for extension in startup_extensions:
        try:
            print("loading extension")
            bot.load_extension("cogs." + extension)
        except Exception as e:
            exc = '{}: {}'.format(type(e).__name__, e)
            print('Failed to load extension {}\n{}'.format(extension, exc))
    bot.run(discord_token)
