import { ItemRarityEnum } from './enum/item-rarity.enum';
import { ItemTypeEnum } from './enum/item-type.enum';
import { ItemStats } from './item-stats';

export class Item {
  // Mongo id
  _id!: string;
  // Name of the item
  name: string;
  // Id of the emoji used for this item icon
  iconId: string;
  // List of stats for the item
  stats: ItemStats[];
  // Type of the item
  type: ItemTypeEnum;
  // Rarity of the item
  rarity: ItemRarityEnum;

  constructor(name: string, iconId: string, stats: ItemStats[], type: ItemTypeEnum, rarity: ItemRarityEnum) {
    this.name = name;
    this.iconId = iconId;
    this.stats = stats;
    this.type = type;
    this.rarity = rarity;
  }
}
