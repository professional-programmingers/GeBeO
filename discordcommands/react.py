from discord.ext import commands
import emojitable

class React():
    def __init__(self, bot : commands.Bot):
        print("initializing react")
        self.bot = bot

    async def react(self, text, message):
        space_counter = 0
        for char in text:
            if char == ' ':
                emoji = emojitable.table[char][space_counter]
                space_counter += 1
            else:
                emoji = emojitable.table[char]
            await self.bot.add_reaction(message, emoji)

    @commands.command(pass_context=True)
    async def react(self, ctx : commands.Context):
        arg = ' '.join(ctx.message.content.split(' ')[1:])
        last_message = []
        async for i in self.bot.logs_from(ctx.message.channel, limit=2):
            last_message.append(i)
        last_message = last_message[1]
        self.bot.loop.create_task(self.react(arg, last_message))
        await self.bot.delete_message(ctx.message)

def setup(bot):
    print("setting up react")
    bot.add_cog(React(bot))