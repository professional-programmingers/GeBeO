import discord
from discord.ext import commands

class ExpandoChannels():
    def __init__(self, bot : commands.Bot):
        print("initializing expandochannels")
        self.bot = bot

    async def update_empty_channel(self, starting_channel):
        vclist = starting_channel.guild.voice_channels
        starting_name = "#".join(starting_channel.name.split("#")[:-1])
        counter = 0
        lastvc = None
        looking_for_pos = True
        put_after_this_vc = None
        origin_is_empty = False
        found_channels = False
        for vc in vclist:
            if "#" in vc.name:
                split_name = vc.name.split("#")
                current_name = "#".join(split_name[:-1])
                if starting_name == current_name:
                    found_channels = True
                    current_position = int(split_name[-1])
                    if len(vc.members) == 0:
                        if current_position == 1:
                            origin_is_empty = True
                        else:
                            await vc.delete()
                        continue
                    if looking_for_pos:
                        counter += 1
                        if current_position > counter:
                            looking_for_pos = False
                            put_after_this_vc = lastvc.id
                else:
                    if found_channels:
                        break
                lastvc = vc
        if not origin_is_empty:
            if looking_for_pos:
                counter += 1
                put_after_this_vc = lastvc.id
            thevc = self.bot.get_channel(put_after_this_vc)
            new_empty_channel = await lastvc.guild.create_voice_channel(starting_name + "#" + str(counter), category=thevc.category)
            new_position = thevc.position + 1
            await new_empty_channel.edit(position = new_position)

    async def on_voice_state_update(self, member, before: discord.VoiceState, after: discord.VoiceState):
        if before.channel is not None and after.channel is not None:
            if before.channel.name.split("#")[:-1] == after.channel.name.split("#")[:-1]:
                await self.update_empty_channel(before.channel)
                return
        if before.channel is not None:
            if "#" in before.channel.name:
                await self.update_empty_channel(before.channel)
        if after.channel is not None:
            if "#" in after.channel.name:
                await self.update_empty_channel(after.channel)

def setup(bot : commands.Bot):
    print("setting up expandochannels")
    bot.add_cog(ExpandoChannels(bot))

