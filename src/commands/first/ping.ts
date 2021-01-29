import { CommandoClient, Command, CommandoMessage } from 'discord.js-commando';
import i18next from 'i18next';

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

  run(message: CommandoMessage): Promise<CommandoMessage> {
    const response = i18next.t('ping', { commandName: message.command?.name, response: 'Pong!' });
    return message.say(response);
  }
};
