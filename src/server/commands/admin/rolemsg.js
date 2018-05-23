"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Commando = require("discord.js-commando");
const fh = require("utils/file_helper");
const fs = require("fs");
class RoleMsg {
    constructor(msgId, channelId, roleId) {
        this.msgId = msgId;
        this.channelId = channelId;
        this.roleId = roleId;
    }
}
module.exports = class RoleMsgCommand extends Commando.Command {
    constructor(client) {
        let commandInfo = {
            name: 'rolemsg',
            group: 'admin',
            memberName: 'rolemsg',
            description: 'Create a rolemsg.',
            userPermissions: ['ADMINISTRATOR'],
            argsType: 'single',
        };
        super(client, commandInfo);
        client.on('messageReactionAdd', this.roleAdd);
        client.on('messageReactionRemove', this.roleRemove);
        client.on('ready', () => {
            this.updateRoleMsgList(client);
        });
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (arg.split(' ').length < 2) {
                return msg.reply('please consult the help for this command to see the format!');
            }
            else {
                let role = null;
                msg.guild.roles.forEach((value, key) => {
                    if (value.name == arg.split(' ')[arg.split(' ').length - 1]) {
                        role = value;
                    }
                });
                if (role == null) {
                    return msg.reply('Can\'t find that role!');
                }
                let msgContent = arg.substring(0, arg.length - arg.split(' ')[arg.split(' ').length - 1].length - 1);
                let sentMsg = yield msg.channel.send(msgContent);
                yield sentMsg.react('✅');
                this.saveRoleMsg(new RoleMsg(sentMsg.id, sentMsg.channel.id, role.id), msg.guild.id);
                return msg.delete();
            }
        });
    }
    saveRoleMsg(roleMsg, guildId) {
        fh.initializeGuild(guildId);
        let roleFile = fh.getGuildDir(guildId) + 'rolemsg.json';
        let roleMsgs = [];
        if (fs.existsSync(roleFile)) {
            roleMsgs = JSON.parse(fs.readFileSync(roleFile, 'utf8'));
        }
        roleMsgs.push(roleMsg);
        fs.writeFileSync(roleFile, JSON.stringify(roleMsgs));
    }
    roleAdd(messageReaction, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let roleFile = fh.getGuildDir(messageReaction.message.guild.id) + 'rolemsg.json';
            if (fs.existsSync(roleFile)) {
                let roleMsgs = JSON.parse(fs.readFileSync(roleFile, 'utf8'));
                let roleMsg = null;
                roleMsgs.forEach((value) => {
                    if (value.channelId == messageReaction.message.channel.id && value.msgId == messageReaction.message.id) {
                        roleMsg = value;
                    }
                });
                if (roleMsg != null) {
                    if (messageReaction.emoji.toString() == '✅') {
                        let role = messageReaction.message.guild.roles.get(roleMsg.roleId);
                        let lastMember = messageReaction.message.guild.members.get(user.id);
                        yield lastMember.addRole(role);
                    }
                    else {
                        yield messageReaction.remove(user);
                    }
                }
            }
        });
    }
    roleRemove(messageReaction, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let roleFile = fh.getGuildDir(messageReaction.message.guild.id) + 'rolemsg.json';
            if (fs.existsSync(roleFile)) {
                let roleMsgs = JSON.parse(fs.readFileSync(roleFile, 'utf8'));
                let roleMsg;
                roleMsgs.forEach((value) => {
                    if (value.channelId == messageReaction.message.channel.id && value.msgId == messageReaction.message.id) {
                        roleMsg = value;
                    }
                });
                if (messageReaction.emoji.toString() == '✅') {
                    let role = messageReaction.message.guild.roles.get(roleMsg.roleId);
                    let lastMember = messageReaction.message.guild.members.get(user.id);
                    yield lastMember.removeRole(role);
                }
            }
        });
    }
    updateRoleMsgList(client) {
        return __awaiter(this, void 0, void 0, function* () {
            let guilds = Array.from(client.guilds.values());
            for (let i = 0; i < guilds.length; i++) {
                let guild = guilds[i];
                fh.initializeGuild(guild.id);
                let roleFile = fh.getGuildDir(guild.id) + 'rolemsg.json';
                let roleMsgs = [];
                if (fs.existsSync(roleFile)) {
                    let toDelete = [];
                    roleMsgs = JSON.parse(fs.readFileSync(roleFile, 'utf8'));
                    for (let i = 0; i < roleMsgs.length; i++) {
                        let channel = client.channels.get(roleMsgs[i].channelId);
                        if (channel != undefined) {
                            try {
                                let message = yield channel.fetchMessage(roleMsgs[i].msgId);
                                if (message != undefined) {
                                    return;
                                }
                            }
                            catch (error) {
                            }
                        }
                        toDelete.push(roleMsgs[i]);
                    }
                    roleMsgs.forEach((roleMsg) => {
                    });
                    toDelete.forEach((val) => {
                        roleMsgs.splice(roleMsgs.findIndex((el) => { return el == val; }), 1);
                    });
                }
                fs.writeFileSync(roleFile, JSON.stringify(roleMsgs));
            }
        });
    }
};
//# sourceMappingURL=rolemsg.js.map