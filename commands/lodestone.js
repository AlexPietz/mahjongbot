var request = require('request');
const Discord = require('discord.js');
const { prefix, token, xivapikey, maintainer } = require('../config.json');



module.exports = {
	name: 'lodestone',
	description: 'Set your lodestone ID.',
	aliases: ['ls'],
	args: true,
	guildonly: true,
	async execute(message, args, sequelize, CharacterProfiles) {
		const lsid = parseInt(args[0]);

		if (isNaN(lsid)) {
			return message.reply('that doesn\'t seem to be a valid number.');
		} 

		var jsonParsed; // Outer scope container for json data later

		// Call XIVAPI
		request(`https://xivapi.com/character/${lsid}?private_key=${xivapikey}`, async function (error, response, body) {
			if (error) {
				message.reply(`there was an error adding your character. Please let <@${maintainer}> know via PM.`);
   				console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		  		console.log('body:', body);
		  		return console.error('adding character failed:', error);
  			}
			// parse json
			//console.log('body:', body);
	        jsonParsed = JSON.parse(body); 
	        var newToXIVAPI = false;
		   
		  	// and handle response status
		  	switch(jsonParsed.Info.Character.State) {
				case 0: //STATE_NONE
					return console.error('adding character failed. Content is not on XIVAPI and will not be added via this request.');
				case 1: //STATE_ADDING
					newToXIVAPI = true;
					break;
				case 2: //STATE_CACHED
					break;
				case 3: //STATE_NOT_FOUND
					return message.reply('adding character failed. It does not exist on the lodestone'); // TODO: more instructions on how to fix?
				case 4: //STATE_BLACKLIST
					return message.reply('adding character failed. It is blacklisted from XIVAPI (there is nothing we can do..)'); 
				case 5: //STATE_PRIVATE
					return message.reply('adding character failed. The lodestone profile is private.'); // TODO: more instructions on how to fix?
				default:
					return message.reply('Unknown error ... Bailing out!'); // TODO: more instructions on how to fix?
			} 
			try {
				// equivalent to: INSERT INTO 
				const tag = await CharacterProfiles.create({
					lodestoneid: lsid,
					userid: message.author.id,
				});

				const addCharEmbed = new Discord.RichEmbed()
					.setColor('#4BB543')
					.setTitle(`Your character has been succesfully added!`)
					.setDescription('You can now use !update to fetch your achievement data to be assigned the Master/Enthusiast titles.')
					.setTimestamp();

				if (newToXIVAPI) {
					addCharEmbed.setDescription('It may take up to 5 minutes for character data to show. In 5 minutes, use !update to fetch your data to be assigned the Master/Enthusiast titles.');
				} else {
					addCharEmbed.setTitle(`Your character ${jsonParsed.Character.Name} has been succesfully added!`)
					.setImage(jsonParsed.Character.Portrait);
				}

				return message.reply(addCharEmbed);

			} catch (e) {
				if (e.name === 'SequelizeUniqueConstraintError') {
					return message.reply('That character id has already been recorded.');
				}
				console.error(e);
				return message.reply(`Something went wrong with adding your character. Please let <@${maintainer}> know via PM.`);
			}
		}); // End of API call
	},
};