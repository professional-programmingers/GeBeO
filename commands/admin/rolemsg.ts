import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fh from '../../helpers/file_helper';
import * as fs from 'fs';

class RoleMsg {
  constructor(msgId: string, channelId: string, roleId: string) {
    this.msgId = msgId;
    this.channelId = channelId;
    this.roleId = roleId;
  }

  msgId: string;
  channelId: string;
  roleId: string;
}

module.exports = class RoleMsgCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'rolemsg',
      group: 'admin',
      memberName: 'rolemsg',
      description: 'Create a rolemsg.',
      argsType: "single"
    });

    client.on('messageReactionAdd', this.roleAdd);
    client.on('messageReactionRemove', this.roleRemove);
    client.on('ready', () => {
      this.updateRoleMsgList(client);
    });
  }

  async run(msg: Commando.CommandMessage, arg: string): Promise<Discord.Message | Discord.Message[]> {
    if (arg.split(' ').length < 2) {
      return msg.reply('please consult the help for this command to see the format!');
    } else {
      let role: Discord.Role = null;
      msg.guild.roles.forEach((value: Discord.Role, key: string) => {
        if (value.name == arg.split(' ')[arg.split(' ').length - 1]) {
          role = value;
        }
      })

      if (role == null) {
        return msg.reply('Can\'t find that role!');
      }

      let msgContent: string = arg.substring(0, arg.length - arg.split(' ')[arg.split(' ').length - 1].length - 1);
      let sentMsg: Discord.Message = await msg.channel.send(msgContent) as Discord.Message;
      await sentMsg.react('✅');

      this.saveRoleMsg(new RoleMsg(sentMsg.id, sentMsg.channel.id, role.id), msg.guild.id);

      return msg.delete();
    }
  }

  saveRoleMsg(roleMsg: RoleMsg, guildId: string) {
    fh.initializeGuild(guildId);
    let roleFile: string = fh.getGuildDir(guildId) + 'rolemsg.json';
    let roleMsgs: RoleMsg[] = [];
    if (fs.existsSync(roleFile)) {
      roleMsgs = JSON.parse(fs.readFileSync(roleFile, 'utf8'));
    }
    roleMsgs.push(roleMsg);
    fs.writeFileSync(roleFile, JSON.stringify(roleMsgs));
  }
  
  async roleAdd(messageReaction: Discord.MessageReaction, user: Discord.User) {
    let roleFile: string = fh.getGuildDir(messageReaction.message.guild.id) + 'rolemsg.json';
    if (fs.existsSync(roleFile)) {
      let roleMsgs: RoleMsg[] = JSON.parse(fs.readFileSync(roleFile, 'utf8'));
      let roleMsg: RoleMsg;
      roleMsgs.forEach((value: RoleMsg) => {
        if (value.channelId == messageReaction.message.channel.id && value.msgId == messageReaction.message.id) {
          roleMsg = value;
        }
      });
      if (messageReaction.emoji.toString() == '✅') {
        let role: Discord.Role = messageReaction.message.guild.roles.get(roleMsg.roleId);
        let lastMember: Discord.GuildMember = messageReaction.message.guild.members.get(user.id);
        await lastMember.addRole(role);
      } else {
        await messageReaction.remove(user);
      }  
    }
  }
  
  async roleRemove(messageReaction: Discord.MessageReaction, user: Discord.User) {
    let roleFile: string = fh.getGuildDir(messageReaction.message.guild.id) + 'rolemsg.json';
    if (fs.existsSync(roleFile)) {
      let roleMsgs: RoleMsg[] = JSON.parse(fs.readFileSync(roleFile, 'utf8'));
      let roleMsg: RoleMsg;
      roleMsgs.forEach((value: RoleMsg) => {
        if (value.channelId == messageReaction.message.channel.id && value.msgId == messageReaction.message.id) {
          roleMsg = value;
        }
      });
      if (messageReaction.emoji.toString() == '✅') {
        let role: Discord.Role = messageReaction.message.guild.roles.get(roleMsg.roleId);
        let lastMember: Discord.GuildMember = messageReaction.message.guild.members.get(user.id);
        await lastMember.removeRole(role);
      }  
    }
  }
  
  async updateRoleMsgList(client: Commando.CommandoClient) {
    let guilds: Discord.Guild[] = Array.from(client.guilds.values());
    for (let i = 0; i < guilds.length; i++) {
      let guild: Discord.Guild = guilds[i];
      fh.initializeGuild(guild.id);
      let roleFile: string = fh.getGuildDir(guild.id) + 'rolemsg.json';  
      let roleMsgs: RoleMsg[] = [];
      if (fs.existsSync(roleFile)) {
        let toDelete: RoleMsg[] = [];
        roleMsgs = JSON.parse(fs.readFileSync(roleFile, 'utf8'));
        for (let i = 0; i < roleMsgs.length; i++) {
          let channel: Discord.TextChannel = client.channels.get(roleMsgs[i].channelId) as Discord.TextChannel;
          if (channel != undefined) {
            try {
              let message: Discord.Message = await channel.fetchMessage(roleMsgs[i].msgId);
              if (message != undefined) {
                return;
              }  
            } catch (error) {

            }
          }
          toDelete.push(roleMsgs[i]);
        }
        roleMsgs.forEach((roleMsg: RoleMsg) => {
        });
        toDelete.forEach((val: RoleMsg) => {
          roleMsgs.splice(roleMsgs.findIndex((el: RoleMsg) => {return el == val}), 1);
        });  
      }
      fs.writeFileSync(roleFile, JSON.stringify(roleMsgs));
    }
  }  
}
