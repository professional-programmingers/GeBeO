from discord.ext import commands
import asyncio
import random

class SimpleSay():
    def __init__(self, bot):
        print("initializing simplesay")
        self.bot = bot
        self.nickname_lock = asyncio.Lock()

    async def nickname_message(self, ctx, nick : str, msg : str):
        await ctx.trigger_typing()
        await self.nickname_lock.acquire()
        nickname = ctx.guild.me.display_name
        await ctx.guild.me.edit(nick=nick)
        await ctx.send(msg)
        await ctx.guild.me.edit(nick=nickname)
        await ctx.message.delete()
        self.nickname_lock.release()

    @commands.command()
    async def ayy(self, ctx):
        await self.nickname_message(ctx, "ayy", "lmao")

    @commands.command(aliases=["me2"])
    async def metoo(self, ctx):
        await self.nickname_message(ctx, "Me Too", "Thanks")

    @commands.command()
    async def blowme(self, ctx):
        await ctx.trigger_typing()
        await ctx.send("*sucks " + ctx.message.author.display_name + " off*")
        await ctx.message.delete()

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

    @commands.command()
    async def disapprove(self, ctx):
        """
        I disapprove of this command.
        """
        await ctx.trigger_typing()
        await ctx.send("ಠ_ಠ")
        await ctx.message.delete()

    @commands.command()
    async def roll(self, ctx):
        rollstrs = []
        sum = 0
        for s in ctx.args_split:
            if "d" in s:
                dice_split = s.split("d")
                if len(dice_split) == 2:
                    try:
                        numdice = int(dice_split[0])
                        numsides = int(dice_split[1])
                        if numdice > 0 and numsides > 0:
                            rollstr = s + ": "
                            for i in range(0, numdice):
                                roll = random.randint(1, numsides)
                                sum += roll
                                rollstr += str(roll)
                                if not i == numdice - 1:
                                    rollstr += ", "
                            rollstrs.append(rollstr)
                    except:
                        pass
        if len(rollstrs) > 0:
            msg = "`roll"
            if not len(rollstrs) == 1:
                msg += "s"
            msg += ":`\n"
            for rs in rollstrs:
                msg += "`" + rs + "`\n"
            msg += "`sum: " + str(sum) + "`"
            await ctx.send(msg)

def setup(bot):
    print("setting up simplesay")
    bot.add_cog(SimpleSay(bot))
