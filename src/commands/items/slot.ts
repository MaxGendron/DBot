import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message } from 'discord.js';

module.exports = class SlotCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'slot',
      aliases: ['slots', 's'],
      group: 'items',
      memberName: 'slot',
      description: i18next.t('items:reloadItems.description'),
      guildOnly: true,
    });
  }

  async run(message: CommandoMessage): Promise<Message> {
    return message.say('');
  }
};
