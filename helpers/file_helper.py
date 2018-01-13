import os
import glob
import requests
import discord

class NoNameSpecifiedError(Exception):
    """No File Name Specified"""

async def filelister(ctx, filedir : str):
    listoffiles = sorted(os.listdir(filedir))
    listresponse = ""
    if listoffiles != []:
        for f in listoffiles:
            listresponse += f.split(".")[0] + "\n"
    else:
        listresponse = "Can't find anything, add something!"
    await ctx.author.send(listresponse)

def file_getter(file_dir : str, file_name):
    """ 
    Returns the relative path of the specified file from source directory.
    Returns None if the file doesn't exist.
    file_name (str) : Name of the file.
    file_dir (str) : The directory that the file would be located in.
    """
    for f in os.listdir(file_dir):
        if f.split(".")[0] == file_name:
            return file_dir + "/" + f

async def fileadder(ctx, filedir : str):
    if len(ctx.message.attachments) == 0:
        fileerror = "Remember to attach a file"
        await ctx.send(fileerror)
    else:
        existing_file = glob.glob(filedir + "/" + ctx.args_split[0].lower() + ".*")
        if existing_file == []:
            fileattachment = ctx.message.attachments[0]
            print(fileattachment)
            if len(ctx.args_split) == 0:
                nameerror = "Please specify a name for the file"
                await ctx.send(nameerror)
            else:
                f = open(filedir + "/" + ctx.args_split[0].lower() + "." + fileattachment.url.split(".")[-1], "wb")
                f.write(requests.get(fileattachment.url).content)
                f.close()
                await ctx.send("Successfully added " + ctx.args_split[0].lower())
        else:
            await ctx.send("That image already exists, choose another name or delete it")
    await ctx.message.delete()

async def fileremover(ctx, filedir : str):
    if len(ctx.args_split) == 0:
        await ctx.send("Which file do I rm?")
    else:
        for f in os.listdir(filedir):
            if f.split(".")[0] == ctx.args_split[0]:
                os.remove(filedir + "/" + f)
                await ctx.send("Removed " + f.split(".")[0])
                break
