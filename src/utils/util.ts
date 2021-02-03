import { DMChannel, NewsChannel, TextChannel, User } from 'discord.js';
import { ItemStats } from './../models/items/item-stats';
const yes = ['yes', 'y', 'oui'];
const no = ['no', 'n', 'non'];

export class Util {
  static getFormattedStats(itemStats: ItemStats[]): string {
    const stats: string[] = [];
    itemStats.forEach(stat => {
      stats.push(`${stat.type}: ${stat.value}`);
    });
    return stats.join('\n');
  }

  // Verify the user response at a yes/no question. Return false if the user didn't respond
  static async verifyUserReponse(channel: TextChannel | DMChannel | NewsChannel, user: User, time = 30000): Promise<boolean> {
    // Wait for the user input
		const responses = await channel.awaitMessages(msg => msg.author.id === user.id, {
			max: 1,
			time,
    });

    // Check if the user responded
    if (responses && responses.size === 1) {
      const choice = responses.first()?.content.toLowerCase() || 'n';
      if (yes.includes(choice)) return true;
      if (no.includes(choice)) return false;
    };

		return false;
	}
}