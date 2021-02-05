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
      aliases: ['i'],
      group: 'users',
      memberName: 'inventory',
      description: i18next.t('users:inventory.description'),
      throttling: {
        usages: 1,
        duration: 60,
      },
    });
  }

  async run(message: CommandoMessage): Promise<Message> {
    const author = message.author;
    const avatarURL = author.displayAvatarURL();
    const inventoryItems = await this.client.userService.getUserInventoryItemsGroupedByType(author.id);
    const embed = new MessageEmbed()
      .setColor(Const.embedColor)
      .setAuthor(i18next.t('users:inventory.authorName', { username: author.username }), avatarURL)
      .addFields();
    await this.addInventoryItems(embed, inventoryItems);
    return message.embed(embed);
  }

  private async addInventoryItems(embed: MessageEmbed, inventoryItems: Collection<string, Item[]>): Promise<void> {
    inventoryItems.each(async (items: Item[], key: string) => {
      let value = '';
      await items.forEach((item) => (value += `${this.client.emojis.resolve(item.iconId)?.toString()} ${item.name}\n`));
      embed.addField(i18next.t(`enum:itemTypeEnum.${key}`), value);
    });
  }
};
