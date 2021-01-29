const logger = require('./src/utils/logger');
const { CommandoClient } = require('discord.js-commando');
const path = require('path');

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
  .registerCommandsIn(path.join(__dirname, 'src/commands'));

client.once('ready', () => {
  logger.log('info', `Logged in as ${client.user.tag}! (${client.user.id})`);
  logger.log('info', 'Ready & up and running! 🚀🚀🚀');
});

client.on('warn', (m) => logger.log('warn', m));
client.on('error', (m) => logger.log('error', m));
process.on('uncaughtException', (error) => logger.log('error', `uncaughtException: ${error}`));

client.login(process.env.TOKEN);
