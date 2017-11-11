from discord.ext import commands
import asyncio
import requests
import json
import os


class Github():
    def __init__(self, bot : commands.Bot):
        print("initializing github tracker")
        self.bot = bot
        # Registered channel format:
        # {channel_id : ("repo", "owner/repo")}
        # {"167319706863140864" : ("repo", "professional-programmingers/GeBeO")}
        self.registered_channels = {}
        self.file_name = "cache/github.json"
        self.api_base = "https://api.github.com/"

        # Create a cache dir if it doesn't exists.
        if not os.path.exists("cache"):
            os.makedirs("cache")

        # Check for cache file.
        if os.path.isfile(self.file_name) and os.stat(self.file_name).st_size != 0:
            f = open(self.file_name, "r")
            self.registered_channels = json.loads(f.read())
        else:
            f = open(self.file_name, "w+")
        f.close()

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def gitreg(self, ctx):
        """ 
        Registers a channel to listen to.
        USAGE: !gitreg owner/repo
            In the future maybe different types of registration.
        """
        if len(ctx.args_split) < 1:
            await ctx.send("Invalid number of arguments")
            return

        if ctx.message.channel.id in self.registered_channels:
            await ctx.send("This channel is already registered!")
        else:
            # Register channel.
            self.registered_channels[ctx.message.channel.id] = ctx.args_split[0].strip('/')
            f = open(self.file_name, "w+")
            f.write(json.dumps(self.registered_channels))
            f.close()
            await ctx.send("Successfully registered!")


    @commands.command()
    @commands.has_permissions(administrator=True)
    async def gitrm(self, ctx):
        """ 
        Remove the channel from the registered channel list.
        USAGE: !gitrm
        """
        if ctx.message.channel.id in self.registered_channels:
            del self.registered_channels[ctx.message.channel.id]
            f = open(self.file_name, "w+")
            f.write(json.dumps(self.registered_channels))
            f.close()
            await ctx.send("Channel removed!")
        else:
            await ctx.send("This channel is not registered!")


    async def on_message(self, message):
        """ 
        For each messages, check for issue numbers denoted as #number.
        Then print out the associated url for each issues to the channel.
        """

        if message.channel.id in self.registered_channels:
            # Get info on the current channel.
            channel_info = self.registered_channels[message.channel.id]
            issues_list = self.parse_issues(message)
            url_list = []  # URL list of issues to be printed to channel.

            if not issues_list:
                return

            api_url = self.api_base + "repos/" + channel_info + "/issues"
            payload = {"state" : "all", "sort" : "created"}
            request_json = json.loads(requests.get(api_url, params=payload).text)
            largest_issue = request_json[0]["number"]
            for issue in issues_list:
                if issue > largest_issue:
                    continue
                for issue_json in request_json:
                    if issue == issue_json["number"]:
                        url_list.append(issue_json["html_url"])
                        break
            # Concantenate the urls together to print them out.
            if url_list:
                url_string = ""
                for url in url_list:
                    url_string += url + "\n"
                _internal_channel = message.channel  # Holy shit discordpy
                await message.channel.send(url_string)


    def parse_issues(self, message):
        """ Parse a message and create an integer list of issues """
        message_split = message.content.split(" ")
        issues_list = []
        for word in message_split:
            if len(word) == 0:
                continue
            if word[0] == '#':
                try:
                    # Make sure things behind # is a legit issue
                    issue_number = int(word[1:])
                except ValueError:
                    continue
                if issue_number < 0 or issue_number in issues_list:
                    continue
                issues_list.append(issue_number)
        issues_list.sort()
        return issues_list
        
    
def setup(bot):
    print("setting up github tracker")
    bot.add_cog(Github(bot))
