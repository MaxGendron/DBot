import { ItemService } from './services/item-service';
import { CustomLogger } from './utils/custom-logger';
import { CommandoClient, CommandoClientOptions } from 'discord.js-commando';
import { Db, MongoClient } from 'mongodb';

export class DbotClient extends CommandoClient {
  // Mongo
  public mongoClient: MongoClient = new MongoClient(process.env.MONGODB_STRING || '', {
    useUnifiedTopology: true,
  });
  public db!: Db;

  // Logger
  public logger: CustomLogger;

  // Services
  public itemService!: ItemService;

  constructor(options: CommandoClientOptions) {
    super(options);

    this.logger = new CustomLogger();
  }

  // Initialize the mongoClient & services, use at startup
  async initialize(): Promise<void> {
    await this.mongoClient.connect();
    await this.mongoClient.db('admin').command({ ping: 1 });
    this.logger.logInfo('Successfully connected to mongodb 🎈🎈🎈');
    const db = this.mongoClient.db(process.env.MONGO_DBNAME);
    this.db = db;

    // Services
    this.itemService = new ItemService(db);
    // Populate items
    await this.itemService.initializeItems();
  }

  async destroy(): Promise<void> {
    await super.destroy();
    if (this.mongoClient) await this.mongoClient.close();
  }
}
