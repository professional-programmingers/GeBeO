from discord.ext import commands
import asyncio

class DebugCmds():
    def __init__(self, bot : commands.Bot):
        print("initializing debugcmds")
        self.bot = bot

    debugarg = False

    @commands.command(pass_context=True)
    @commands.has_permissions(administrator=True)
    async def d(self, ctx : commands.Context):
        await asyncio.sleep(0.25)
        await self.bot.type()
        if self.bot.config["debug"]:
            exec(ctx.arg)

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def headcount(self):
        await asyncio.sleep(0.25)
        await self.bot.say("here!")

def setup(bot : commands.Bot):
    print("setting up debugcmds")
    bot.add_cog(DebugCmds(bot))
