const { Command } = require('discord.js-commando');

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      group: 'first',
      memberName: 'ping',
      description: 'Ping!',
      throttling: {
        usages: 1,
        duration: 60,
      },
      guildOnly: true,
    });
  }

  run(message) {
    return message.say('Pong!');
  }
};
