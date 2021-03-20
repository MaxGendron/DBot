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
      aliases: ['me', 'user', 'p'],
      group: 'users',
      memberName: 'profile',
      description: i18next.t('users:profile.description'),
      throttling: {
        usages: 1,
        duration: 60,
      },
      guildOnly: true,
    });
  }

  async run(message: CommandoMessage): Promise<Message> {
    const lang: string = this.client.provider.get(message.guild, 'lang', 'en');
    const author = message.author;
    const avatarURL = author.displayAvatarURL();
    let userItems: Item[] = [];
    try {
      userItems = (await this.client.userService.getUserById(author.id)).equipped_items;
    } catch (e) {
      this.client.logger.logError(e.message);
      const unexpectedMessage = i18next.t('error.unexpected', { lng: lang });
      return message.reply(unexpectedMessage);
    }
    const embed = new MessageEmbed()
      .setColor(Const.EmbedColor)
      .setAuthor(i18next.t('users:profile.authorName', { username: author.username, lng: lang }), avatarURL)
      .setThumbnail(avatarURL)
      .addFields(
        { name: i18next.t('items:stats', { lng: lang }), value: this.getItemsStats(userItems, lang) },
        { name: i18next.t('users:profile.equipped', { lng: lang }), value: this.formatEquippedItems(userItems, lang) },
      );
    return message.embed(embed);
  }

  private formatEquippedItems(items: Item[], lang): string {
    let result = '';
    // Iterate over itemType enum value
    Object.values(ItemTypeEnum).forEach((value) => {
      // Find the item which has that enum value
      const item = items.find((i) => i.type === value);
      const valueLocalized = i18next.t(`enum:itemTypeEnum.${value}`, { lng: lang });
      if (item)
        result += `${Const.ItemTypeIcons.get(value)} ${valueLocalized}: ${item.emojiId} **${item.name}** ${Const.ItemRarityIcons.get(item.rarity)}\n`;
      else result += `${Const.ItemTypeIcons.get(value)} ${valueLocalized}: ${i18next.t('items:noItem', { lng: lang })}\n`;
    });
    return result;
  }

  private getItemsStats(items: Item[], lang): string {
    // Get the total of each ItemStatsTypeEnum
    let totalAttack = 0;
    items.forEach((item) => {
      item.stats.forEach((stat) => {
        if (stat.type === ItemStatsTypeEnum.Attack) {
          totalAttack += stat.value;
        }
      });
    });

    return `${Const.ItemStatsTypeIcons.get(ItemStatsTypeEnum.Attack)} ${i18next.t('enum:itemStatsType.Attack', {
      lng: lang,
    })}: ${totalAttack}`;
  }
};
