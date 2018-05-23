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
const fs = require("fs");
const enpos = require("en-pos");
const PluralNoun = 'NNS';
const ProperPluralNoun = 'NNPS';
const Nouns = [PluralNoun, ProperPluralNoun];
const Adjective = 'JJ';
const GerundVerb = 'VBG';
const Adjectives = [Adjective, GerundVerb];
module.exports = class GBOCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'gbo',
            group: 'fun',
            memberName: 'gbo',
            description: 'The true source for what GBO-NSG stands for',
        });
        let words;
        try {
            words = fs.readFileSync('/usr/share/dict/words', 'utf8').split('\n');
        }
        catch (err) {
            console.log('Error loading words from /usr/share/dict/words:');
            console.log(err);
            this.initialized = false;
            return;
        }
        let filterChar = (char) => {
            return (word) => {
                return word[0] == char.toLowerCase() || word[0] == char.toUpperCase();
            };
        };
        let filterPOS = (posPrefixes) => {
            return (word) => {
                let tag = new enpos.Tag([word])
                    .initial()
                    .tags[0];
                return posPrefixes.indexOf(tag) != -1;
            };
        };
        this.gnoun = words
            .filter(filterChar('g'))
            .filter(filterPOS(Nouns));
        this.bnoun = words
            .filter(filterChar('b'))
            .filter(filterPOS(Nouns));
        this.gadj = words
            .filter(filterChar('g'))
            .filter(filterPOS(Adjectives));
        this.sadj = words
            .filter(filterChar('s'))
            .filter(filterPOS(Adjectives));
        this.initialized = true;
    }
    run(msg, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.initialized) {
                return Promise.reject("Word Dictionary not prepared");
            }
            let getWord = (arr) => {
                return arr[Math.floor(Math.random() * arr.length)].replace(/^\w/, c => c.toUpperCase());
            };
            return msg.channel.send(`${getWord(this.gadj)} ${getWord(this.bnoun)} Only - ` +
                `No ${getWord(this.sadj)} ${getWord(this.gnoun)}`);
        });
    }
};
//# sourceMappingURL=gbo.js.map