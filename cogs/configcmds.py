from discord.ext import commands
import os
import json

class Config():
    def __init__(self, bot : commands.Bot):
        print("initializing config")
        self.bot = bot
        self.load_config()


    def load_config(self):
        # load config from file, if it exists
        if os.path.isfile("config.json") and os.stat("config.json").st_size != 0:
            self.bot.config = json.loads(open("config.json", "r").read())
        else:
            #create empty config if it doesn't
            self.bot.config = {}
            f = open("config.json", 'w+')
            f.close()
        # load default config from file
        default_config = json.loads(open("config.default.json", "r").read())
        for key, data in default_config.items():
            if key not in self.bot.config:
                self.bot.config[key] = data
        self.save_config()

    def save_config(self):
        f = open("config.json", "w")
        f.write(json.dumps(self.bot.config))
        f.close()


    @commands.command()
    @commands.has_permissions(administrator=True)
    async def cfgrl(self, ctx):
        await ctx.trigger_typing()
        self.load_config()
        await ctx.send("Reloaded config file!")
        await ctx.message.delete()


    @commands.command()
    @commands.has_permissions(administrator=True)
    async def cfgset(self, ctx):
        await ctx.trigger_typing()
        if len(ctx.args_split) >= 2:
            self.bot.config[ctx.args_split[0]] = ctx.args_split[1]
            await ctx.send("Setting " + ctx.args_split[0] + " to " + ctx.args_split[1] + " and saving the config file!")
        else:
            await ctx.send("That's not enough data to configure anything, but I'll save the config file anyway!")
        self.save_config()
        await ctx.message.delete()


    @commands.command()
    @commands.has_permissions(administrator=True)
    async def cfgdel(self, ctx):
        await ctx.trigger_typing()
        if len(ctx.args_split) >= 1:
            del self.bot.config[ctx.args_split[0]]
            await ctx.send("Deleting " + ctx.args_split[0] + " and saving the config file!")
        else:
            await ctx.send("That's not enough data to configure anything, but I'll save the config file anyway!")
        self.save_config()
        await ctx.message.delete()

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def cfgprint(self, ctx):
        await ctx.trigger_typing()
        await ctx.send("```" + json.dumps(self.bot.config) + "```")
        await ctx.message.delete()


def setup(bot):
    print("setting up config")
    bot.add_cog(Config(bot))