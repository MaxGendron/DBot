import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message } from 'discord.js';

module.exports = class ReloadItemsCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'reload-items',
      group: 'items',
      memberName: 'reload-items',
      description: i18next.t('items:reloadItems.description'),
      ownerOnly: true,
    });
  }

  async run(message: CommandoMessage): Promise<Message> {
    const lang: string = this.client.provider.get(message.guild, 'lang', 'en');
    // reload the items
    await this.client.itemService.initializeItems();
    return message.say(i18next.t('items:reloadItems.returnMessage', { lng: lang }));
  }
};
