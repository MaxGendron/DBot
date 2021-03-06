import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message } from 'discord.js';
import { Util } from '../../utils/util';

module.exports = class DeleteItemsCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'delete-items',
      group: 'items',
      memberName: 'delete-items',
      description: i18next.t('items:deleteItems.description'),
      ownerOnly: true,
    });
  }

  async run(message: CommandoMessage): Promise<Message> {
    const lang: string = this.client.provider.get(message.guild, 'lang', 'en');
    // Make the the user wants to
    let replyMessage = i18next.t('reply.youSure', { lng: lang });
    await message.reply(replyMessage);
    // Get the user response
    const userResponse = await Util.verifyUserReponse(message.channel, message.author);

    if (userResponse) {
      //Delete all the items
      try {
        await this.client.itemService.deleteItems();
      } catch (error) {
        this.client.logger.logError(error.message);
        replyMessage = i18next.t('error.unexpected', { lng: lang });
        return message.reply(replyMessage);
      }
      return message.say(i18next.t('items:deleteItems.returnMessage', { lng: lang }));
    } else {
      // User said no or didn't respond, return
      replyMessage = i18next.t('reply.cancelledCommand', { lng: lang });
      return message.reply(replyMessage);
    }
  }
};
