export type MapKeyType<TMap> = TMap extends Map<infer V, any> ? V : never;
export type MapValueType<TMap> = TMap extends Map<any, infer V> ? V : never;

export type ObjectKeyType<TObj> = TObj extends Record<infer V, any> ? V : never;
export type ObjectValueType<TObj> = TObj extends Record<any, infer V>
  ? V
  : never;

export class Dictionary {
  static toMap<TKey extends PropertyKey, TValue>(obj: { [x in TKey]: TValue }) {
    return new Map(Object.entries(obj)) as Map<TKey, TValue>;
  }
  static reverseMap<TKey, TValue>(map: Map<TKey, TValue>): Map<TValue, TKey> {
    return new Map([...map].map(([k, v]) => [v, k]));
  }
  static toObject<TKey extends PropertyKey, TValue>(map: Map<TKey, TValue>) {
    return Object.fromEntries(map) as { [x in TKey]: TValue };
  }
  static reverseObject<
    TKey extends PropertyKey,
    TValue extends PropertyKey,
  >(obj: {
    [x in TKey]: TValue;
  }) {
    return Object.fromEntries(Object.entries(obj).map((a) => a.reverse())) as {
      [x in TValue]: TKey;
    };
  }
}
