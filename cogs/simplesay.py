from discord.ext import commands
import asyncio

class SimpleSay():
    def __init__(self, bot : commands.Bot):
        print("initializing simplesay")
        self.bot = bot
        self.nickname_lock = asyncio.Lock()

    async def nickname_message(self, ctx : commands.Context, nick : str, msg : str):
        await self.nickname_lock.acquire()
        nickname = ctx.guild.me.display_name
        await ctx.message.delete()
        await ctx.guild.me.edit(nick=nick)
        await ctx.send(msg)
        await ctx.guild.me.edit(nick=nickname)
        self.nickname_lock.release()

    @commands.command()
    async def ayy(self, ctx : commands.Context):
        await self.nickname_message(ctx, "ayy", "lmao")

    @commands.command(aliases=["me2"])
    async def metoo(self, ctx : commands.Context):
        await self.nickname_message(ctx, "Me Too", "Thanks")

    @commands.command()
    async def blowme(self, ctx : commands.Context):
        await ctx.message.delete()
        await ctx.send("*sucks " + ctx.message.author.display_name + " off*")

def setup(bot):
    print("setting up simplesay")
    bot.add_cog(SimpleSay(bot))