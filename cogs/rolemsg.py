import discord
from discord.ext import commands
import json
import os

class RoleMsg():
    def __init__(self, bot : commands.Bot):
        print("initializing rolemsg")
        self.bot = bot

        if not os.path.exists("cache"):
            os.makedirs("cache")
        if os.path.isfile("cache/rolemsg.txt") and os.stat("cache/rolemsg.txt").st_size != 0:
            self.role_msg_list = json.loads(open("cache/rolemsg.txt", "r").read())
        else:
            self.role_msg_list = []
            open("cache/rolemsg.txt", 'w+')

    cache_counter = 0
    role_msg_list = None
    
    async def update_role_msg_list(self):
        todelete = []
        for rolemsg in self.role_msg_list:
            rolemsg_channel = self.bot.get_channel(rolemsg["msg_chan_id"])
            try:
                rolemsg_message = await self.bot.get_message(rolemsg_channel, rolemsg["msg_id"])
                self.bot.messages.append(rolemsg_message)
            except discord.NotFound:
                todelete.append(rolemsg)
        self.role_msg_list[:] = [r for r in self.role_msg_list if r not in todelete]
        role_msg_cache = open("cache/rolemsg.txt", "w")
        role_msg_cache.write(json.dumps(self.role_msg_list))

    async def on_reaction_add(self, reaction, user):
        print("reaction detected")
        for rmsg in self.role_msg_list:
            if reaction.message.id == rmsg["msg_id"]:
                if reaction.emoji == "✅":
                    for r in reaction.message.server.roles:
                        if r.name == rmsg["role_name"]:
                            await self.bot.add_roles(user, r)
                            return
                else:
                    await self.bot.remove_reaction(reaction.message, reaction.emoji, user)

    async def on_reaction_remove(self, reaction, user):
        for rmsg in self.role_msg_list:
            if reaction.message.id == rmsg["msg_id"]:
                for r in reaction.message.server.roles:
                    if r.name == rmsg["role_name"]:
                        await self.bot.remove_roles(user, r)
                        return

    async def on_message(self, message):
        self.cache_counter += 1
        if self.cache_counter > 4500:
            self.cache_counter = 0
            await self.update_role_msg_list()

    async def on_ready(self):
        await self.update_role_msg_list()

    @commands.command(pass_context=True)
    async def rolemsg(self, ctx : commands.Context):
        args_split = ctx.message.content.split(' ')[1:]
        await self.bot.delete_message(ctx.message)
        if len(args_split) < 2:
            await self.bot.say("Wrong")
        else:
            role = None
            print(args_split[-1])
            for r in ctx.message.server.roles:
                if r.name == args_split[-1]:
                    role = r
            if role is None:
                await self.bot.say("Can't find that role")
                return
            sent_msg = await self.bot.say(" ".join(args_split[0:-1]))
            await self.bot.add_reaction(sent_msg, "✅")
            role_msg = {}
            role_msg["msg_id"] = sent_msg.id
            role_msg["msg_chan_id"] = sent_msg.channel.id
            role_msg["role_name"] = args_split[-1]
            self.role_msg_list.append(role_msg)
            role_msg_cache = open("cache/rolemsg.txt", "w")
            role_msg_cache.write(json.dumps(self.role_msg_list))

def setup(bot):
    print("setting up rolemsg")
    bot.add_cog(RoleMsg(bot))