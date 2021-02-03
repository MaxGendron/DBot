import { Util } from './../../utils/util';
import { Const } from '../../utils/const';
import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message, MessageEmbed } from 'discord.js';

module.exports = class GetItemCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'get-item',
      aliases: ['item'],
      group: 'items',
      memberName: 'get-item',
      description: i18next.t('items:getItem.description'),
      throttling: {
        usages: 1,
        duration: 60,
      },
      args: [
        {
          key: 'itemName',
          prompt: i18next.t('items:getItem.args.itemName'),
          type: 'string',
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          validate: itemName => itemName.length <= 200,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { itemName }): Promise<Message> {
    // Get the item
    const item = await this.client.itemService.getItemByName(itemName);
    if (!item) {
      const replyMessage = i18next.t('error.noItemFoundForName', { itemName: itemName });
      return message.reply(replyMessage);
    }
    // TODO: upload icon to cdn and use in thumbnail instead of in the title
    const embed = new MessageEmbed()
      .setColor(Const.embedColor)
      .setTitle(`${this.client.emojis.resolve(item.iconId)?.toString()} ${item.name}`)
      .addFields(
        { name: i18next.t('items:type'), value: item.type },
        { name: i18next.t('items:rarity'), value: item.rarity },
        { name: i18next.t('items:stats'), value: Util.getFormattedStats(item.stats) },
      );
    //Add id field if author is owner
    if (this.client.isOwner(message.author)) {
      embed.addField('id', item._id);
    }
    return message.embed(embed);
  }
};
