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
function getPSTTime() {
    let offset = -7;
    let d = new Date();
    let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    let nd = new Date(utc + (3600000 * offset));
    return nd;
}
var lastWeekday = getPSTTime().getDay();
function dayDetector(client) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentTime = getPSTTime();
        yield yearPercentage(currentTime, client);
        let currentWeekday = currentTime.getDay();
        if (currentWeekday != lastWeekday) {
            lastWeekday = currentWeekday;
            yield wednesdayDetector(currentTime, client);
        }
    });
}
function wednesdayDetector(currTime, client) {
    return __awaiter(this, void 0, void 0, function* () {
        if (currTime.getDay() == 3) {
            let myDudes = '<:MyDudes:304341572168712193> ';
            let msg = myDudes.repeat(3) + 'It is Wednesday my dudes ' + myDudes.repeat(3);
            client.guilds.forEach((value, key) => {
                let channelId = client.provider.get(value, 'wed_detector_channel', null);
                if (channelId == null)
                    return;
                let channel = value.channels.get(channelId);
                if (channel.type == 'text') {
                    channel.send(msg);
                }
            });
        }
    });
}
function yearPercentage(currentTime, client) {
    return __awaiter(this, void 0, void 0, function* () {
        let yearDateRangeMS = new Date(currentTime.getFullYear() + 1, 0).getTime() - new Date(currentTime.getFullYear(), 0).getTime();
        let todayDateRangeMS = currentTime.getTime() - new Date(currentTime.getFullYear(), 0).getTime();
        let percentComplete = todayDateRangeMS / yearDateRangeMS * 100;
        yield client.user.setPresence({ game: { name: percentComplete.toFixed(3) + '% thru ' + currentTime.getFullYear() + '!' } });
    });
}
module.exports = function (client) {
    lastWeekday = getPSTTime().getDay();
    client.on('ready', () => {
        dayDetector(client);
        setInterval(dayDetector, 60000, client);
    });
};
//# sourceMappingURL=daydetector.js.map