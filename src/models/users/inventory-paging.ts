import { Collection } from 'discord.js';
import { Const } from '../../utils/const';
import { ItemWithQty } from '../items/item-with-qty';

export class InventoryPaging {
  inventoryItems: Collection<string, ItemWithQty[]>;
  startIndex = Const.DefaultPagingIndex;
  itemsCount: number;
  currentPage = 1;

  constructor(inventoryItems: Collection<string, ItemWithQty[]>, itemsCount: number) {
    this.inventoryItems = inventoryItems;
    this.itemsCount = itemsCount;
  }
}
