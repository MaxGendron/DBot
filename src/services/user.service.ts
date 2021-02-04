import { Collection as MongoDBCollection, Db, FilterQuery, InsertOneWriteOpResult } from 'mongodb';
import { User } from '../models/users/user';

export class UserService {
  // MongoDB collection for the user
  private userCollection: MongoDBCollection;

  constructor(db: Db) {
    this.userCollection = db.collection('users');
  }

  async getUserById(id: string): Promise<User> {
    const filter: FilterQuery<User> = { _id: id };
    // Find user
    let user: User | null;
    try {
      user = await this.userCollection.findOne(filter);
    } catch (error) {
      throw new Error(error.message);
    }
    //If user not found, create it
    if (!user) user = await this.createDefaultUser(id);
    return user;
  }

  async createDefaultUser(id: string): Promise<User> {
    const user: User = new User([], []);
    user._id = id;
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
}
