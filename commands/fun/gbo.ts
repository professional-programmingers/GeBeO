import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as enpos from 'en-pos';

const PluralNoun = 'NNS';
const ProperPluralNoun = 'NNPS';
const Nouns = [PluralNoun, ProperPluralNoun];

const Adjective = 'JJ';
const GerundVerb = 'VBG'; // like running, jumping, etc
const Adjectives = [Adjective, GerundVerb];

module.exports = class GBOCommand extends Commando.Command {
  private gnoun: string[];
  private bnoun: string[];
  private sadj: string[];
  private gadj: string[];
  private initialized: boolean;
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'gbo',
      group: 'fun',
      memberName: 'gbo',
      description: 'The true source for what GBO-NSG stands for',
    });

    let words : string[];
    try {
      words = fs.readFileSync('/usr/share/dict/words', 'utf8').split('\n');
    } catch (err) {
      console.log('Error loading words from /usr/share/dict/words:');
      console.log(err);
      this.initialized = false;
      return;
    }

    let filterChar = (char: string) => {
      return (word: string) => {
        return word[0] == char.toLowerCase() || word[0] == char.toUpperCase();
      };
    };

    let filterPOS = (posPrefixes: string[]) => {
      return (word: string) => {
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

  async run(msg: Commando.CommandMessage, arg: any): Promise<Discord.Message | Discord.Message[]> {
    if (!this.initialized) {
      return Promise.reject("Word Dictionary not prepared");
    }
    
    let getWord = (arr: string[]) => {
      return arr[Math.floor(Math.random() * arr.length)].replace(/^\w/, c => c.toUpperCase());
    };
 
    return msg.channel.send(
      `${getWord(this.gadj)} ${getWord(this.bnoun)} Only - ` +
      `No ${getWord(this.sadj)} ${getWord(this.gnoun)}`
    );
  }
}
