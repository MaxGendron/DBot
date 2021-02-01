import { Collection } from 'discord.js';
import { Collection as MongoDBCollection, Cursor, Db, ObjectId } from 'mongodb';
import { Item } from '../models/items/item';

export class ItemService {
  // MongoDB collection for the items
  private itemCollection: MongoDBCollection;
  // Items collection to not go to mongo each time (items doesn't change)
  // TODO: put this in redis
  public items: Collection<string, Item>;

  constructor(db: Db) {
    this.itemCollection = db.collection('items');
    this.items = new Collection<string, Item>();
    //this.itemCollection.
  }

  async getItemById(itemId: string): Promise<Item | undefined> {
    return this.items.get(itemId);
  }

  async getItemByName(name: string): Promise<Item | undefined> {
    return this.items.find((item) => item.name === name);
  }

  async createOrUpdateItem(item: Item, itemId?: string): Promise<Item> {
    const filter = {
      _id: new ObjectId(itemId),
    };
    const options = {
      upsert: true,
    };
    // Insert or update into mongo
    const result = await this.itemCollection.replaceOne(filter, item, options);
    // No document matching, return error
    if (result.matchedCount === 0) {
      throw new Error('No document matching');
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
      this.items.set(item._id, item);
    });
  }
}
