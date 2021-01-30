import { Command, CommandInfo } from 'discord.js-commando';
import { DbotClient } from './dbot-client';

export abstract class DbotCommand extends Command {
  public client!: DbotClient;

  constructor(client: DbotClient, info: CommandInfo) {
    super(client, info);
  }
}
