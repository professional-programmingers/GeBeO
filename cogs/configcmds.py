from discord.ext import commands
import os
import json

class Config():
    def __init__(self, bot : commands.Bot):
        print("initializing config")
        self.bot = bot

    async def on_ready(self):
        self.load_config()

    def load_config(self):
        for g in self.bot.guilds:
            guildDirPath = "guilds/guild-" + str(g.id)
            # load config from file, if it exists
            if os.path.isfile(guildDirPath + "/" + "config.json") and os.stat(guildDirPath + "/" + "config.json").st_size != 0:
                self.bot.config[g.id] = json.loads(open(guildDirPath + "/" + "config.json", "r").read())
            else:
                #create empty config if it doesn't
                self.bot.config[g.id] = {}
                f = open(guildDirPath + "/" + "config.json", 'w+')
                f.close()
            # load default config from file
            default_config = json.loads(open("config.default.json", "r").read())
            for key, data in default_config.items():
                if key not in self.bot.config[g.id]:
                    self.bot.config[g.id][key] = data
            self.save_config(g.id)

    def save_config(self, guild_id):
        guildDirPath = "guilds/guild-" + str(guild_id)
        f = open(guildDirPath + "/" + "config.json", "w")
        f.write(json.dumps(self.bot.config[guild_id]))
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
            if ctx.args_split[1] == "null":
                self.bot.config[ctx.guild.id][ctx.args_split[0]] = None
            else:
                try:
                    self.bot.config[ctx.guild.id][ctx.args_split[0]] = int(ctx.args_split[1])
                except ValueError:
                    self.bot.config[ctx.guild.id][ctx.args_split[0]] = ctx.args_split[1]
            await ctx.send("Setting " + ctx.args_split[0] + " to " + ctx.args_split[1] + " and saving the config file!")
        else:
            await ctx.send("That's not enough data to configure anything, but I'll save the config file anyway!")
        self.save_config(ctx.guild.id)
        await ctx.message.delete()


    @commands.command()
    @commands.has_permissions(administrator=True)
    async def cfgdel(self, ctx):
        await ctx.trigger_typing()
        if len(ctx.args_split) >= 1:
            del self.bot.config[ctx.guild.id][ctx.args_split[0]]
            await ctx.send("Deleting " + ctx.args_split[0] + " and saving the config file!")
        else:
            await ctx.send("That's not enough data to configure anything, but I'll save the config file anyway!")
        self.save_config(ctx.guild.id)
        await ctx.message.delete()

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def cfgprint(self, ctx):
        await ctx.trigger_typing()
        await ctx.send("```" + json.dumps(self.bot.config[ctx.guild.id]) + "```")
        await ctx.message.delete()


def setup(bot):
    print("setting up config")
    bot.add_cog(Config(bot))
