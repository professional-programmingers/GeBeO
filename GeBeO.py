from discord.ext import commands
import sys

startup_extensions = ["simplesay", "complexsay", "react", "timer", "images", "sounds", "rolemsg", "daydetector", "debugcmds", "github"]


class GeBeOContext(commands.Context):
    args_split = None
    arg = None


class GeBeOBot(commands.Bot):

    config = {}

    async def on_message(self, message):
        ctx = await self.get_context(message, cls=GeBeOContext)
        print(ctx.message.author.display_name + ": " + ctx.message.content)
        ctx.args_split = ctx.message.content.split(' ')[1:]
        ctx.arg = ' '.join(ctx.args_split)
        await self.invoke(ctx)


    async def on_command_error(self, ctx, error):
        if isinstance(error, commands.errors.CommandInvokeError):
            print(error.original.with_traceback())
        elif isinstance(error, commands.errors.MissingPermissions):
            await ctx.message.delete()
            await ctx.send("Sorry, you must be admin to use that command!")


    async def on_ready(self):
        print('Logged in as')
        print(bot.user.name)
        print(bot.user.id)
        print('------')


if __name__ == '__main__':
    f = open("tokens/discord.cfg", "r")
    discord_token = f.read().strip()
    f.close()

    bot = GeBeOBot(command_prefix='!', max_messages=5000)
    # Config dictionary to be passed around.
    bot.config = {
            "debug" : False,
            }  

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
