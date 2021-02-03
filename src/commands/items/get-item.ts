import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message } from 'discord.js';

module.exports = class GetItemCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'get-item',
      aliases: ['item'],
      group: 'items',
      memberName: 'get-item',
      description: i18next.t('items:getItem.description'),
      throttling: {
        usages: 1,
        duration: 60,
      },
      args: [
        {
          key: 'itemName',
          prompt: i18next.t('items:getItem.args.itemName'),
          type: 'string',
          max: 200,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { itemName }): Promise<Message> {
    // Get the item
    const item = await this.client.itemService.getItemByName(itemName);
    if (!item) {
      const replyMessage = i18next.t('error.noItemFoundForName', { itemName: itemName });
      return message.reply(replyMessage);
    }
    // TODO: upload icon to cdn and use in thumbnail instead of in the title
    const embed = this.client.itemService.createMessageEmbed(item, this.client, message.author);
    return message.embed(embed);
  }
};
