import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message } from 'discord.js';

module.exports = class DeleteItemCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'delete-item',
      group: 'items',
      memberName: 'delete-item',
      description: i18next.t('items:deleteItem.description'),
      ownerOnly: true,
      args: [
        {
          key: 'id',
          prompt: i18next.t('items:deleteItem.args.id'),
          type: 'string',
          // MongoId length is 24
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          validate: id => id.length === 24,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { id }): Promise<Message> {
    // Delete the item
    try {
      await this.client.itemService.deleteItem(id);
    } catch (error) {
      if (error.message === 'No document matching') {
        const replyMessage = (i18next.t('error.noDocumentFound'));
        return message.reply(replyMessage);
      }
      const replyMessage = (i18next.t('error.unexpectedError'));
      return message.reply(replyMessage);
    }
    return message.say(i18next.t('items:deleteItem.returnMessage', { id: id }));
  }
};
