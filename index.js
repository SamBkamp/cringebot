const fs = require('fs');
const Discord = require('discord.js');

const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")
const adapter = new FileSync('db.json')
const db = low(adapter)

const { prefix, token } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// React to message function
function reactToMessage(client, channelId, messageId, emojiReaction) {
	client.guilds.cache.get('734343453051453460').channels.cache.get(channelId).messages.fetch(messageId).then( e => 
		e.react(emojiReaction)
	)
}


client.once('ready', () => {
	console.log('Ready!');
	reactToMessage(client, "734346523969585202", "734362546466979881", '\uD83D\uDFE9')
	reactToMessage(client, "734346523969585202", "734362546466979881", '\uD83D\uDFE5')
	reactToMessage(client, "734346592873742426", "734365412409737317", '1️⃣')
	reactToMessage(client, "734346592873742426", "734365412409737317", '2️⃣')
});

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Actual function for adding roles
function addRole(message, reaction, user, roleid) {
	message.guild.members.fetch(user.id).then(member => {
		reaction.users.remove(user.id)
		member.roles.add(roleid);
	});
}

// Role adder function
client.on('messageReactionAdd', (reaction, user) => {
	let message = reaction.message, emoji = reaction.emoji;
	if (user.id == client.user.id) return

	switch(message.id) {
		case "734362546466979881":
			switch(emoji.name) {
				case '🟩':
					addRole(message, reaction, user, "734356952011767810")
					break;
				case '🟥':
					message.guild.members.fetch(user.id).then(member => {
						reaction.users.remove(user.id)
						member.kick();
					});
					break;
				default:
					break;
			}
			break;
		case "734365412409737317":
			switch(emoji.name) {
				case '1️⃣':
					addRole(message, reaction, user, "734366871092068363")
					break;
				case '2️⃣':
					addRole(message, reaction, user, "734366905317457920")
					break;
				default:
					break;
			}
			break;
		default:
			break;
	}
	
});


client.on('message', message => {
	if(message.author.bot) return;
	if(message.author.username == undefined) return
	// Level calculation on each message
	if (db.get("users").get(message.author).value() == undefined) {
		var dbUser = db.get("users").get(message.author)
		console.log("dbuser is undefined")
		db.get("users")
		.set(message.author, { "level": 0, "xp": 20, nextLevelXp: 100, msSinceLastXp: 1595223500000, id: message.author.id })
		.write()
		return;
	}

	if (!message.content.startsWith(prefix) || message.channel != "734371349358837782" ) {	
		// Re-establish updated user
		dbUser = db.get("users").get(message.author)

		// Add xp to user if over a minute has passed since last xp
		let date = new Date()
		if ((date.getTime() - dbUser.get("msSinceLastXp").value()) > 60000) { 
			dbUser.update("xp", n => n + (Math.floor(Math.random() * 8)+18)).write()
			dbUser.set("msSinceLastXp", date.getTime()).write()
		}

		// Re-establish updated user
		dbUser = db.get("users").get(message.author)

		// If nextLevelXp == currentXp, levelup
		if (dbUser.get("xp").value() >= dbUser.get("nextLevelXp").value()) {
			dbUser.update("level", n => n+1 ).write()
			var currentNewLevel = dbUser.get("level").value()
			client.channels.cache.get("734422195203211287").send(`${message.author.username} has reached level **${currentNewLevel}**`)
			
			currentNewLevel = currentNewLevel+1
			let newXp = 5*(Math.pow(currentNewLevel, 2)) + 50 * currentNewLevel + 100
			console.log(newXp, currentNewLevel)
			dbUser.set("nextLevelXp", newXp).write()
		}

		return
	}

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(message, args, db);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(token);
