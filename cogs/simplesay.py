from discord.ext import commands
import asyncio

class SimpleSay():
    def __init__(self, bot):
        print("initializing simplesay")
        self.bot = bot
        self.nickname_lock = asyncio.Lock()

    async def nickname_message(self, ctx, nick : str, msg : str):
        await self.nickname_lock.acquire()
        nickname = ctx.guild.me.display_name
        await ctx.message.delete()
        await ctx.guild.me.edit(nick=nick)
        await ctx.send(msg)
        await ctx.guild.me.edit(nick=nickname)
        self.nickname_lock.release()

    @commands.command()
    async def ayy(self, ctx):
        await self.nickname_message(ctx, "ayy", "lmao")

    @commands.command(aliases=["me2"])
    async def metoo(self, ctx):
        await self.nickname_message(ctx, "Me Too", "Thanks")

    @commands.command()
    async def blowme(self, ctx):
        await ctx.message.delete()
        await ctx.send("*sucks " + ctx.message.author.display_name + " off*")

    @commands.command()
    async def avatar(self, ctx):
        """
        Send the URL of the sender or the specified person's avatar
        USAGE: !avatar (optional: ping specified user)
        """
        await ctx.trigger_typing()
        if len(ctx.args_split) == 0:
            await ctx.send(ctx.message.author.avatar_url)
        else:
            if len(ctx.message.mentions) == 0:
                await ctx.send("Please mention a user to get the avatar of!")
            else:
                await ctx.send(ctx.message.mentions[0].avatar_url)

def setup(bot):
    print("setting up simplesay")
    bot.add_cog(SimpleSay(bot))