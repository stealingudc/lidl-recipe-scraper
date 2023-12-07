import { Dictionary, MapKeyType, MapValueType } from 'src/lib/utils/dictionary';

export type Filter = 'course' | 'region';

export type FilterObjectUnion = typeof courses | typeof regions;
export type FilterObjectDiscrimination = typeof courses & typeof regions;

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
