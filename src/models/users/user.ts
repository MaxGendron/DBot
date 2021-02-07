import { Item } from '../items/item';

export class User {
  // Discord id
  _id!: string;

  // Inventory of the user, list of item ids
  inventory: string[];

  // Equiped items
  equipped_items: Item[];

  constructor(inventory: string[], equipped_items: Item[]) {
    this.inventory = inventory;
    this.equipped_items = equipped_items;
  }
}
