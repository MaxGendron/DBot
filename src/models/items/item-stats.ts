import { ItemStatsTypeEnum } from './enum/item-stats-type.enum';

export class ItemStats {
  type: ItemStatsTypeEnum;
  // Value of the stats
  value: number;

  constructor(type: ItemStatsTypeEnum, value: number) {
    this.type = type;
    this.value = value;
  }
}
