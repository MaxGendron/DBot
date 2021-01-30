import { ItemStatsTypeEnum } from '../enum/item-stats-type.enum';

export interface ItemStats {
  type: ItemStatsTypeEnum;
  // Value of the stats
  value: number;
}
