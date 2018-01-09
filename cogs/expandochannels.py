import discord
from discord.ext import commands

class ExpandoChannels():
    def __init__(self, bot : commands.Bot):
        print("initializing expandochannels")
        self.bot = bot

<<<<<<< HEAD
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

=======
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
>>>>>>> 4e0f723c2fefe06516b32909c60326f27c068eb8

def setup(bot : commands.Bot):
    print("setting up expandochannels")
    bot.add_cog(ExpandoChannels(bot))

