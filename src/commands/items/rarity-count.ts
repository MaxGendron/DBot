import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message, MessageEmbed } from 'discord.js';
import { ItemRarityEnum } from '../../models/items/enum/item-rarity.enum';
import { Item } from '../../models/items/item';
import { Const } from '../../utils/const';

module.exports = class GetItemCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'rarity-count',
      aliases: ['rc'],
      group: 'items',
      memberName: 'rarity-count',
      description: i18next.t('items:rarityCount.description'),
    });
  }

  run(message: CommandoMessage): Promise<Message> {
    const lang: string = this.client.provider.get(message.guild, 'lang', 'en');
    // Get the item
    const items = this.client.itemService.getItemsGroupedByRarity();
    let desc = '';
    items.forEach((value: Item[], key: ItemRarityEnum) => {
      desc += `${i18next.t(`enum:itemRarityEnum.${key + 1}`, { lng: lang })} ${Const.ItemRarityIcons.get(key)}: ${value.length} \n\n`;
    });
    return message.embed(new MessageEmbed()
      .setTitle(i18next.t('items:rarityCount.embedTitle', { lng: lang }))
      .setColor(Const.EmbedColor)
      .setDescription(desc));
  }
};
