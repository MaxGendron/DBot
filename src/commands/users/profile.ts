import { ItemStatsTypeEnum } from './../../models/items/enum/item-stats-type.enum';
import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message, MessageEmbed } from 'discord.js';
import { Const } from '../../utils/const';
import { Item } from '../../models/items/item';
import { ItemTypeEnum } from '../../models/items/enum/item-type.enum';

module.exports = class ProfileCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'profile',
      aliases: ['me', 'user'],
      group: 'users',
      memberName: 'profile',
      description: i18next.t('users:profile.description'),
      throttling: {
        usages: 1,
        duration: 60,
      },
    });
  }

  async run(message: CommandoMessage): Promise<Message> {
    const author = message.author;
    const avatarURL = author.displayAvatarURL();
    const userItems = (await this.client.userService.getUserById(author.id)).equipped_items;
    const embed = new MessageEmbed()
      .setColor(Const.embedColor)
      .setAuthor(i18next.t('users:profile.authorName', { username: author.username }), avatarURL)
      .setThumbnail(avatarURL)
      .addFields(
        { name: i18next.t('items:stats'), value: this.getItemsStats(userItems) },
        { name: i18next.t('users:profile.equipped'), value: this.formatEquippedItems(userItems) },
      );
    return message.embed(embed);
  }

  private formatEquippedItems(items: Item[]): string {
    let result = '';
    // Iterate over itemType enum value
    Object.values(ItemTypeEnum).forEach((value) => {
      // Find the item which has that enum value
      const item = items.find((i) => i.type === value);
      const valueLocalized = i18next.t(`enum:itemTypeEnum.${value}`);
      // TODO: Add emoji for each itemType
      if (item)
        result += `${valueLocalized}: ${this.client.emojis.resolve(item.iconId)?.toString()} ${item.name}, ${
          item.rarity
        }\n`;
      else result += `${valueLocalized}: ${i18next.t('items:noItem')}\n`;
    });
    return result;
  }

  private getItemsStats(items: Item[]): string {
    // Get the total of each ItemStatsTypeEnum
    let totalAttack = 0;
    items.forEach((item) => {
      item.stats.forEach((stat) => {
        if (stat.type === ItemStatsTypeEnum.Attack) {
          totalAttack += stat.value;
        }
      });
    });

    return `${i18next.t('enum:itemStatsType.attack')}: ${totalAttack}`;
  }
};
