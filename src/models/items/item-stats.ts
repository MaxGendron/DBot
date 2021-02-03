import { jsonMember, jsonObject } from 'typedjson';
import { ItemStatsTypeEnum } from './enum/item-stats-type.enum';

@jsonObject
export class ItemStats {
  // Type of the stats
  @jsonMember
  type: ItemStatsTypeEnum;
  
  // Value of the stats
  @jsonMember
  value: number;

  constructor(type: ItemStatsTypeEnum, value: number) {
    this.type = type;
    this.value = value;
  }
}
