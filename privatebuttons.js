const Discord = require('discord.js');

const COLOURS = {
  red: 0xff0000,
  green: 0x00ff00,
  blue: 0x0000ff,
  white: 0xffffff
}

const options = {
      owner: false,
      keep: false,
      slowmode: 0
}

const buttons = [
  { emoji: '➕',
    run: (user, message) => {

      var regex = /(?!\(Currently\s)\d(?=\/\d)/g;
      const receivedEmbed = message.embeds[0];
      var numberQueueing = receivedEmbed.title.match(regex);
      numberQueueing++;
      const newEmbed = new Discord.RichEmbed(receivedEmbed).setTitle(`Looking for additional players for private queue. (Currently ${numberQueueing}/4)`);

      message.edit({ embed: newEmbed })

    }
  },
  { emoji: '➖',
    run: (user, message) => {

      var regex = /(?!\(Currently\s)\d(?=\/\d)/g;
      const receivedEmbed = message.embeds[0];
      var numberQueueing = receivedEmbed.title.match(regex);
      numberQueueing--;
      const newEmbed = new Discord.RichEmbed(receivedEmbed).setTitle(`Looking for additional players for private queue. (Currently ${numberQueueing}/4)`);

      message.edit({ embed: newEmbed })

    }
  },
  { emoji: '🀄',
    run: (user, message) => {
      let newEmbed = { title: `private Queue popped.`, color : COLOURS.green, footer: {text: 'This message will self-destruct in 30 seconds.'} };
      message.edit({ embed: newEmbed });
      message.clearReactions();
      message.delete(30000);
    }
  },
  { emoji: '❌',
    run: (user, message) => {
      let newEmbed = { title: `private Queue Search cancelled by ${user.username}`, color : COLOURS.red, footer: {text: 'This message will self-destruct in 10 seconds.'} };
      message.edit({ embed: newEmbed });
      message.clearReactions();
      message.delete(10000);
    }
  }
]

const embed = {
      color: 0x0099ff,
      title: `Looking for additional players for private queue. (Currently 1/4)`,
      //url: 'https://discord.js.org',
      author: {
        name: ``,
        //icon_url: 'https://i.imgur.com/wSTFkRM.png',
        //url: 'https://discord.js.org',
      },
      description: `A user is looking for additional players to join them for private Mahjong (unranked)`,
      thumbnail: {
        url: `https://i.imgur.com/GENtNuB.png`,
      },
      fields: [
        {
          name: 'Please consider filling for them',
          value: '<@here>',
        },
        {
          name: '\u200b',
          value: '\u200b',
        },
        {
          name: 'What to do next?',
          value: 'React with ➕/➖ to change the queue count (eg. if you also start queueing), 🀄 when it pops or ❌ to cancel.',
        },
      ],
      //image: {
      //  url: 'https://i.imgur.com/wSTFkRM.png',
      //},
      timestamp: new Date(Date.now() + 30*60000),
      footer: {
        text: 'If not marked as popped or cancelled, this message will timeout: ',
        //icon_url: 'https://i.imgur.com/wSTFkRM.png',
      },
    };

module.exports = {
  buttons: buttons,
  embed: embed,
  options: options,
  COLOURS: COLOURS
}