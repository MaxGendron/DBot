module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, args) {
    if (args) {
      console.log(args);
    }
		message.channel.send('Pong.');
	},
};