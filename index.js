const fs = require('fs');
const Discord = require('discord.js');
const RC = require('reaction-core')
const { prefix, token, xivapikey } = require('./config.json');
const Sequelize = require('sequelize');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// SQL Connection
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

// SQL Schema
const CharacterProfiles = sequelize.define('tags', {
	userid: {
		type: Sequelize.STRING,
		unique: true,
	},
	lodestoneid: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
		unique: true,
	},
});



///// ===
// Handles all menus created
const handler = new RC.Handler()
// Handle menu button presses
client.on('messageReactionAdd', (messageReaction, user) => handler.handle(messageReaction, user))
// An example set of data; moved to extra file so that only the specific code for creating a menu is in here.
const advancedEmbed = require('./advancedbuttons')
const noviceEmbed = require('./novicebuttons')
const privateEmbed = require('./privatebuttons')
let advancedEmbedMenu = new RC.Menu(advancedEmbed.embed, advancedEmbed.buttons, advancedEmbed.options)
let noviceEmbedMenu = new RC.Menu(noviceEmbed.embed, noviceEmbed.buttons, noviceEmbed.options)
let privateEmbedMenu = new RC.Menu(privateEmbed.embed, privateEmbed.buttons, privateEmbed.options)
handler.addMenus(advancedEmbedMenu)
handler.addMenus(noviceEmbedMenu)
handler.addMenus(privateEmbedMenu)
///// ===


const cooldowns = new Discord.Collection();

client.once('ready', () => {
	//CharacterProfiles.sync({ force: true });  //forces refresh
	CharacterProfiles.sync();  //no refresh
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	var Channel = message.channel.name
    if(Channel != "lfg" && Channel != "role-request" && Channel != "bot-admin") {
        return;
        return message.channel.send('Cannot use command here, ' + message.author);
    }


	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		// Special Commands
		if (commandName === 'a' || commandName === 'advanced' || commandName === 'n' || commandName === 'novice' || commandName === 'p' || commandName === 'private') {
			var type = 'novice';
			console.error("inside special command!");
			var amount = 1;
			if (args.length) {
				amount = parseInt(args[0]);
			if (isNaN(amount)) {
					return message.reply('Please supply a number as argument. ');
				} else if (amount <= 1 || amount > 4) {
					return message.reply('You may only input a number between 1 (default) and 4.');
				}
			}
			var menu = noviceEmbedMenu;
			if (commandName === 'a' || commandName === 'advanced') {
				menu = advancedEmbedMenu;
				type = 'advanced';
			} else if (commandName === 'p' || commandName === 'private') {
				menu = privateEmbedMenu;
				type = 'private';
			}
			return message.channel.sendMenu(menu).then(msg => {
				handler.handleNewMessage(msg, message.author, amount, type);
	   			setTimeout(function() {
	 				msg.delete().catch();
	  			}, 30*60000);
				message.delete().catch();
	 		});
	 	} else {
			command.execute(message, args, sequelize, CharacterProfiles);
	 	}
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(token);
