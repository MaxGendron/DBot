import { Item } from '../item';
import { ItemTypeEnum } from './../enum/item-type.enum';

export interface ItemGroupedByType {
  _id: ItemTypeEnum;
  items: Item[]
}