import { CommandoClient, Command, CommandoMessage } from "discord.js-commando";

module.exports = class PingCommand extends Command {
  constructor(client: CommandoClient) {
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

  run(message: CommandoMessage) {
    return message.say('Pong!');
  }
};
