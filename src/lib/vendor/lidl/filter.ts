import { Dictionary, MapKeyType, MapValueType } from 'src/lib/utils/dictionary';

export type FilterObjectUnion =
  | typeof courses
  | typeof regions
  | typeof food_types
  | typeof diet
  | typeof collection
  | typeof difficulty;
export type FilterObjectDiscrimination = typeof courses &
  typeof regions &
  typeof food_types &
  typeof diet &
  typeof collection &
  typeof difficulty;

export const courses = {
  1605: 'appetizers',
  1602: 'breakfast',
  1604: 'brunch',
  1600: 'main',
  8415: 'garnishes',
  1601: 'desserts',
  1606: 'drinks',
} as const;

export const regions = {
  19794: 'romanian',
  1661: 'american',
  1655: 'asian',
  1662: 'french',
  1657: 'greek',
  6362: 'italian',
  1658: 'iberian',
  1659: 'mexican',
} as const;

export const food_types = {
  6361: 'soups',
  1627: 'salads',
  1619: 'pasta',
  1615: 'fish',
  1620: 'seafood',
  1626: 'pizza',
  1642: 'salty-pastry',
  1643: 'sweet-pastry',
  7746: 'sweets',
  1635: 'cakes',
  7749: 'biscuits',
  28767: 'sweet-breads',
  21330: 'jam',
} as const;

export const diet = {
  12549: 'bio',
  1608: 'vegetarian',
  1609: 'vegan',
  28821: 'fasting',
  1613: 'healthy',
} as const;

export const collection = {
  75807: 'quick',
  56763: 'guilt-free',
  9473: 'special-occasion',
  12532: 'valentines-day',
  1591: 'easter',
  12534: 'halloween',
  1588: 'christmas',
} as const;

export const difficulty = {
  0: 'easy',
  1: 'medium',
  2: 'hard',
} as const;

export const filterAccessors = [
  'course',
  'region',
  'food_type',
  'diet',
  'collection',
  'difficulty',
] as const;

export const filters = [
  courses,
  regions,
  food_types,
  diet,
  collection,
  difficulty,
] as const;

export type Filter = (typeof filterAccessors)[number];
export interface IFilter {
  course?: Set<MapValueType<typeof courses>>;
  region?: Set<MapValueType<typeof regions>>;
  food_type?: Set<MapValueType<typeof food_types>>;
  diet?: Set<MapValueType<typeof diet>>;
  collection?: Set<MapValueType<typeof collection>>;
  difficulty?: Set<MapValueType<typeof difficulty>>;
}
