import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import {
  Message,
  MessageEmbed,
  Collection,
  CollectorFilter,
  ReactionCollectorOptions,
  MessageReaction,
  User,
} from 'discord.js';
import { Const } from '../../utils/const';
import { ItemWithQty } from '../../models/items/item-with-qty';
import { ItemTypeEnum } from '../../models/items/enum/item-type.enum';
import { ItemRarityEnum } from '../../models/items/enum/item-rarity.enum';
import { InventoryPaging } from '../../models/users/inventory-paging';

module.exports = class InventoryCommand extends DbotCommand {
  private pagingCollection = new Collection<string, InventoryPaging>();

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
          default: Const.AllType,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { itemType }): Promise<Message> {
    const author = message.author;
    // Get the items
    let itemIds: string[] = [];
    try {
      itemIds = (await this.client.userService.getUserById(author.id)).inventory;
    } catch (e) {
      this.client.logger.logError(e.message);
      const unexpectedMessage = i18next.t('error.unexpected');
      return message.reply(unexpectedMessage);
    }
    const inventoryItems = this.client.itemService.getItemsGroupedByType(itemIds, itemType);
    let numberOfItems = 0;
    inventoryItems.each( (value: ItemWithQty[])  => { numberOfItems += value.length; } );
    const inventoryPaging = new InventoryPaging(inventoryItems, numberOfItems);
    this.pagingCollection.set(author.id, inventoryPaging);

    // Create the messageEmbed
    const embed = await this.createMessageEmbed(author, inventoryPaging);
    const msg = await message.embed(embed);

    // Add reactions to the message
    const leftReaction = '👈';
    const rightReaction = '👉';
    await msg.react(leftReaction);
    await msg.react(rightReaction);

    // Create the collector
    const filter: CollectorFilter = (reaction, user) => {
      return [leftReaction, rightReaction].includes(reaction.emoji.name) && user.id === message.author.id;
    };
    const options: ReactionCollectorOptions = {
      idle: 10000,
      dispose: true,
    };
    const collector = msg.createReactionCollector(filter, options);

    // Listen on collect/remove to change paging of inventory
    collector.on('collect', async (reaction, user) => {
      await this.handleCollectorResponse(reaction, user);
    });
    collector.on('remove', async (reaction, user) => {
      await this.handleCollectorResponse(reaction, user);
    });
    // Listen on end to remove from the collection
    collector.on('end', () => {
      // Not sure of this, didn't find another way to retrieve authorId...
      this.pagingCollection.delete(author.id);
    });

    return msg;
  }

  private async createMessageEmbed(author: User, inventoyPaging: InventoryPaging): Promise<MessageEmbed> {
    const avatarURL = author.displayAvatarURL();
    const embed = new MessageEmbed()
      .setColor(Const.EmbedColor)
      .setAuthor(i18next.t('users:inventory.authorName', { username: author.username }), avatarURL);
    await this.addInventoryItemsToEmbed(embed, inventoyPaging);
    return embed;
  }

  private async addInventoryItemsToEmbed(embed: MessageEmbed, inventoyPaging: InventoryPaging): Promise<void> {
    const inventoryItems = inventoyPaging.inventoryItems;
    const startIndex = inventoyPaging.startIndex;
    const endIndex = startIndex + Const.DefaultPagingRange;
    let index = 0;

    if (inventoryItems.size === 0) embed.setDescription(i18next.t('items:noInventoryItems'));
    else {
      // Loop through the collection which contains items grouped by itemType
      inventoryItems.each(async (items: ItemWithQty[], key: string) => {
        let value = '';
        // Sort by rarity desc
        items.sort((a, b) => {
          if (a.item.rarity > b.item.rarity) return -1;
          if (a.item.rarity < b.item.rarity) return 1;
          return 0;
        });

        // Loop through each items
        items.forEach((itemWithQty) => {
          // Only add items if index is between start & end
          if (index >= startIndex && index < endIndex) {
            const item = itemWithQty.item;
            value += `${this.client.emojis.resolve(item.iconId)?.toString()} ${item.name} (${
              ItemRarityEnum[item.rarity]
            })`;
            if (itemWithQty.qty > 1) value += ` x${itemWithQty.qty}`;
            value += '\n';
          }
          // Increment index
          ++index;
        });
        embed.addField(i18next.t(`enum:itemTypeEnum.${key}`), value);
      });

      // Add footer
      const pagingModulo = inventoyPaging.itemsCount % Const.DefaultPagingRange;
      const pagingDivision = Math.floor(inventoyPaging.itemsCount / Const.DefaultPagingRange);
      const maxPage = pagingModulo > 0 ? pagingDivision + 1: pagingDivision;
      embed.setFooter(`Page ${inventoyPaging.currentPage}\\${maxPage}`);
    }
  }

  private async handleCollectorResponse(reaction: MessageReaction, user: User): Promise<void> {
    // Get the paging of the user
    const inventoryPaging = this.pagingCollection.get(user.id);
    if (!inventoryPaging) return;
    // Increment or decrement index values based on emoji
    if (reaction.emoji.name === '👈') {
      const startIndex = inventoryPaging.startIndex - Const.DefaultPagingRange;
      if (startIndex < 0) return;
      inventoryPaging.startIndex = startIndex;
    } else if (reaction.emoji.name === '👉') {
      const startIndex = inventoryPaging.startIndex + Const.DefaultPagingRange;
      if (startIndex >= inventoryPaging.itemsCount) return;
      inventoryPaging.startIndex = startIndex;
    }
    // Re-set paging into the collection
    this.pagingCollection.set(user.id, inventoryPaging);

    // Edit the message with the new value
    const embed = await this.createMessageEmbed(user, inventoryPaging);
    await reaction.message.edit(embed);
  }
};
