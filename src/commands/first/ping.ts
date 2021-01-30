import { DbotClient } from './../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import i18next from 'i18next';
import { DbotCommand } from '../../dbot-command';

module.exports = class PingCommand extends DbotCommand {
  constructor(client: DbotClient) {
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

  async run(message: CommandoMessage): Promise<CommandoMessage> {
    await this.client.provider.set(message.guild, 'ping', 'Pong');
    
    const response = i18next.t('ping', { commandName: message.command?.name, response: 'Pong!' });
    return message.say(response);
  }
};
