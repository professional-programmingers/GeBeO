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
        tz = pytz.timezone('America/Los_Angeles')
        current_time = datetime.now(tz)
        last_weekday = current_time.weekday()
        print("Started day detector at: " + str(datetime.now(tz)))
        while True:
            current_time = datetime.now(tz)
            print("Checking for day change!")
            print("Current time: " + str(current_time))
            print("Weekday = " + str(current_time.weekday()))

            await self.year_percentage(current_time, tz)

            current_weekday = current_time.weekday()
            if current_weekday != last_weekday:
                last_weekday = current_weekday

                await self.wednesday_detector(current_time)

            for i in range(60):
                await asyncio.sleep(1)

    async def wednesday_detector(self, current_time):
        if current_time.weekday() == 2:
            my_dudes = "<:MyDudes:304341572168712193> "
            msg = my_dudes * 3 + "It is Wednesday my dudes" + my_dudes * 3
            for g in self.bot.guilds:
                if self.bot.config[g.id]["wed_detector_channel"] == None:
                    chan = self.bot.get_channel(self.bot.config[g.id]["wed_detector_channel"])
                    await chan.send(msg)
            await asyncio.sleep(30)
            for g in self.bot.guilds:
                if self.bot.config[g.id]["wed_detector_channel"] == None:
                    chan = self.bot.get_channel(self.bot.config[g.id]["wed_detector_channel"])
                    await chan.send(self.wednesday_self_reply[random.randrange(len(self.wednesday_self_reply))])

    async def year_percentage(self, current_time, tz):
        year_date_range = datetime(current_time.year + 1, 1, 1) - datetime(current_time.year, 1, 1)
        year_num_seconds = year_date_range.total_seconds()
        today_date_range = current_time - datetime(current_time.year, 1, 1, tzinfo=tz)
        today_num_seconds = today_date_range.total_seconds()
        percent_complete = round((today_num_seconds / year_num_seconds) * 100000) / 1000
        await self.bot.change_presence(game=discord.Game(name="{:0.3f}".format(percent_complete) + "% thru " + str(current_time.year) + "!"), status=discord.Status.online, afk=False)

    async def on_ready(self):
        self.bot.loop.create_task(self.day_detector())

def setup(bot : commands.Bot):
    print("setting up daydetector")
    bot.add_cog(DayDetector(bot))
