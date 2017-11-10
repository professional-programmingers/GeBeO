from discord.ext import commands
import asyncio

class SimpleSay():
    def __init__(self, bot : commands.Bot):
        print("initializing simplesay")
        self.bot = bot
        self.nickname_lock = asyncio.Lock()

    async def nickname_message(self, ctx : commands.Context, nick : str, msg : str):
        await self.nickname_lock.acquire()
        nickname = ctx.message.server.me.nick
        await self.bot.delete_message(ctx.message)
        await self.bot.change_nickname(ctx.message.server.me, nick)
        await self.bot.say(msg)
        await self.bot.change_nickname(ctx.message.server.me, nickname)
        self.nickname_lock.release()

    @commands.command(pass_context=True)
    async def ayy(self, ctx : commands.Context):
        await asyncio.sleep(0.25)
        await self.nickname_message(ctx, "ayy", "lmao")

    @commands.command(aliases=["me2"], pass_context=True)
    async def metoo(self, ctx : commands.Context):
        await asyncio.sleep(0.25)
        await self.nickname_message(ctx, "Me Too", "Thanks")

    @commands.command(pass_context=True)
    async def blowme(self, ctx : commands.Context):
        await asyncio.sleep(0.25)
        await self.bot.delete_message(ctx.message)
        await self.bot.say("*sucks " + ctx.message.author.nick + " off*")

def setup(bot):
    print("setting up simplesay")
    bot.add_cog(SimpleSay(bot))