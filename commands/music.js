const music = require('../utilities/music.js')

module.exports = {
	name: 'music',
	description: 'music comnmand for music playing in voice channels',
	usage: '!music play [name/link]',
	execute(message, args, db, distube) {
		music.distubeCommandHandler(message, args, distube)
	}
};
