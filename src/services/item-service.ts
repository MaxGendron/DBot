import { Collection } from 'discord.js';
import * as mongodb from 'mongodb';
import { Item } from '../models/items/interface/item';

export class ItemService {
  // MongoDB collection for the items
  private itemCollection: mongodb.Collection;
  // Items collection to not go to mongo each time (items doesn't change)
  // TODO: put this in redis
  public items: Collection<string, Item>;

  constructor(db: mongodb.Db) {
    this.itemCollection = db.collection('items');
    this.items = new Collection<string, Item>();
    //this.itemCollection.
  }

  async getItemById(itemId: string): Promise<Item | undefined> {
    return this.items.get(itemId);
  }

  async getItems(): Promise<Collection<string, Item>> {
    return this.items;
  }

  // Populate the items collection. Doing it here instead of in the constructor so we can use await
  async initializeItems(): Promise<void> {
    // Remove items for sanity
    this.items.clear();
    // Get the items from mongo & map it to the collection
    const itemsCursor: mongodb.Cursor<Item> = await this.itemCollection.find({});
    await itemsCursor.forEach((item) => {
      this.items.set(item._id, item);
    });
  }
}
