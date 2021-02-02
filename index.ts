import { DbotClient } from './src/dbot-client';
import path = require('path');
import dotenv = require('dotenv');
import i18next, { InitOptions } from 'i18next';
import Backend from 'i18next-fs-backend';
import { MongoDBProvider } from 'commando-provider-mongo';

// Env config
dotenv.config();

(async (): Promise<void> => {
  // i18n
  const langs = ['en', 'fr'];
  const i18nextOptions: InitOptions = {
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: langs,
    preload: langs,
    ns: ['global', 'items'],
    defaultNS: 'global',
    backend: {
      loadPath: 'src/locales/{{lng}}/{{ns}}.json',
    },
  };
  await i18next.use(Backend).init(i18nextOptions);

  // Client
  const client = new DbotClient({
    commandPrefix: process.env.PREFIX,
    owner: process.env.OWNER_ID,
  });

  // MongoDb
  await client.initialize();
  client.setProvider(new MongoDBProvider(client.mongoClient, process.env.MONGO_DBNAME || ''));

  // Register the client here so the i18next is loaded
  client.registry
    .registerDefaultTypes()
    .registerGroups([
      ['util-owner', 'Utility (Owner)'],
      ['items', 'Items'],
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
      ping: false,
      prefix: false,
      eval: false,
    })
    .registerCommandsIn({
      dirname: path.join(__dirname, 'src/commands'),
      filter: /.*ts/,
      recursive: true,
    });

  client.once('ready', () => {
    client.logger.logInfo(`Logged in as ${client.user?.tag}! (${client.user?.id})`);
    client.logger.logInfo('Ready & up and running! 🚀🚀🚀');
  });

  //client.on('debug', (m) => client.logger.logInfo(m));
  client.on('warn', (m) => client.logger.logWarn(m));
  client.on('error', (m) => client.logger.logError(m));

  client.login(process.env.TOKEN);
})();
