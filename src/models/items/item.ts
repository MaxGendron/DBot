import { ObjectId } from 'mongodb';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import { ItemRarityEnum } from './enum/item-rarity.enum';
import { ItemTypeEnum } from './enum/item-type.enum';
import { ItemStats } from './item-stats';

@jsonObject
export class Item {
  // Mongo id
  @jsonMember
  _id!: ObjectId;

  // Name of the item
  @jsonMember
  name: string;

  // Id of the emoji used for this item icon
  @jsonMember
  emojiId: string;

  // List of stats for the item
  @jsonArrayMember(ItemStats)
  stats: ItemStats[];

  // Type of the item
  @jsonMember
  type: ItemTypeEnum;

  // Rarity of the item
  @jsonMember
  rarity: ItemRarityEnum;

  constructor(name: string, emojiId: string, stats: ItemStats[], type: ItemTypeEnum, rarity: ItemRarityEnum) {
    this.name = name;
    this.emojiId = emojiId;
    this.stats = stats;
    this.type = type;
    this.rarity = rarity;
  }
}
