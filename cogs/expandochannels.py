import os
import json
import discord
from discord.ext import commands

class ExpandoChannels():
    def __init__(self, bot : commands.Bot):
        print("initializing expandochannels")
        if not os.path.exists("cache"):
            os.makedirs("cache")
        if os.path.isfile("cache/expandochannel.txt") and os.stat("cache/expandochannel.txt").st_size != 0:
            self.expando_channel_list = json.loads(open("cache/expandochannel.txt", "r").read())
        self.bot = bot

    expando_channel_list = []

    async def on_ready(self):
        self.update_expando_channel_list()

    def update_expando_channel_list(self):
        todelete = []
        for expando_channel in self.expando_channel_list:
            channel = self.bot.get_channel(expando_channel["chan_id"])
            if channel is None:
                todelete.append(expando_channel)
        self.expando_channel_list[:] = [r for r in self.expando_channel_list if r not in todelete]
        expando_channel_cache = open("cache/expandochannel.txt", "w")
        expando_channel_cache.write(json.dumps(self.expando_channel_list))
        expando_channel_cache.close()

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def expando(self, ctx):
        if ctx.author.voice is not None:
            vchan = ctx.author.voice.channel
            for ec in self.expando_channel_list:
                if ec["chan_id"] == vchan.id:
                    await ctx.send("That channel is already an expando channel!")
                    return
            expandochan = {}
            expandochan["chan_id"] = vchan.id
            expandochan["perm"] = True
            self.expando_channel_list.append(expandochan)
            await self.update_empty_channel(vchan)
        else:
            await ctx.send("Join the channel you wanna turn into a source expando channel!")

    async def update_empty_channel(self, starting_channel):
        chan_index = starting_channel.guild.voice_channels.index(starting_channel)
        last_pos = 0
        perm_is_empty = False
        for vc in starting_channel.guild.voice_channels[chan_index:]:
            expando_chan = None
            for ec in self.expando_channel_list:
                if ec["chan_id"] == vc.id:
                    expando_chan = ec
                    break
            if starting_channel == vc and expando_chan["perm"]:
                last_pos = vc.position
                if len(vc.members) == 0:
                    perm_is_empty = True
                continue
            if expando_chan is not None and not expando_chan["perm"]:
                if len(vc.members) == 0:
                    await vc.delete()
                    self.expando_channel_list.remove(ec)
                else:
                    last_pos = vc.position
            else:
                break
        if not perm_is_empty:
            new_chan = await starting_channel.guild.create_voice_channel(self.bot.config["default_channel_name"], category=starting_channel.category)
            try:
                await new_chan.edit(position=last_pos + 1)
            except discord.errors.InvalidArgument:
                pass
            expandochan = {}
            expandochan["chan_id"] = new_chan.id
            expandochan["perm"] = False
            self.expando_channel_list.append(expandochan)
        expando_channel_cache = open("cache/expandochannel.txt", "w")
        expando_channel_cache.write(json.dumps(self.expando_channel_list))
        expando_channel_cache.close()


    async def on_voice_state_update(self, member, before: discord.VoiceState, after: discord.VoiceState):
        #Go through the expando channels, saving the source channels for the before and after channels
        before_starting_point = None
        after_starting_point = None
        last_perm_id = 0
        for vc in member.guild.voice_channels:
            expando_channel = None
            for ec in self.expando_channel_list:
                if ec["chan_id"] == vc.id:
                    expando_channel = ec
                    break
            if expando_channel is not None:
                if expando_channel["perm"]:
                    last_perm_id = expando_channel["chan_id"]
                if before.channel is not None:
                    if expando_channel["chan_id"] == before.channel.id:
                        before_starting_point = member.guild.get_channel(last_perm_id)
                if after.channel is not None:
                    if expando_channel["chan_id"] == after.channel.id:
                        after_starting_point = member.guild.get_channel(last_perm_id)

        #If both starting points are the same, update the empty channel once, otherwise update according to the individual ones.
        if after_starting_point == before_starting_point:
            await self.update_empty_channel(before_starting_point)
        else:
            if after_starting_point is not None:
                await self.update_empty_channel(after_starting_point)
            if before_starting_point is not None:
                await self.update_empty_channel(before_starting_point)

def setup(bot : commands.Bot):
    print("setting up expandochannels")
    bot.add_cog(ExpandoChannels(bot))

