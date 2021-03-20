import { ItemRarityEnum } from './../models/items/enum/item-rarity.enum';
import { Collection } from 'discord.js';
import { ItemStatsTypeEnum } from '../models/items/enum/item-stats-type.enum';

export class Const {
  public static readonly EmbedColor = '#bd3c00';
  public static readonly AllType = 'all';
  public static readonly DefaultPagingIndex = 0;
  public static readonly DefaultPagingRange = 10;
  public static readonly Langs = ['en', 'fr'];
  public static readonly ItemRarityIcons = new Collection<ItemRarityEnum, string>([
    [ItemRarityEnum.Common, '<:Common:819793130463035432>'],
    [ItemRarityEnum.Rare, '<:Rare:820124712431910933>'],
    [ItemRarityEnum.Epic, '<:Epic:820125130721460246>'],
    [ItemRarityEnum.Legendary, '<:Legendary:820126494864310272>'],
  ]);
  public static readonly ItemStatsTypeIcons = new Collection<ItemStatsTypeEnum, string>([
    [ItemStatsTypeEnum.Attack, '<:Attack:822919374364082268>'],
  ]);
}
