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
    this.percentageByRarity.set(ItemRarityEnum.Legendary, 2);
  }

  async run(message: CommandoMessage): Promise<Message> {
    const author = message.author;
    // Get all items grouped by rarity
    const items = await this.client.itemService.getItemsGroupedByRarity();
    const itemsWon: Item[] = [];
    // Loop through the items
    items.forEach((value: Item[], key: ItemRarityEnum) => {
      // Calculate a boolean to see if the user has won or not, take in calculation the rarity
      const rdn = randomInt(1, 101);
      const hasWon = rdn <= (this.percentageByRarity.get(key) || 0);
      // If the user has won, take a random item from that rarity and stock it
      if (hasWon) {
        const randomIndex = randomInt(value.length);
        const itemWon = value[randomIndex];
        itemsWon.push(itemWon);
      }
    });
    // Add the items to the user inventory
    this.client.userService.addItemsToUserInventory(itemsWon, author.id);
    // Format the items won and return to the user
    const returnMessage = `${author.username}: ${this.formatItemsWon(itemsWon)}`;
    return message.say(returnMessage);
  }

  formatItemsWon(itemsWon: Item[]): string {
    if (itemsWon.length === 0) return i18next.t('items:slot.noWin');
    let returnMessage = '';
    itemsWon.forEach((item) => {
      returnMessage += `${i18next.t('items:slot.won')} ${this.client.emojis.resolve(item.iconId)?.toString()} ${item.name} (${
        item.rarity
      })\n`;
    });
    return returnMessage;
  }
};
