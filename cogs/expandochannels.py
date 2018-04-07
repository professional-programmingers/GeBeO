import os
import json
import discord
from discord.ext import commands

class ExpandoChannels():
    def __init__(self, bot : commands.Bot):
        print("initializing expandochannels")
        self.bot = bot

    @commands.command()
    async def renamevc(self, ctx):
        if ctx.message.author.voice is not None:
            if ctx.message.author.voice.channel is not None:
                if ctx.message.author.voice.channel.name[0] == "🎮":
                    if self.bot.config[ctx.guild.id]["expando_channels"]:
                        await ctx.message.author.voice.channel.edit(name="🎮 " + ctx.arg)
                    else :
                        await ctx.send("Your admins have disabled Expando Channels. Get them to enable it to use this feature!")

    async def update_empty_channel(self, starting_channel):
        #Go through expando channels starting with the channel that was triggered
        chan_index = starting_channel.guild.voice_channels.index(starting_channel)
        last_pos = 0
        for vc in starting_channel.guild.voice_channels[chan_index:]:
            if vc.name[0] == "🎮":
                last_pos = vc.position
            else:
                break
        new_chan = await starting_channel.guild.create_voice_channel("🎮 " + self.bot.config["default_channel_name"], category=starting_channel.category)
        #Try to move the new channel to right below the last expando channel (via last_pos).
        #This throws an exception if its being moved to the end of all voice channels, because a move isn't necessary
        if last_pos < len(starting_channel.guild.voice_channels):
            await new_chan.edit(position=last_pos + 1)

    async def on_voice_state_update(self, member, before: discord.VoiceState, after: discord.VoiceState):
        #Don't update if the channels are the same (only voice state was updated)
        if before.channel == after.channel:
            return

        if before.channel is not None:
            if len(before.channel.members) == 0 and before.channel.name[0] == "🎮":
                if self.bot.config[before.channel.guild.id]["expando_channels"]:
                    await before.channel.delete()
        if after.channel is not None:
            if len(after.channel.members) == 1 and after.channel.name[0] == "🎮":
                if self.bot.config[after.channel.guild.id]["expando_channels"]:
                    await self.update_empty_channel(after.channel)

def setup(bot : commands.Bot):
    print("setting up expandochannels")
    bot.add_cog(ExpandoChannels(bot))
