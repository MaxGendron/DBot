import { Util } from './../../utils/util';
import { Message } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import i18next from 'i18next';
import { DbotClient } from '../../dbot-client';
import { DbotCommand } from '../../dbot-command';
import { ItemRarityEnum } from '../../models/items/enum/item-rarity.enum';

module.exports = class EquipCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'equip',
      aliases: ['equip-item', 'e'],
      group: 'users',
      memberName: 'equip',
      description: i18next.t('users:equip.description'),
      throttling: {
        usages: 1,
        duration: 60,
      },
      args: [
        {
          key: 'itemName',
          prompt: i18next.t('users:equip.args.itemName'),
          type: 'string',
          max: 200,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { itemName }): Promise<Message> {
    const author = message.author;
    // Get the item the user requested
    const itemToEquip = this.client.itemService.getItemByName(itemName);
    if (!itemToEquip) {
      const replyMessage = i18next.t('error.noItemFoundForName', { itemName: itemName });
      return message.reply(replyMessage);
    }

    try {
      // Get the userInventory and see if the user has the requested item
      const user = await this.client.userService.getUserById(author.id);
      const hasItemInInventory = user.inventory.filter((s) => s === itemToEquip._id.toHexString()).length > 0;

      if (hasItemInInventory) {
        // Verify if the user already has a item equipped for that type
        const equippedItem = user.equipped_items.filter((i) => i.type === itemToEquip.type)[0];
        if (equippedItem) {
          // Ask the user if he wants to replace the equipped item
          const askMessage = i18next.t('users:equip.wantsReplaceItem', { itemName: equippedItem.name });
          await message.reply(askMessage);
          // Get the user response
          const wantsToReplace = await Util.verifyUserReponse(message.channel, message.author);

          // Remove the equipped item & add it back to the userInventory
          if (wantsToReplace) await this.client.userService.unequipItem(equippedItem, author.id);
          else {
            const replyMessage = i18next.t('reply.cancelledCommand');
            return message.reply(replyMessage);
          }
        }

        // Equip the item for the user
        await this.client.userService.equipItem(itemToEquip, author.id);
        // Remove the item from the inventory
        await this.client.userService.removeItemFromUserInventory(itemToEquip._id.toHexString(), author.id);

        // Return user confirmation
        const formattedItem = `${this.client.emojis.resolve(itemToEquip.iconId)?.toString()} **${
          itemToEquip.name
        }**, (${ItemRarityEnum[itemToEquip.rarity]})`;
        const returnMessage = `${author.username}: ${formattedItem} ${i18next.t('users:equip.response')}`;
        return message.say(returnMessage);
      } else {
        // If the user don't have the item in his inventory, return error
        const replyMessage = i18next.t('users:equip.itemNotInInventory', { itemName: itemToEquip.name });
        return message.reply(replyMessage);
      }
    } catch (e) {
      const unexpectedMessage = i18next.t('error.unexpected');
      return message.reply(unexpectedMessage);
    }
  }
};
