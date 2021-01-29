const logger = require('./src/utils/logger');
const path = require('path');
import { CommandoClient } from "discord.js-commando";

// Env variable
const dotenv = require('dotenv');
dotenv.config();

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
  console.log(path.join(__dirname, 'src/commands'))
  logger.log('info', `Logged in as ${client.user?.tag}! (${client.user?.id})`);
  logger.log('info', 'Ready & up and running! 🚀🚀🚀');
});

client.on('warn', (m: any) => logger.log('warn', m));
client.on('error', (m: any) => logger.log('error', m));

client.login(process.env.TOKEN);
