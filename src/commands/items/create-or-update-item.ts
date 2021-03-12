import { Item } from '../../models/items/item';
import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message } from 'discord.js';
import { TypedJSON } from 'typedjson';
const defaultId = 'DEFAULT_ID';

module.exports = class CreateOrUpdateItemCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'create-update-item',
      aliases: ['add-item', 'new-item', 'update-item', 'create-item'],
      group: 'items',
      memberName: 'create-update-item',
      description: i18next.t('items:createOrUpdateItem.description'),
      ownerOnly: true,
      args: [
        {
          key: 'itemJson',
          prompt: i18next.t('items:createOrUpdateItem.args.json'),
          type: 'string',
        },
        {
          key: 'id',
          // Prompt not used since arg optional
          prompt: '',
          type: 'string',
          default: defaultId,
          // MongoId length is 24
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          validate: (id) => id.length === 24,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { itemJson, id }): Promise<Message> {
    const lang: string = this.client.provider.get(message.guild, 'lang', 'en');
    const unexpectedMessage = i18next.t('error.unexpected', { lng: lang });
    //Desirialize the json
    let item: Item | undefined;
    try {
      const serializer = new TypedJSON(Item, {
        errorHandler: (e): void => {
          throw e;
        },
      });
      item = serializer.parse(itemJson);
    } catch (error) {
      this.client.logger.logError(`Error Deserializing:\n${error.message}`);
      const replyMessage = i18next.t('error.deserialize', { lng: lang });
      return message.reply(replyMessage);
    }

    if (item !== undefined) {
      //Create the item
      let newItem: Item;
      try {
        // If id is equal to default id, set it to undefined otherwise keep it
        id = id === defaultId ? undefined : id;
        newItem = await this.client.itemService.createOrUpdateItem(item, id);
      } catch (error) {
        this.client.logger.logError(error.message);
        // E11000 is the mongoDB error code for duplicate key error (unique in this case)
        if (error.message && error.message.startsWith('E11000')) {
          const replyMessage = i18next.t('error.itemWithSameName', { lng: lang });
          return message.reply(replyMessage);
        }
        return message.reply(unexpectedMessage);
      }
      const embed = this.client.itemService.createMessageEmbed(newItem, this.client, message.author, lang);
      return message.embed(embed, i18next.t('items:createOrUpdateItem.returnMessage', { lng: lang }));
    } else {
      // Shouldn't happend
      return message.reply(unexpectedMessage);
    }
  }
};
