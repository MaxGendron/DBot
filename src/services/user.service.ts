import {
  BulkWriteOperation,
  Collection as MongoDBCollection,
  Db,
  FilterQuery,
  InsertOneWriteOpResult,
  UpdateQuery,
} from 'mongodb';
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

  async equipItem(item: Item, userId: string): Promise<void> {
    const filter: FilterQuery<User> = { _id: userId };
    const updateQuery: UpdateQuery<User> = {
      $push: {
        equipped_items: item,
      },
    };
    try {
      await this.userCollection.updateOne(filter, updateQuery);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Remove the item from the equipped_items of the user AND
  // add it back to the inventory
  async unequipItem(item: Item, userId: string): Promise<void> {
    const filter: FilterQuery<User> = { _id: userId };
    const unequipItemOperation: BulkWriteOperation<User> = {
      updateOne: {
        filter: filter,
        update: {
          $pull: { equipped_items: item },
        },
      },
    };
    const addItemToInventoryOperation: BulkWriteOperation<User> = {
      updateOne: {
        filter: filter,
        update: {
          $push: { inventory: item._id.toHexString() },
        },
      },
    };

    try {
      await this.userCollection.bulkWrite([unequipItemOperation, addItemToInventoryOperation]);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async removeItemFromUserInventory(itemId: string, userId: string): Promise<void> {
    // Update the matching itemId to null
    const firstOperation: BulkWriteOperation<User> = {
      updateOne: {
        filter: { _id: userId, inventory: itemId },
        update: {
          $unset: { 'inventory.$': '' },
        },
      },
    };
    // Delete the itemId which is null (that we juste setted before)
    const secondOperation: BulkWriteOperation<User> = {
      updateOne: {
        filter: { _id: userId, inventory: undefined },
        update: {
          $pull: { inventory: undefined },
        },
      },
    };

    try {
      await this.userCollection.bulkWrite([firstOperation, secondOperation]);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
