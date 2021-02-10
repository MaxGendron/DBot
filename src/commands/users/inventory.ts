import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message, MessageEmbed, Collection } from 'discord.js';
import { Const } from '../../utils/const';
import { Item } from '../../models/items/item';

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
    });
  }

  async run(message: CommandoMessage): Promise<Message> {
    const author = message.author;
    const avatarURL = author.displayAvatarURL();
    const itemIds = (await this.client.userService.getUserById(author.id)).inventory;
    const inventoryItems = await this.client.itemService.getItemsGroupedByType(itemIds);
    const embed = new MessageEmbed()
      .setColor(Const.embedColor)
      .setAuthor(i18next.t('users:inventory.authorName', { username: author.username }), avatarURL);
    await this.addInventoryItems(embed, inventoryItems);
    return message.embed(embed);
  }

  private async addInventoryItems(embed: MessageEmbed, inventoryItems: Collection<string, Item[]>): Promise<void> {
    if (inventoryItems.size === 0) embed.setDescription(i18next.t('items:noInventoryItems'));
    else {
      inventoryItems.each(async (items: Item[], key: string) => {
        let value = '';
        items.forEach(
          (item) => (value += `${this.client.emojis.resolve(item.iconId)?.toString()} ${item.name} (${item.rarity})\n`),
        );
        embed.addField(i18next.t(`enum:itemTypeEnum.${key}`), value);
      });
    }
  }
};
