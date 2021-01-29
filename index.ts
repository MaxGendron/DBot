import { CustomLogger } from './src/utils/logger';
import path = require('path');
import { CommandoClient } from "discord.js-commando";
import dotenv = require('dotenv');

// Env config
dotenv.config();

//Logger
const logger = new CustomLogger();

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
    recursive   : true
  });

client.once('ready', () => {
  logger.logInfo(`Logged in as ${client.user?.tag}! (${client.user?.id})`);
  logger.logInfo('Ready & up and running! 🚀🚀🚀');
});

client.on('warn', (m) => logger.logWarn(m));
client.on('error', (m) => logger.logError(m));

client.login(process.env.TOKEN);
