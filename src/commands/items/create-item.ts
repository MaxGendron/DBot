import { Item } from './../../models/items/item';
import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message } from 'discord.js';
import { TypedJSON } from 'typedjson';

module.exports = class CreateItemCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'create-item',
      aliases: ['add-item', 'new-item'],
      group: 'items',
      memberName: 'create-item',
      description: i18next.t('items:getItem.description'),
      ownerOnly: true,
      args: [
        {
          key: 'itemJson',
          prompt: i18next.t('items:getItem.args.itemName'),
          type: 'string',
        },
      ],
    });
  }

  async run(message: CommandoMessage, { itemJson }): Promise<Message> {
    const unexpectedMessage = i18next.t('error.unexpected');
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
      const replyMessage = i18next.t('error.deserialize');
      return message.reply(replyMessage);
    }

    if (item !== undefined) {
      // Validate that the name doesn't already exist
      if ((await this.client.itemService.getItemByName(item.name)) !== undefined) {
        const replyMessage = i18next.t('error.itemWithSameName');
        return message.reply(replyMessage);
      }
      //Create the item
      let newItem: Item;
      try {
        newItem = await this.client.itemService.createOrUpdateItem(item);
      } catch (error) {
        return message.reply(unexpectedMessage);
      }
      const embed = this.client.itemService.createMessageEmbed(newItem, this.client, message.author);
      return message.embed(embed, i18next.t('items:createItem.returnMessage'));
    } else {
      // Shouldn't happend
      return message.reply(unexpectedMessage);
    }
  }
};
