from discord.ext import commands
import sys

class Debug():
    def __init__(self, bot : commands.Bot):
        print("initializing debug")
        if len(sys.argv) > 1:
            if sys.argv[1] == '--debug':
                print("Running with debug mode on! Don't run this in production!")
                debugarg = True
        self.bot = bot

    debugarg = False

    @commands.command(pass_context=True)
    async def d(self, ctx : commands.Context):
        if self.debugarg:
            arg = ' '.join(ctx.message.content.split(' ')[1:])
            exec(arg)

    @commands.command()
    async def headcount(self):
        await self.bot.say("here!")

def setup(bot : commands.Bot):
    print("setting up debug")
    bot.add_cog(Debug(bot))

