import { Collection } from 'discord.js';
import * as mongodb from 'mongodb';
import { Item } from '../models/items/interface/item';

export class ItemService {
  // MongoDB collection for the items
  private itemCollection: mongodb.Collection;
  // Items collection to not go to mongo each time
  // TODO: put this in redis
  public items: Collection<string, Item>;

  constructor(db: mongodb.Db) {
    this.itemCollection = db.collection('items');
    this.items = new Collection<string, Item>();
  }

  async getItemById(itemId: string): Promise<Item | null> {
    const item: Item | null = await this.itemCollection.findOne({ _id: new mongodb.ObjectId(itemId) });
    return item;
  }

  async getItems(): Promise<Collection<string, Item>> {
    return this.items;
  }

  async initializeItems(): Promise<void> {
    // If no items, populate it. Doing it here instead of in the constructor so we can use await
    if (this.items.size === 0) {
      const itemsCursor: mongodb.Cursor<Item> = await this.itemCollection.find({});
      await itemsCursor.forEach((item) => {
        this.items.set(item._id, item);
      });
    }
  }
}
