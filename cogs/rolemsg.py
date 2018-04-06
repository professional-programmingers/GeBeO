import discord
from discord.ext import commands
import json
import os
import asyncio

class RoleMsg():
    def __init__(self, bot : commands.Bot):
        print("initializing rolemsg")
        self.bot = bot
        self.role_msg_list = {}

    async def on_ready(self):
        for g in self.bot.guilds:
            guildDirPath = "guilds/guild-" + str(g.id)
            if not os.path.exists(guildDirPath + "/" + "cache"):
                os.makedirs(guildDirPath + "/" + "cache")
            if os.path.isfile(guildDirPath + "/" + "cache/rolemsg.json") and os.stat(guildDirPath + "/" + "cache/rolemsg.json").st_size != 0:
                self.role_msg_list[g.id] = json.loads(open(guildDirPath + "/" + "cache/rolemsg.json", "r").read())
            else:
                self.role_msg_list[g.id] = []
                f = open(guildDirPath + "/" + "cache/rolemsg.json", 'w+')
                f.close()
            await self.update_role_msg_list(g.id)

    cache_counter = 0
    role_msg_list = None

    async def update_role_msg_list(self, guild_id):
        todelete = []
        guildDirPath = "guilds/guild-" + str(guild_id)
        for rolemsg in self.role_msg_list[guild_id]:
            rolemsg_channel = self.bot.get_channel(rolemsg["msg_chan_id"])
            try:
                await rolemsg_channel.get_message(rolemsg["msg_id"])
            except discord.NotFound:
                todelete.append(rolemsg)
        self.role_msg_list[guild_id][:] = [r for r in self.role_msg_list[guild_id] if r not in todelete]
        role_msg_cache = open(guildDirPath + "/" + "cache/rolemsg.json", "w")
        role_msg_cache.write(json.dumps(self.role_msg_list[guild_id]))
        role_msg_cache.close()

    async def on_raw_reaction_add(self, emoji, message_id, channel_id, user_id):
        guild = self.bot.get_channel(channel_id).guild
        for rmsg in self.role_msg_list[guild.id]:
            if message_id == rmsg["msg_id"]:
                channel = self.bot.get_channel(channel_id)
                message = channel.get_message(message_id)
                member = guild.get_member(user_id)
                if emoji.name == "✅":
                    for r in guild.roles:
                        if r.name == rmsg["role_name"]:
                            await member.add_roles(r)
                            return
                else:
                    await message.remove_reaction("✅", member)

    async def on_raw_reaction_remove(self, emoji, message_id, channel_id, user_id):
        guild = self.bot.get_channel(channel_id).guild
        for rmsg in self.role_msg_list[guild.id]:
            if message_id == rmsg["msg_id"]:
                channel = self.bot.get_channel(channel_id)
                for r in guild.roles:
                    if r.name == rmsg["role_name"]:
                        member = guild.get_member(user_id)
                        await member.remove_roles(r)
                        return

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def rolemsg(self, ctx):
        await ctx.trigger_typing()
        print("checkpoint1")
        if len(ctx.args_split) < 2:
            await ctx.send("Wrong")
        else:
            role = None
            print(ctx.args_split[-1])
            for r in ctx.message.guild.roles:
                if r.name == ctx.args_split[-1]:
                    role = r
            if role is None:
                await ctx.send("Can't find that role")
                return
            sent_msg = await ctx.send(" ".join(ctx.args_split[0:-1]))
            await sent_msg.add_reaction("✅")
            guildDirPath = "guilds/guild-" + str(ctx.guild.id)
            role_msg = {}
            role_msg["msg_id"] = sent_msg.id
            role_msg["msg_chan_id"] = sent_msg.channel.id
            role_msg["role_name"] = ctx.args_split[-1]
            self.role_msg_list[ctx.guild.id].append(role_msg)
            role_msg_cache = open(guildDirPath + "/" + "cache/rolemsg.json", "w")
            role_msg_cache.write(json.dumps(self.role_msg_list[ctx.guild.id]))
            role_msg_cache.close()
        await ctx.message.delete()

def setup(bot):
    print("setting up rolemsg")
    bot.add_cog(RoleMsg(bot))
