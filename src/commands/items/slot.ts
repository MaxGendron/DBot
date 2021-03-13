import { Const } from './../../utils/const';
import { User } from './../../models/users/user';
import { ItemRarityEnum } from './../../models/items/enum/item-rarity.enum';
import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message, Collection } from 'discord.js';
import { Item } from '../../models/items/item';
import { randomInt } from 'crypto';

module.exports = class SlotCommand extends DbotCommand {
  private percentageByRarity = new Collection<ItemRarityEnum, number>();

  constructor(client: DbotClient) {
    super(client, {
      name: 'slot',
      aliases: ['slots', 's'],
      group: 'items',
      memberName: 'slot',
      description: i18next.t('items:slot.description'),
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 3600,
      },
    });

    this.percentageByRarity.set(ItemRarityEnum.Common, 90);
    this.percentageByRarity.set(ItemRarityEnum.Rare, 30);
    this.percentageByRarity.set(ItemRarityEnum.Epic, 10);
    this.percentageByRarity.set(ItemRarityEnum.Legendary, 0.5);
  }

  async run(message: CommandoMessage): Promise<Message> {
    const lang: string = this.client.provider.get(message.guild, 'lang', 'en');
    const author = message.author;
    const unexpectedMessage = i18next.t('error.unexpected', { lng: lang });
    // Get all items grouped by rarity
    const items = this.client.itemService.getItemsGroupedByRarity();
    const itemsWon: Item[] = [];
    const itemsToShow = new Collection<ItemRarityEnum, Item[]>();

    // Get the user
    let user: User;
    try {
      user = await this.client.userService.getUserById(author.id);
    } catch (e) {
      this.client.logger.logError(e.message);
      return message.reply(unexpectedMessage);
    }

    // Loop through the items
    items.forEach((value: Item[], key: ItemRarityEnum) => {
      // Calculate a boolean to see if the user has won or not, take in calculation the rarity
      const rdn = Math.random() * (101 - 1) + 1;
      const hasWon = rdn <= (this.percentageByRarity.get(key) || 0);
      // If the user has won, take a random item from that rarity and stock it
      if (hasWon) {
        const randomIndex = randomInt(value.length);
        const itemWon = value[randomIndex];
        itemsWon.push(itemWon);
        // Add 3x the same item
        itemsToShow.set(key, [itemWon, itemWon, itemWon]);
      } else {
        // Add 3 random item, dont put 3x the same item
        const randomItems: Item[] = [];
        let i = 0;
        while (i < 3) {
          const randomIndex = randomInt(value.length);
          const randomItem = value[randomIndex];
          // If the item isn't already in the list 2 times, add it
          const viableItem =
            randomItems.filter((item) => item._id.toHexString() === randomItem._id.toHexString()).length < 2;
          if (viableItem) {
            randomItems.push(randomItem);
            i++;
          }
        }
        itemsToShow.set(key, randomItems);
      }
    });

    // Add the items to the user inventory
    try {
      await this.client.userService.addItemsToUserInventory(itemsWon, author.id);
    } catch (e) {
      this.client.logger.logError(e.message);
      return message.reply(unexpectedMessage);
    }

    // Do the "edit message", reveal one row at a time
    const msg: Message = await message.say(this.getMessage(itemsToShow, 4));
    await this.delay(1000);
    for (let i = 3; i >= 0; i--) {
      await msg.edit(this.getMessage(itemsToShow, i));
      await this.delay(1000);
    }

    // Format the items won and return to the user
    const returnMessage = `${author.username}: ${this.formatItemsWon(itemsWon, user.inventory, lang)}`;
    return message.say(returnMessage);
  }

  getMessage(itemsToShow: Collection<ItemRarityEnum, Item[]>, hiddenRowCount: number): string {
    let message = '';
    const itemIndex = itemsToShow.size - hiddenRowCount;
    let index = 0;

    // Loop through the collection, only reveal row that we asked
    itemsToShow.each((value: Item[]) => {
      if (index < itemIndex) {
        value.forEach((item) => {
          message += `${this.client.emojis.resolve(item.iconId)?.toString()}`;
        });
        message += '\n';
        index++;
      }
    });

    // Add hidden rows at the end
    for (let i = 0; i < hiddenRowCount; i++) {
      // eslint-disable-next-line no-useless-escape
      message += ':lock: :lock: :lock: :grey_question:\n';
    }
    return message;
  }

  formatItemsWon(itemsWon: Item[], userInventory: string[], lang): string {
    if (itemsWon.length === 0) return i18next.t('items:slot.noWin', { lng: lang });
    let returnMessage = '';
    itemsWon.forEach((item) => {
      // If the user don't already have the item, show a "new item" badge
      if (!userInventory.includes(item._id.toHexString())) returnMessage += `${Const.NewItemIcon} `;
      returnMessage += `${i18next.t('items:slot.won', { lng: lang })} ${this.client.emojis.resolve(item.iconId)?.toString()} **${
        item.name
      }** ${Const.RarityIcons.get(item.rarity)}\n`;
    });
    return returnMessage;
  }

  delay(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
