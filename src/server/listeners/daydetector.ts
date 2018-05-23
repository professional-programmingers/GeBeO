import * as Discord from 'discord.js';
import * as Commando from 'discord.js-commando';

function getPSTTime(): Date {
    let offset: number = -7;

    let d: Date = new Date();
    let utc: number = d.getTime() + (d.getTimezoneOffset() * 60000);
    let nd: Date = new Date(utc + (3600000 * offset));
    return nd;
}

var lastWeekday: number = getPSTTime().getDay();

async function dayDetector(client: Commando.CommandoClient) {
    let currentTime: Date = getPSTTime();

    await yearPercentage(currentTime, client);

    let currentWeekday = currentTime.getDay();
    if (currentWeekday != lastWeekday) {
        lastWeekday = currentWeekday;

        await wednesdayDetector(currentTime, client);
    }
}

async function wednesdayDetector(currTime: Date, client: Commando.CommandoClient) {
    if (currTime.getDay() == 3) {
        let myDudes = '<:MyDudes:304341572168712193> ';
        let msg = myDudes.repeat(3) + 'It is Wednesday my dudes ' + myDudes.repeat(3);
        client.guilds.forEach((value: Discord.Guild, key: string) => {
            let channelId: string = client.provider.get(value, 'wed_detector_channel', null);
            if (channelId == null) return;
            let channel: Discord.GuildChannel = value.channels.get(channelId)
            if (channel.type == 'text') {
                (channel as Discord.TextChannel).send(msg);
            }
        })
    }
}

async function yearPercentage(currentTime: Date, client: Commando.CommandoClient) {
    let yearDateRangeMS: number = new Date(currentTime.getFullYear() + 1, 0).getTime() - new Date(currentTime.getFullYear(), 0).getTime()
    let todayDateRangeMS: number = currentTime.getTime() - new Date(currentTime.getFullYear(), 0).getTime();
    let percentComplete = todayDateRangeMS / yearDateRangeMS * 100;
    await client.user.setPresence({game: {name: percentComplete.toFixed(3) + '% thru ' + currentTime.getFullYear() + '!'}})
}

module.exports = function(client: Commando.CommandoClient) {
    lastWeekday = getPSTTime().getDay();
    client.on('ready', () =>  {
        dayDetector(client);
        setInterval(dayDetector, 60000, client)
    });
}