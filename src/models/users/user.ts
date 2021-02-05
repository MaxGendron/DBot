import { ObjectId } from 'mongodb';
import { Item } from '../items/item';

export class User {
  // Discord id
  _id!: string;

  // Inventory of the user, list of item ids
  inventory: ObjectId[];

  // Equiped items
  equipped_items: Item[];

  constructor(inventory: ObjectId[], equipped_items: Item[]) {
    this.inventory = inventory;
    this.equipped_items = equipped_items;
  }
}
