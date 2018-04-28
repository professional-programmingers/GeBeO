from discord.ext import commands
import discord
import asyncio

class Administration():
    def __init__(self, bot):
        print("initializing administration")
        self.bot = bot

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def edit(self, ctx):
        if not len(ctx.args_split) == 0:
            try:
                msgid = int(ctx.args_split[0])
                msg = await ctx.get_message(msgid)
                await msg.edit(content=" ".join(ctx.args_split[1:]))
                await ctx.message.delete()
            except ValueError:
                await ctx.send("That's not a valid message id!", delete_after=10)
            except discord.NotFound:
                await ctx.send("Can't find that message!", delete_after=10)


def setup(bot):
    print("setting up administration")
    bot.add_cog(Administration(bot))
