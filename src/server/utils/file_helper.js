"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const request = require("request");
const path = require("path");
const __rootDir = path.dirname(require.main.filename);
var FileType;
(function (FileType) {
    FileType[FileType["Image"] = 0] = "Image";
    FileType[FileType["Sound"] = 1] = "Sound";
})(FileType = exports.FileType || (exports.FileType = {}));
let downloadFile = function (fileUrl, path) {
    request(fileUrl).pipe(fs.createWriteStream(path));
};
let sanitizeName = function (fileName) {
    return fileName.replace(/(\.|\/)/g, '');
};
function initializeGuild(guildId) {
    if (!fs.existsSync(__rootDir + '/guilds/')) {
        fs.mkdirSync(__rootDir + '/guilds/');
    }
    let guildDir = `${__rootDir}/guilds/guild-${guildId}`;
    if (!fs.existsSync(guildDir)) {
        fs.mkdirSync(guildDir);
        fs.mkdirSync(guildDir + '/images');
        fs.mkdirSync(guildDir + '/sounds');
    }
}
exports.initializeGuild = initializeGuild;
function getGuildDir(guildId, fileType) {
    let guildDir = `${__rootDir}/guilds/guild-${guildId}`;
    if (fileType != undefined) {
        if (fileType == FileType.Image) {
            guildDir += '/images/';
        }
        else if (fileType == FileType.Sound) {
            guildDir += '/sounds/';
        }
    }
    else {
        guildDir += '/';
    }
    return guildDir;
}
exports.getGuildDir = getGuildDir;
function addFile(attachment, guildId, fileName, fileType) {
    initializeGuild(guildId);
    if (getFile(fileName, guildId, fileType)) {
        throw 'File already exists!';
    }
    let guildDir = getGuildDir(guildId, fileType);
    let fileExt = attachment.filename.split('.').slice(-1)[0];
    downloadFile(attachment.url, `${guildDir}${sanitizeName(fileName)}.${fileExt}`);
}
exports.addFile = addFile;
function listFile(guildId, fileType) {
    let guildDir = getGuildDir(guildId, fileType);
    let files = fs.readdirSync(guildDir);
    for (let i = 0; i < files.length; i++) {
        files[i] = files[i].split('.')[0];
    }
    return files.sort();
}
exports.listFile = listFile;
function getFile(fileName, guildId, fileType) {
    let guildDir = getGuildDir(guildId, fileType);
    for (let file of fs.readdirSync(guildDir)) {
        if (file.split('.')[0] == sanitizeName(fileName)) {
            return guildDir + file;
        }
    }
    return null;
}
exports.getFile = getFile;
function removeFile(fileName, guildId, fileType) {
    let file = getFile(fileName, guildId, fileType);
    if (file) {
        fs.unlinkSync(file);
    }
    else {
        throw 'File doesn\'t exist.';
    }
}
exports.removeFile = removeFile;
function getName(filePath) {
    return filePath.split('/').slice(-1)[0];
}
exports.getName = getName;
//# sourceMappingURL=file_helper.js.map