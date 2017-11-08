import discord
from discord.ext import commands
import pytz
from datetime import datetime
import asyncio
import random

class DayDetector():
    def __init__(self, bot : commands.Bot):
        print("initializing daydetector")
        self.bot = bot

    wednesday_self_reply = ["IT IS",
                        "IT IS IT IS",
                        "IT IS!"
                        ]

    async def day_detector(self):
        await self.bot.wait_until_ready()
        wed_detector_channel = "167319706863140864"
        tz = pytz.timezone('America/Los_Angeles')
        current_time = datetime.now(tz)
        last_weekday = current_time.minute
        print("Started day detector at: " + str(datetime.now(tz)))
        while True:
            current_time = datetime.now(tz)
            print("Checking for day change!")
            print("Current time: " + str(current_time))
            print("Weekday = " + str(current_time.weekday()))
            christmas = datetime(current_time.year, 12, 25, tzinfo=tz)
            if christmas < current_time:
                christmas = datetime(current_time.year + 1, 12, 25, tzinfo=tz)
            christmas_count = christmas - current_time
            await self.bot.change_presence(game=discord.Game(name=str(christmas_count.days) + " days to Christmas"), status=discord.Status.online, afk=False)
            current_weekday = current_time.minute
            if current_weekday != last_weekday:
                print("ayyyyy we did it")
                last_weekday = current_weekday
                if current_weekday == 23:
                    my_dudes = "<:MyDudes:304341572168712193> "
                    chan = self.bot.get_channel(wed_detector_channel)
                    msg = my_dudes * 3 + "It is Wednesday my dudes" + my_dudes * 3
                    await self.bot.send_message(chan, msg)
                    await asyncio.sleep(30)
                    await self.bot.send_message(chan, self.wednesday_self_reply[random.randrange(len(self.wednesday_self_reply))])
            await asyncio.sleep(60)

    async def on_ready(self):
        self.bot.loop.create_task(self.day_detector())

def setup(bot : commands.Bot):
    print("setting up daydetector")
    bot.add_cog(DayDetector(bot))

