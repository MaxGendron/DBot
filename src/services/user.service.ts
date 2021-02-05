import { Collection } from 'discord.js';
import { AggregationCursor, Collection as MongoDBCollection, Db, FilterQuery, InsertOneWriteOpResult } from 'mongodb';
import { ItemGroupedByType } from '../models/items/interface/item-grouped-by-type';
import { Item } from '../models/items/item';
import { User } from '../models/users/user';

export class UserService {
  // MongoDB collection for the user
  private userCollection: MongoDBCollection;
  // MongoDB collection for the items
  private itemCollection: MongoDBCollection;

  constructor(db: Db) {
    this.userCollection = db.collection('users');
    this.itemCollection = db.collection('items');
  }

  async getUserById(userId: string): Promise<User> {
    const filter: FilterQuery<User> = { _id: userId };
    // Find user
    let user: User | null;
    try {
      user = await this.userCollection.findOne(filter);
    } catch (error) {
      throw new Error(error.message);
    }
    //If user not found, create it
    if (!user) user = await this.createDefaultUser(userId);
    return user;
  }

  async createDefaultUser(userId: string): Promise<User> {
    const user: User = new User([], []);
    user._id = userId;
    let result: InsertOneWriteOpResult<User>;
    try {
      // Doing a try/catch here, because we have a unique index on _id
      result = await this.userCollection.insertOne(user);
    } catch (error) {
      throw new Error(error.message);
    }
    if (result.insertedCount === 0) throw new Error('Error creating user');
    return result.ops[0];
  }

  async getUserInventoryItemsGroupedByType(userId: string): Promise<Collection<string, Item[]>> {
    const items = new Collection<string, Item[]>();
    const userInventory = (await this.getUserById(userId)).inventory;
    // Get the items from mongo & map it to the collection
    const itemsCursor: AggregationCursor<ItemGroupedByType> = await this.itemCollection.aggregate([
      {
        $match: {
          _id: {
            $in: userInventory,
          },
        },
      },
      {
        $group: {
          _id: '$type',
          items: {
            $push: '$$ROOT',
          },
        },
      },
    ]);
    // Fill collection
    await itemsCursor.forEach((item) => items.set(item._id, item.items));
    return items;
  }
}
