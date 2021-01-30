import { CustomLogger } from './utils/custom-logger';
import { CommandoClient, CommandoClientOptions } from 'discord.js-commando';
import { Db, MongoClient } from 'mongodb';

export class DbotClient extends CommandoClient {
  public mongoClient: MongoClient = new MongoClient(process.env.MONGODB_STRING || '', {
    useUnifiedTopology: true,
  });
  public db!: Db;

  public logger: CustomLogger;

  constructor(options: CommandoClientOptions) {
    super(options);

    this.logger = new CustomLogger();
  }

  // Initialize the mongoClient & related stuff, use at startup
  async initializeMongoClient(): Promise<void> {
    await this.mongoClient.connect();
    await this.mongoClient.db('admin').command({ ping: 1 });
    this.logger.logInfo('Successfully connected to mongodb 🎈🎈🎈');
    this.db = this.mongoClient.db(process.env.MONGO_DBNAME);
  }

  async destroy(): Promise<void> {
    await super.destroy();
		if(this.mongoClient) {
      await this.mongoClient.close();
    };
  }
}