import { DbotClient } from '../../dbot-client';
import { CommandoMessage } from 'discord.js-commando';
import { DbotCommand } from '../../dbot-command';
import i18next from 'i18next';
import { Message } from 'discord.js';
import { Const } from '../../utils/const';

module.exports = class LangCommand extends DbotCommand {
  constructor(client: DbotClient) {
    super(client, {
      name: 'lang',
      group: 'utility',
      memberName: 'lang',
      description: i18next.t('utility:lang.description'),
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'lang',
          prompt: i18next.t('utility:lang.args.lang', { langs: Const.Langs.join(', ') }),
          type: 'string',
          oneOf: Const.Langs,
        },
      ],
    });
  }

  async run(message: CommandoMessage, { lang }): Promise<Message> {
    // set the current lang
    try {
      await this.client.provider.set(message.guild, 'lang', lang);
    } catch (error) {
      const lng: string = this.client.provider.get(message.guild, 'lang', 'en');
      const unexpectedMessage = i18next.t('error.unexpected', { lng: lng });
      return message.reply(unexpectedMessage);
    }
    return message.say(i18next.t('utility:lang.returnMessage', { currentLang: lang, lng: lang }));
  }
};
