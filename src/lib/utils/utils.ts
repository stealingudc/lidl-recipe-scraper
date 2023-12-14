export const getRandomValue = <T extends Object>(obj: T) => {
  const keys = Object.keys(obj);
  return obj[keys[Math.floor(Math.random() * keys.length)]] as T[keyof T];
};
