import { CustomLogger } from './src/utils/custom-logger';
import path = require('path');
import { CommandoClient } from 'discord.js-commando';
import dotenv = require('dotenv');
import i18next, { InitOptions } from 'i18next';
import Backend from 'i18next-fs-backend';

// Env config
dotenv.config();

// Logger
const logger = new CustomLogger();

// i18n
const langs = ['en', 'fr'];
const i18nextOptions: InitOptions = {
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: langs,
  preload: langs,
  ns: ['global'],
  defaultNS: 'global',
  backend: {
    loadPath: 'locales/{{lng}}/{{ns}}.json',
  },
};
i18next.use(Backend).init(i18nextOptions);

// Client
const client = new CommandoClient({
  commandPrefix: process.env.PREFIX,
  owner: process.env.OWNER_ID,
});

client.registry
  .registerDefaultTypes()
  .registerGroups([['first', '**FIRST**:']])
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
  logger.logInfo(`Logged in as ${client.user?.tag}! (${client.user?.id})`);
  logger.logInfo('Ready & up and running! 🚀🚀🚀');
});

client.on('warn', (m) => logger.logWarn(m));
client.on('error', (m) => logger.logError(m));

client.login(process.env.TOKEN);
