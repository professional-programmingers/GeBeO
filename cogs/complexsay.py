from discord.ext import commands
from cowpy import cow
import re
from random import randint
import asyncio

class ComplexSay():
    def __init__(self, bot : commands.Bot):
        print("initializing complexsay")
        self.bot = bot

    @commands.command(pass_context=True)
    async def cowsay(self, ctx : commands.Context):
        await asyncio.sleep(0.25)
        await self.bot.delete_message(ctx.message)
        messages = self.bot.logs_from(ctx.message.channel, limit=1, before=ctx.message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            random_cow = cow.milk_random_cow(to_edit)
            edited = '```' + re.sub('```', '', random_cow) + '```'
            await self.bot.say(edited)

    @commands.command(pass_context=True)
    async def rt(self, ctx : commands.Context):
        await asyncio.sleep(0.25)
        await self.bot.delete_message(ctx.message)
        messages = self.bot.logs_from(ctx.message.channel, limit=1, before=ctx.message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            edited = ''
            for char in to_edit:
                if randint(0, 1) == 0:
                    edited += char.upper()
            await self.bot.say(edited)

    @commands.command(pass_context=True)
    async def mock(self, ctx : commands.Context):
        await asyncio.sleep(0.25)
        await self.bot.delete_message(ctx.message)
        messages = self.bot.logs_from(ctx.message.channel, limit=1, before=ctx.message)
        async for message_to_edit in messages:
            to_edit = message_to_edit.content
            edited = ''
            for char in to_edit:
                if randint(0, 1) == 0:
                    edited += char.upper()
                else:
                    edited += char.lower()
            await self.bot.say(edited)


    @commands.command(pass_context=True)
    async def vote(self, ctx : commands.Context):
        await asyncio.sleep(0.25)
        await self.bot.delete_message(ctx.message)
        votekick_msg = await self.bot.say(ctx.arg)
        await self.bot.add_reaction(votekick_msg, "✅")
        await self.bot.add_reaction(votekick_msg, "❎")

    @commands.command(pass_context=True)
    async def say(self, ctx : commands.Context):
        await asyncio.sleep(0.25)
        await self.bot.say(ctx.arg)
        await self.bot.delete_message(ctx.message)

def setup(bot):
    print("setting up complexsay")
    bot.add_cog(ComplexSay(bot))