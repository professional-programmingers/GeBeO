from discord.ext import commands
import sys

startup_extensions = ["simplesay", "complexsay", "react", "timer", "images", "sounds", "rolemsg", "daydetector", "debugcmds", "github"]


async def on_command(command, ctx):
    print(ctx.message.author.nick + ": " + ctx.message.content)
    ctx.args_split = ctx.message.content.split(' ')[1:]
    ctx.arg = ' '.join(ctx.args_split)


async def on_command_error(exception, ctx : commands.Context):
    if isinstance(exception, commands.errors.CommandInvokeError):
        print(exception.original)
    elif isinstance(exception, commands.errors.CheckFailure):
        await bot.delete_message(ctx.message)
        await bot.send_message(ctx.message.channel, "Sorry, you must be admin to use that command!")


async def on_ready():
    print('Logged in as')
    print(bot.user.name)
    print(bot.user.id)
    print('------')


if __name__ == '__main__':
    f = open("tokens/discord.cfg", "r")
    discord_token = f.read().strip()
    f.close()

    bot = commands.Bot(command_prefix='!', max_messages=5000)
    # Config dictionary to be passed around.
    bot.config = {
            "debug" : False,
            }  

    bot.add_listener(on_ready)  # Registers main's on_ready
    bot.add_listener(on_command_error)
    bot.add_listener(on_command)

    if len(sys.argv) > 1:
	# Flag checking.
        if sys.argv[1] == '--debug':
            print("Running with debug mode on! Don't run this in production!")
            bot.config["debug"] = True
	    

    for extension in startup_extensions:
        try:
            print("loading extension")
            bot.load_extension("cogs." + extension)
        except Exception as e:
            exc = '{}: {}'.format(type(e).__name__, e)
            print('Failed to load extension {}\n{}'.format(extension, exc))
    bot.run(discord_token)
