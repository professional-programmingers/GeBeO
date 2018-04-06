from helpers.helper_bot import *
from discord.ext import commands
import os

class GeBeOContext(commands.Context):
    args_split = None
    arg = None


class BotGeBeO(commands.Bot):

    config = {}

    async def on_message(self, message):
        ctx = await self.get_context(message, cls=GeBeOContext)
        print(ctx.message.author.display_name + ": " + ctx.message.content)
        ctx.args_split = ctx.message.content.split(' ')[1:]
        ctx.arg = ' '.join(ctx.args_split)
        await self.invoke(ctx)


    async def on_command_error(self, ctx, error):
        if isinstance(error, commands.errors.CommandInvokeError):
            print(error.original)
        elif isinstance(error, commands.errors.MissingPermissions):
            await ctx.message.delete()
            await ctx.send("Sorry, you must be admin to use that command!")


    async def on_ready(self):
        print('Logged in as')
        print(self.user.name)
        print(self.user.id)
        print('------')
        for g in self.guilds:
            guildDirPath = "guilds/guild-" + str(g.id)
            if not os.path.exists(guildDirPath):
                os.makedirs(guildDirPath + "/sounds")
                os.makedirs(guildDirPath + "/images")

        self.helperList = []
        f = open("tokens/helpers.cfg")
        helper_tokens = f.readlines()
        helper_tokens = [x.strip() for x in helper_tokens]
        for token in helper_tokens:
            new_helper = HelperBot(commands_prefix="&&&")
            self.loop.create_task(new_helper.start(token))
            self.helperList.append(new_helper)
