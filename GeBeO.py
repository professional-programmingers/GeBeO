from discord.ext import commands

startup_extensions = ["simplesay", "complexsay", "react", "timer", "filebased", "rolemsg", "daydetector", "debugcmds"]

bot = None

if __name__ == '__main__':

    f = open("tokens/discord.cfg", "r")
    discord_token = f.read().strip()
    f.close()

    bot = commands.Bot(command_prefix='!', max_messages=5000)

    for extension in startup_extensions:
        try:
            print("loading extension")
            bot.load_extension("cogs." + extension)
        except Exception as e:
            exc = '{}: {}'.format(type(e).__name__, e)
            print('Failed to load extension {}\n{}'.format(extension, exc))
    bot.run(discord_token)

@bot.listen
async def on_ready():
    print('Logged in as')
    print(bot.user.name)
    print(bot.user.id)
    print('------')