from discord.ext import commands
from cowpy import cow
import re
from random import randint
import asyncio

class ComplexSay():
    def __init__(self, bot : commands.Bot):
        print("initializing complexsay")
        self.bot = bot

    @commands.command()
    async def cowsay(self, ctx):
        await ctx.message.delete()
        messages = ctx.channel.history(limit=1, before=ctx.message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            random_cow = cow.milk_random_cow(to_edit)
            edited = '```' + re.sub('```', '', random_cow) + '```'
            await ctx.send(edited)

    @commands.command()
    async def rt(self, ctx):
        await ctx.message.delete()
        messages = ctx.channel.history(limit=1, before=ctx.message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            edited = ''
            for char in to_edit:
                if randint(0, 1) == 0:
                    edited += char.upper()
            await ctx.send(edited)

    @commands.command()
    async def mock(self, ctx):
        await ctx.message.delete()
        messages = ctx.channel.history(limit=1, before=ctx.message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            edited = ''
            for char in to_edit:
                if randint(0, 1) == 0:
                    edited += char.upper()
                else:
                    edited += char.lower()
            await ctx.send(edited)


    @commands.command()
    async def vote(self, ctx):
        await ctx.message.delete()
        votekick_msg = await ctx.send(ctx.arg)
        await votekick_msg.add_reaction("✅")
        await votekick_msg.add_reaction("❎")

    @commands.command()
    async def say(self, ctx):
        await ctx.send(ctx.arg)
        await ctx.message.delete()

def setup(bot):
    print("setting up complexsay")
    bot.add_cog(ComplexSay(bot))