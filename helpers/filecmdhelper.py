import os
import glob
import requests
import discord

async def filelister(bot, dir : str):
    listoffiles = sorted(os.listdir(dir))
    listresponse = ""
    if listoffiles != []:
        for f in listoffiles:
            listresponse += f.split(".")[0] + "\n"
    else:
        listresponse = "Can't find anything, add something!"
    await bot.say(listresponse)

async def filegetter(bot, dir : str, ctx, handler):
    if len(ctx.args_split) > 0:
        for f in os.listdir(dir):
            if f.split(".")[0] == ctx.args_split[0].lower():
                await handler(ctx.message, dir + "/" + f)
                break

async def fileadder(bot, dir : str, ctx):
    if len(ctx.message.attachments) == 0:
        fileerror = "Remember to attach a file"
        await bot.say(fileerror)
    else:
        existing_file = glob.glob(dir + "/" + ctx.args_split[0].lower() + ".*")
        if existing_file == []:
            fileattachment = ctx.message.attachments[0]
            print(fileattachment)
            if len(ctx.args_split) == 0:
                nameerror = "Please specify a name for the file"
                await bot.say(nameerror)
            else:
                f = open(dir + "/" + ctx.args_split[0].lower() + "." + fileattachment["url"].split(".")[-1], "wb")
                f.write(requests.get(fileattachment["url"]).content)
                f.close()
                await bot.say("Successfully added " + ctx.args_split[0].lower())
        else:
            await bot.say("That image already exists, choose another name or delete it")
    await bot.delete_message(ctx.message)

async def fileremover(bot, dir : str, ctx):
    if len(ctx.args_split) == 0:
        await bot.say("Which file do I rm?")
    else:
        for f in os.listdir(dir):
            if f.split(".")[0] == ctx.args_split[0]:
                os.remove(dir + "/" + f)
                await bot.say("Removed " + f.split(".")[0])
                break