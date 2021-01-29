const { Command } = require('discord.js-commando');

module.exports = class PingCommand extends Command {
  constructor(client) {
		super(client, {
			name: 'ping1',
			group: 'first',
			memberName: 'ping',
      description: 'Ping!',
      throttling: {
        usages: 1,
        duration: 60,
      },
      guildOnly: true,
      args: [
        {
          key: 'text',
          prompt: 'What text would you like the bot to say?',
          type: 'string',
        },
      ],
		});
  }

  run(message, { text }) {
		return message.reply(text);
	}
};
