from discord.ext import commands
import emojitable
import asyncio

class React():
    def __init__(self, bot : commands.Bot):
        print("initializing react")
        self.bot = bot

    async def reacthelper(self, text, message):
        space_counter = 0
        for char in text:
            found = False
            if char == ' ':
                if space_counter < len(emojitable.table[char]):
                    emoji = emojitable.table[char][space_counter]
                    space_counter += 1
                    found = True
            else:
                emoji = emojitable.table[char]
                found = True
            if found:
                await message.add_reaction(emoji)

    @commands.command()
    async def react(self, ctx):
        await ctx.trigger_typing()
        last_message = []
        async for i in ctx.channel.history(limit=2):
            last_message.append(i)
        last_message = last_message[1]
        self.bot.loop.create_task(self.reacthelper(ctx.arg, last_message))
        await ctx.message.delete()

def setup(bot):
    print("setting up react")
    bot.add_cog(React(bot))