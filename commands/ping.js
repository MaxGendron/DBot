const logger = require('../utils/logger');

module.exports = {
  name: 'ping',
  description: 'Ping!',
  execute(message, args) {
    if (args) {
      logger.log('info', args);
    }
    message.channel.send('Pong.');
  },
};
