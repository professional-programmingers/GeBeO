import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as request from 'request';
import * as path from 'path';
const __rootDir = path.dirname(require.main.filename);

export enum FileType{
  Image,
  Sound,
}

let downloadFile = function (fileUrl: string, path: string) {
  request(fileUrl).pipe(fs.createWriteStream(path));
}

let sanitizeName = function (fileName: string) {
  return fileName.replace(/(\.|\/)/g, '');
}


export function initializeGuild (guildId: string): void {
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


export function getGuildDir (guildId: string, fileType?: FileType): string {
  let guildDir: string = `${__rootDir}/guilds/guild-${guildId}`;
  if (fileType != undefined) {
    if (fileType == FileType.Image) {
      guildDir += '/images/';
    }
    else if (fileType == FileType.Sound){
      guildDir += '/sounds/';
    }  
  } else {
    guildDir += '/';
  }
  return guildDir;
}


export function addFile ( attachment: Discord.MessageAttachment, guildId: string, fileName: string, fileType: FileType): void {
  /* Add a file under the correct guild directory*/
  initializeGuild(guildId);
  if (getFile(fileName, guildId, fileType)){
    throw 'File already exists!';
  }
  let guildDir: string = getGuildDir(guildId, fileType);
  let fileExt: string = attachment.filename.split('.').slice(-1)[0];

  downloadFile(attachment.url, `${guildDir}${sanitizeName(fileName)}.${fileExt}`);
}


export function listFile (guildId: string, fileType: FileType): string[]{
  /* Returns string[] of file names.*/
  let guildDir: string = getGuildDir(guildId, fileType);
  let files: string[] = fs.readdirSync(guildDir);
  for(let i = 0; i < files.length; i++){
    files[i] = files[i].split('.')[0];
  }
  return files.sort();
}

export function getFile (fileName: string, guildId: string, fileType: FileType): string {
  /* Returns the absolute path to the file (with extension). Returns null if nothing.
   * Can also be used to check if a file exists.
   * */
  let guildDir: string = getGuildDir(guildId, fileType);
  for(let file of fs.readdirSync(guildDir)){
    if(file.split('.')[0] == sanitizeName(fileName)){
      return guildDir + file;
    }
  }
  return null;
}

export function removeFile (fileName: string, guildId: string, fileType: FileType): void {
  /* */
  let file: string = getFile(fileName, guildId, fileType);
  if (file){
    fs.unlinkSync(file);
  }
  else {
    throw 'File doesn\'t exist.';
  }
}

export function getName (filePath: string): string {
  /* Return the name of the file given its path (including extension).*/
  return filePath.split('/').slice(-1)[0];
}
