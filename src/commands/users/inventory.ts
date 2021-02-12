import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message, MessageEmbed, Collection } from 'discord.js';
import { Const } from '../../utils/const';
import { ItemWithQty } from '../../models/items/item-with-qty';
import { ItemTypeEnum } from '../../models/items/enum/item-type.enum';

module.exports = class InventoryCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'inventory',
      aliases: ['i', 'users'],
      group: 'users',
      memberName: 'inventory',
      description: i18next.t('users:inventory.description'),
      throttling: {
        usages: 1,
        duration: 60,
      },
      guildOnly: true,
      args: [
        {
          key: 'itemType',
          // Prompt not used since arg optional
          prompt: '',
          type: 'string',
          oneOf: Object.values(ItemTypeEnum),
          default: 'all',
        },
      ],
    });
  }

  async run(message: CommandoMessage, { itemType }): Promise<Message> {
    const author = message.author;
    const avatarURL = author.displayAvatarURL();
    let itemIds: string[] = [];
    try {
      itemIds = (await this.client.userService.getUserById(author.id)).inventory;
    } catch (e) {
      const unexpectedMessage = i18next.t('error.unexpected');
      message.reply(unexpectedMessage);
    }
    const inventoryItems = await this.client.itemService.getItemsGroupedByType(itemIds, itemType);
    const embed = new MessageEmbed()
      .setColor(Const.embedColor)
      .setAuthor(i18next.t('users:inventory.authorName', { username: author.username }), avatarURL);
    await this.addInventoryItems(embed, inventoryItems);
    return message.embed(embed);
  }

  private async addInventoryItems(
    embed: MessageEmbed,
    inventoryItems: Collection<string, ItemWithQty[]>,
  ): Promise<void> {
    if (inventoryItems.size === 0) embed.setDescription(i18next.t('items:noInventoryItems'));
    else {
      inventoryItems.each(async (items: ItemWithQty[], key: string) => {
        let value = '';
        items.forEach((itemWithQty) => {
          const item = itemWithQty.item;
          value += `${this.client.emojis.resolve(item.iconId)?.toString()} ${item.name} (${item.rarity})`;
          if (itemWithQty.qty > 1) value += ` x${itemWithQty.qty}`;
          value += '\n';
        });
        embed.addField(i18next.t(`enum:itemTypeEnum.${key}`), value);
      });
    }
  }
};
