import { ItemTypeEnum } from './../models/items/enum/item-type.enum';
import { ItemRarityEnum } from './../models/items/enum/item-rarity.enum';
import { DbotClient } from '../dbot-client';
import { Collection, MessageEmbed, User } from 'discord.js';
import {
  Collection as MongoDBCollection,
  Cursor,
  Db,
  FilterQuery,
  ObjectId,
  ReplaceOneOptions,
  ReplaceWriteOpResult,
} from 'mongodb';
import { Item } from '../models/items/item';
import { ItemStats } from '../models/items/item-stats';
import { Const } from '../utils/const';
import i18next from 'i18next';
import { ItemWithQty } from '../models/items/item-with-qty';
import { Util } from '../utils/util';

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

  getItemById(itemId: string): Item | undefined {
    return this.items.get(itemId);
  }

  getItemByName(name: string): Item | undefined {
    return this.items.find((item) => item.name.toLowerCase() == name.toLowerCase());
  }

  async createOrUpdateItem(item: Item, itemId?: string): Promise<Item> {
    let filter: FilterQuery<Item> = {};
    if (itemId) filter = { _id: new ObjectId(itemId) };
    const options: ReplaceOneOptions = { upsert: true };
    // Insert or update into mongo
    let result: ReplaceWriteOpResult;
    try {
      // Doing a try/catch here, because we have a unique index on name
      result = await this.itemCollection.replaceOne(filter, item, options);
    } catch (error) {
      throw new Error(error.message);
    }
    // No document updated, return error
    if (result.modifiedCount === 0 && result.upsertedCount === 0) throw new Error('Error updating/creating');

    const updatedItem: Item = result.ops[0];
    // Set document id based on update or insert
    if (result.modifiedCount === 1) updatedItem._id = new ObjectId(itemId) ?? '';
    else if (result.upsertedCount === 1 && result.upsertedId !== null) updatedItem._id = result.upsertedId._id;

    // Add/Update the item to the collection
    this.items.set(updatedItem._id.toHexString(), updatedItem);

    return updatedItem;
  }

  async deleteItem(itemId: string): Promise<void> {
    const filter = { _id: new ObjectId(itemId) };
    // Delete the item
    const result = await this.itemCollection.deleteOne(filter);
    // No document matching, return error
    if (result.deletedCount === 0) throw new Error('No document matching');
    // Delete the item from the collection
    this.items.delete(itemId);
  }

  async deleteItems(): Promise<void> {
    await this.itemCollection.drop();
  }

  getItemsGroupedByRarity(): Collection<ItemRarityEnum, Item[]> {
    const items = new Collection<ItemRarityEnum, Item[]>();
    Util.getItemRarityEnumKeys().forEach((key) => {
      items.set(ItemRarityEnum[key], []);
    });
    this.items.each((value: Item) => {
      const rarity = value.rarity;
      // Get the item array from the collection
      const itemValues = items.get(rarity);
      // Add the item to the array
      itemValues?.push(value);
    });
    return items;
  }

  // Populate the items collection. Doing it here instead of in the constructor so we can use await
  async initializeItems(): Promise<void> {
    // Remove items for sanity
    this.items.clear();
    // Get the items from mongo & map it to the collection
    const itemsCursor: Cursor<Item> = this.itemCollection.find({});
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
  createMessageEmbed(item: Item, client: DbotClient, author: User, lang: string): MessageEmbed {
    // TODO: upload icon to cdn and use in thumbnail instead of in the title
    const embed = new MessageEmbed()
      .setColor(Const.EmbedColor)
      .setTitle(`${item.emojiId} ${item.name}`)
      .addFields(
        { name: i18next.t('items:type', { lng: lang }), value: item.type },
        { name: i18next.t('items:rarity', { lng: lang }), value: Const.RarityIcons.get(item.rarity) },
        { name: i18next.t('items:stats', { lng: lang }), value: client.itemService.getFormattedStats(item.stats) },
      );
    //Add id field if author is owner
    if (client.isOwner(author)) embed.addField('id', item._id.toHexString());
    return embed;
  }

  getItemsGroupedByType(itemsIds: string[], itemType: string): Collection<ItemTypeEnum, ItemWithQty[]> {
    const items = new Collection<ItemTypeEnum, ItemWithQty[]>();
    itemsIds.forEach((id) => {
      const item = this.items.get(id);
      if (item && (itemType === Const.AllType || itemType === item.type)) {
        const type = item.type;
        // Get the item array from the collection
        let itemValues = items.get(type);
        // If the array doesn't exist, create it
        if (!itemValues) {
          items.set(type, []);
          itemValues = items.get(type);
        }
        // Try to find the item in the array
        const itemFound = itemValues?.filter((itemWithQty) => itemWithQty.item._id.toHexString() === id)[0];
        // If item is not there add it, otherwise augment qty
        if (!itemFound) {
          const newItem = new ItemWithQty(item, 1);
          itemValues?.push(newItem);
        } else itemFound.qty = ++itemFound.qty;
      }
    });
    return items;
  }
}
