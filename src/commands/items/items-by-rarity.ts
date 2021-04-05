import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message } from 'discord.js';

module.exports = class GetItemCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'items-by-rarity',
      aliases: ['ir', 'items-rarity', 'ibr'],
      group: 'items',
      memberName: 'items-by-rarity',
      description: i18next.t('items:getItem.description'),
      ownerOnly: true,
      args: [
        {
          key: 'itemRarity',
          // Prompt not used since arg optional
          prompt: '',
          type: 'integer',
          default: 'none',
        },
      ],
    });
  }

  run(message: CommandoMessage, { itemRarity }): Promise<Message> {
    const author = message.author;
    const lang: string = this.client.provider.get(message.guild, 'lang', 'en');
    const noDocumentFound = i18next.t('error.noDocumentFound', { lng: lang });
    if (itemRarity === 'none') return message.say(noDocumentFound);

    // Get the items
    const itemsByRarity = this.client.itemService.getItemsGroupedByRarity();
    const items = itemsByRarity.get(itemRarity);
    if (!items) return message.say(noDocumentFound);
    items.forEach(item => {
      const embed = this.client.itemService.createMessageEmbed(item, this.client, author, lang);
      message.embed(embed);
    });

    return message.say('End');
  }
};
