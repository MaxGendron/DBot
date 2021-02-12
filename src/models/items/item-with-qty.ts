import { Item } from './item';

export class ItemWithQty {
  item: Item;
  qty: number;

  constructor(item: Item, qty: number) {
    this.item = item;
    this.qty = qty;
  }
}
