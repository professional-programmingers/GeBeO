from discord.ext import commands

class DebugCmds():
    def __init__(self, bot : commands.Bot):
        print("initializing debugcmds")
        self.bot = bot

    debugarg = False

    @commands.command(pass_context=True)
    async def d(self, ctx : commands.Context):
        if self.bot.config["debug"]:
            arg = ' '.join(ctx.message.content.split(' ')[1:])
            exec(arg)

    @commands.command()
    async def headcount(self):
        await self.bot.say("here!")

def setup(bot : commands.Bot):
    print("setting up debugcmds")
    bot.add_cog(DebugCmds(bot))
