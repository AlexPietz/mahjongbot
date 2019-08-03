var request = require('request');
const Discord = require('discord.js');
const { prefix, token, xivapikey, maintainer } = require('../config.json');


const achievementEnthusiast = 2181; 
const achievementMaster = 2182; 
const titleEnthusiast = 409; 
const titleMaster = 410; 

module.exports = {
	name: 'update',
	description: 'Update your achievement data.',
	cooldown: 5*60,
	guildonly: true,
	async execute(message, args, sequelize, CharacterProfiles) {
		// Fetch user's lodestone ID
		const lsidEntry = await CharacterProfiles.findOne({ where: { userid: message.author.id } });
		if (!lsidEntry) {
			return message.reply(`Could not find your lodestone id. Please set it with !lodestone <id>`);
		}
		lsid = lsidEntry.get('lodestoneid');

		var jsonParsed; // Outer scope container for json data later

		// Call XIVAPI
		request(`https://xivapi.com/character/${lsid}?data=AC&private_key=${xivapikey}`, async function (error, response, body) {
			if (error) {
				message.reply(`there was an error reading your character info. Please let <@${maintainer}> know via PM.`);
   				console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		  		console.log('body:', body);
		  		return console.error('reading character failed:', error);
  			}
  			// Parse JSON
	        jsonParsed = JSON.parse(body); 		   
		  	// and handle response status
		  	switch(jsonParsed.Info.Character.State) {
				case 0: //STATE_NONE
					return console.error('reading character failed. Content is not on XIVAPI and will not be added via this request.');
				case 1: //STATE_ADDING
					return message.reply('Your lodestone data has not been loaded completely yet. Please try again in a few minutes.')
				case 2: //STATE_CACHED
					break;
				case 3: //STATE_NOT_FOUND
					return message.reply('reading character failed. It does not exist on the lodestone'); // TODO: more instructions on how to fix?
				case 4: //STATE_BLACKLIST
					return message.reply('reading character failed. It is blacklisted from XIVAPI (there is nothing we can do..)'); 
				case 5: //STATE_PRIVATE
					return message.reply('reading character failed. The lodestone profile is private.'); // TODO: more instructions on how to fix?
				default:
					return message.reply('Unknown error ... Bailing out!'); // TODO: more instructions on how to fix?
			} 
			//console.log('body:', body);


			var achievementList = []

			if (jsonParsed.Achievements != null) {
				// Parse achievements
				jsonParsed.Achievements.List.forEach(function (result) {
				    achievementList.push(result.ID);
				});
			}

			// Check if achiementids above are \elem of api data, if yes, assign discord role.
			const guildMember = message.member;
			var roleE = message.guild.roles.find(role => role.name === 'Mahjong Enthusiast')
			var roleM = message.guild.roles.find(role => role.name === 'Mahjong Master')

			var assigned = false;

			if (jsonParsed.Character.Title == titleEnthusiast || achievementList.includes(achievementEnthusiast)) {
				guildMember.addRole(roleE);
				message.reply(' You have been granted the Mahjong Enthusiast role!');
				assigned = true;
			}
			if (jsonParsed.Character.Title == titleMaster || achievementList.includes(achievementMaster)) {
				guildMember.addRole(roleM);
				message.reply(' You have been granted the Mahjong Master role!');
				assigned = true;
			}
			if (!assigned) {
				// Check for achievements being set to private
				if (jsonParsed.Achievements === null) {
					return message.reply('Could not retrieve achievement data because of your privacy settings.')
					//https://www.reddit.com/r/ffxiv/comments/2oukmu/how_to_make_achievements_viewable_on_lodestone/
				} else {
					message.reply(' Could not retrieve your title/achievements. Please set your title accordingly and/or make your achievements public. If you don\'t have the Mahjong Enthusiast/Master role, use !update again once you got it :)');
				}
			}
			return;
			

		}); // End of API call
	},
};