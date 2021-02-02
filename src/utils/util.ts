import { ItemStats } from './../models/items/item-stats';

export class Util {
  static getFormattedStats(itemStats: ItemStats[]): string {
    const stats: string[] = [];
    itemStats.forEach(stat => {
      stats.push(`${stat.type}: ${stat.value}`);
    });
    return stats.join('\n');
  }
}