function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return mention;
		//return client.users.get(mention);
	}
}


module.exports = {
	name: 'listls',
	description: 'List all lodestone IDs.',
	guildonly: true,
	async execute(message, args, sequelize, CharacterProfiles) {

		// only execute in admin channel
		var Channel = message.channel.name
	    if(Channel != "bot-admin") {
	        return message.channel.send('Cannot use command here, ' + message.author);
	    }

	    //check whether specific user was mentioned or not

	    if (args.length) {
	    	const user = getUserFromMention(args[0])
	    	const tag = await CharacterProfiles.findOne({ where: { userid: user } });
	    	return message.channel.send(message.guild.members.get(user)+`->`+tag.get('lodestoneid'));


	    } else {
			const tagList = await CharacterProfiles.findAll({ attributes: ['userid','lodestoneid'] });
			console.log(tagList)


			var tagString = ""

			tagList.forEach((t) => {
				console.log(t.get());
				tagString = tagString + `\n` + message.guild.members.get(t.userid) + `-> <https://eu.finalfantasyxiv.com/lodestone/character/${t.lodestoneid}/>`;

			});


			return message.channel.send(`List of ids: ${tagString}`);
		}
	}
}
