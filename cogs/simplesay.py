from discord.ext import commands

class SimpleSay():
    def __init__(self, bot : commands.Bot):
        print("initializing simplesay")
        self.bot = bot

    async def nickname_message(self, ctx : commands.Context, nick : str, msg : str):
        nickname = ctx.message.server.me.nick
        await self.bot.delete_message(ctx.message)
        await self.bot.change_nickname(ctx.message.server.me, nick)
        await self.bot.say(msg)
        await self.bot.change_nickname(ctx.message.server.me, nickname)

    @commands.command(pass_context=True)
    async def ayy(self, ctx : commands.Context):
        await self.nickname_message(ctx, "ayy", "lmao")

    @commands.command(aliases=["me2"], pass_context=True)
    async def metoo(self, ctx : commands.Context):
        await self.nickname_message(ctx, "Me Too", "Thanks")

    @commands.command(pass_context=True)
    async def blowme(self, ctx : commands.Context):
        await self.bot.delete_message(ctx.message)
        await self.bot.say("*sucks " + ctx.message.author + " off*")

def setup(bot):
    print("setting up simplesay")
    bot.add_cog(SimpleSay(bot))