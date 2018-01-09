import discord
from discord.ext import commands

class ExpandoChannels():
    def __init__(self, bot : commands.Bot):
        print("initializing expandochannels")
        self.bot = bot

    @commands.command()
    async def lfg(self, ctx):
        await ctx.trigger_typing()
        name = None
        if len(ctx.args_split) == 0:
            name = self.bot.config["default_channel_name"]
        else:
            name = ctx.arg
        found_channels = False
        last_chan = None
        for vc in ctx.guild.voice_channels:
            if "#" in vc.name:
                found_channels = True
                last_chan = vc
            else:
                if found_channels:
                    break
        new_num = int(last_chan.name.split("#")[-1]) + 1
        new_chan = await ctx.guild.create_voice_channel(name + " #" + str(new_num), category=last_chan.category)
        await new_chan.edit(position = last_chan.position + 1)
        await ctx.send("Made a voice channel called " + name + "!")

    async def on_voice_state_update(self, member, before: discord.VoiceState, after: discord.VoiceState):
        if before.channel is not None:
            if "#" in before.channel.name and not before.channel.name.split("#")[-1] == "1":
                if len(before.channel.members) == 0:
                    await before.channel.delete()


def setup(bot : commands.Bot):
    print("setting up expandochannels")
    bot.add_cog(ExpandoChannels(bot))