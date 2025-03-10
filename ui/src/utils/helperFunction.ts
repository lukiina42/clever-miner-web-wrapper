export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const numberToDecimalPlaces = (num: number, decimalPlaces: number) => {
  const roundBy = Math.pow(10, decimalPlaces);
  return (Math.round(num * roundBy) / roundBy).toFixed(decimalPlaces);
};
