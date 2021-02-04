import { DbotClient } from '../dbot-client';
import { Collection, MessageEmbed, User } from 'discord.js';
import { Collection as MongoDBCollection, Cursor, Db, ObjectId, ReplaceWriteOpResult } from 'mongodb';
import { Item } from '../models/items/item';
import { ItemStats } from '../models/items/item-stats';
import { Const } from '../utils/const';
import i18next from 'i18next';

export class ItemService {
  // MongoDB collection for the items
  private itemCollection: MongoDBCollection;
  // Items collection to not go to mongo each time (items doesn't change)
  // TODO: put this in redis
  private items: Collection<string, Item>;

  constructor(db: Db) {
    this.itemCollection = db.collection('items');
    this.items = new Collection<string, Item>();
  }

  async getItemById(itemId: string): Promise<Item | undefined> {
    return this.items.get(itemId);
  }

  async getItemByName(name: string): Promise<Item | undefined> {
    return this.items.find((item) => item.name.toLowerCase() === name.toLowerCase());
  }

  async createOrUpdateItem(item: Item, itemId?: string): Promise<Item> {
    const filter = {
      _id: new ObjectId(itemId),
    };
    const options = {
      upsert: true,
    };
    // Insert or update into mongo
    let result: ReplaceWriteOpResult;
    try {
      // Doing a try/catch here, because we have a unique index on name
      result = await this.itemCollection.replaceOne(filter, item, options);
    } catch (error) {
      throw new Error(error.message);
    }
    // No document updated, return error
    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      throw new Error('Error updating/creating');
    }

    const updatedItem: Item = result.ops[0];
    // Set document id based on update or insert
    if (result.modifiedCount === 1) {
      updatedItem._id = itemId ?? '';
    } else if (result.upsertedCount === 1 && result.upsertedId !== null) {
      updatedItem._id = result.upsertedId._id.toHexString();
    }
    // Add/Update the item to the collection
    this.items.set(item._id, updatedItem);

    return updatedItem;
  }

  async deleteItem(itemId: string): Promise<void> {
    const filter = {
      _id: new ObjectId(itemId),
    };
    // Delete the item
    const result = await this.itemCollection.deleteOne(filter);
    // No document matching, return error
    if (result.deletedCount === 0) {
      throw new Error('No document matching');
    }
    // Delete the item from the collection
    this.items.delete(itemId);
  }

  async deleteItems(): Promise<void> {
    await this.itemCollection.drop();
  }

  async getItems(): Promise<Collection<string, Item>> {
    return this.items;
  }

  // Populate the items collection. Doing it here instead of in the constructor so we can use await
  async initializeItems(): Promise<void> {
    // Remove items for sanity
    this.items.clear();
    // Get the items from mongo & map it to the collection
    const itemsCursor: Cursor<Item> = await this.itemCollection.find({});
    await itemsCursor.forEach((item) => {
      this.items.set(item._id.toString(), item);
    });
  }

  getFormattedStats(itemStats: ItemStats[]): string {
    const stats: string[] = [];
    itemStats.forEach((stat) => {
      stats.push(`${stat.type}: ${stat.value}`);
    });
    return stats.join('\n');
  }

  // Create an MessageEmbed from a item
  createMessageEmbed(item: Item, client: DbotClient, author: User): MessageEmbed {
    // TODO: upload icon to cdn and use in thumbnail instead of in the title
    const embed = new MessageEmbed()
      .setColor(Const.embedColor)
      .setTitle(`${client.emojis.resolve(item.iconId)?.toString()} ${item.name}`)
      .addFields(
        { name: i18next.t('items:type'), value: item.type },
        { name: i18next.t('items:rarity'), value: item.rarity },
        { name: i18next.t('items:stats'), value: client.itemService.getFormattedStats(item.stats) },
      );
    //Add id field if author is owner
    if (client.isOwner(author)) {
      embed.addField('id', item._id);
    }
    return embed;
  }
}
