import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
const fs = require('fs');
const request = require('request');
const path = require('path');
const __rootDir = path.dirname(require.main.filename);

export enum FileType{
  Image,
  Sound,
}

let downloadFile = function (fileUrl: string, path: string) : Promise<any> {
  return request(fileUrl).pipe(fs.createWriteStream(path));
}

let sanitizeName = function (fileName: string) {
  return fileName.replace(/(\.|\/)/g, '');
}


let initializeGuild = function (guildId: string): void {
  /* Check if a guild exists, initialize it if it doesn't.*/
  if (!fs.existsSync(__rootDir + '/guilds/')) {
    fs.mkdirSync(__rootDir + '/guilds/');
  }

  let guildDir: string = `${__rootDir}/guilds/guild-${guildId}`;
  if (!fs.existsSync(guildDir)) {
    fs.mkdirSync(guildDir);
    fs.mkdirSync(guildDir + '/images');
    fs.mkdirSync(guildDir + '/sounds');
  }
}


let getGuildDir = function (guildId: string, fileType: FileType): string {
  let guildDir: string = `${__rootDir}/guilds/guild-${guildId}`;
  if (fileType == FileType.Image) {
    guildDir += '/images/';
  }
  else if (fileType == FileType.Sound){
    guildDir += '/sounds/';
  }
  else {
    throw 'Invalid file type.';
  }
  return guildDir;
}



let fileExists = function (fileName: string, guildId: string, fileType: FileType): boolean {
  /* Check if a file exist. Returns bool.*/
  let guildDir: string = getGuildDir(guildId, fileType);
  return fs.existsSync(guildDir + sanitizeName(fileName));
}


exports.addFile = 
function ( attachment: Discord.MessageAttachment, guildId: string, fileName: string, fileType: FileType): void {
  /* Add a file under the correct guild directory*/
  initializeGuild(guildId);
  if (fileExists(fileName, guildId, fileType)){
    throw 'File already exists!';
  }
  let guildDir: string = getGuildDir(guildId, fileType);

  downloadFile(attachment.url, guildDir + sanitizeName(fileName));
}


exports.listFile =
function (guildId: string, fileType: FileType): string[]{
  /* Returns string[] of file names.*/
  let guildDir: string = getGuildDir(guildId, fileType);
  let files: string[] = fs.readdirSync(guildDir);
  return files.sort();
}

exports.getFile = 
function (fileName: string, guildId: string, fileType: FileType): string {
  /* Returns the absolute path to the file. */
  if (fileExists(fileName, guildId, fileType)){
    return getGuildDir(guildId, fileType) + sanitizeName(fileName);
  }
  else {
    throw 'File doesn\'t exist.';
  }
}

exports.removeFile = 
function (fileName: string, guildId: string, fileType: FileType): void {
  /* */
  if (fileExists(fileName, guildId, fileType)){
    fs.unlinkSync(getGuildDir(guildId, fileType) + sanitizeName(fileName));
  }
  else {
    throw 'File doesn\'t exist.';
  }
}
