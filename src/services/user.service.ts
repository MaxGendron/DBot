import { Collection as MongoDBCollection, Db, FilterQuery, InsertOneWriteOpResult, UpdateQuery } from 'mongodb';
import { Item } from '../models/items/item';
import { User } from '../models/users/user';

export class UserService {
  // MongoDB collection for the user
  private userCollection: MongoDBCollection;

  constructor(db: Db) {
    this.userCollection = db.collection('users');
  }

  async getUserById(userId: string): Promise<User> {
    const filter: FilterQuery<User> = { _id: userId };
    // Find user
    let user: User | null;
    try {
      user = await this.userCollection.findOne(filter);
      //If user not found, create it
      if (!user) user = await this.createDefaultUser(userId);
    } catch (error) {
      throw new Error(error.message);
    }
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

  async addItemsToUserInventory(items: Item[], userId: string): Promise<void> {
    const itemIds = items.map((item) => item._id.toHexString());
    const filter: FilterQuery<User> = { _id: userId };
    const updateQuery: UpdateQuery<User> = {
      $push: {
        inventory: {
          $each: itemIds,
        },
      },
    };
    try {
      await this.userCollection.updateOne(filter, updateQuery);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
