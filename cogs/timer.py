from discord.ext import commands
import time

class Timer():
    def __init__(self, bot : commands.Bot):
        print("initializing timer")
        self.bot = bot

    async def timertask(self, duration, length, channel):
        if duration < 1:
            return
        counter = 1
        text = "```diff\n-  0 |" + " "*length + "| " + str(duration) + "\n```"
        # Send message
        message = await self.bot.send_message(channel, text)
        while counter <= duration:
            time.sleep(1)
            # Coloring
            if counter <= float(duration)/3:
                text = "```diff\n-"
            elif counter <= float(duration)*2/3:
                text = "```fix\n "
            else:
                text = "```diff\n+"
            # Countup counter
            text += "  " + str(counter) + " |"
            # Progress bar calculation
            progress = int(round(((float(counter)/duration*length))))
            strdur = str(duration)
            text += "-"*progress + " "*(length-progress) + "| " + strdur + "\n```"
            await self.bot.edit_message(message, text)
            counter += 1
        await self.bot.add_reaction(message, u"\U000023F0")

    @commands.command(pass_context=True)
    async def timer(self, ctx : commands.Context):
        await self.bot.type()
        if len(ctx.args_split) == 1:
            duration = int(ctx.args_split[0])
            self.bot.loop.create_task(self.timertask(duration, 100, ctx.message.channel))
        elif len(ctx.args_split) == 2:
            duration = int(ctx.args_split[0])
            length = int(ctx.args_split[1])
            self.bot.loop.create_task(self.timertask(duration, length, ctx.message.channel))


def setup(bot):
    print("setting up timer")
    bot.add_cog(Timer(bot))