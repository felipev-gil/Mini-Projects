export const MAX_AMOUNT = 999999999;
export const CURRENCIES = [
  ["USD", "US Dollar"], ["EUR", "Euro"], ["GBP", "British Pound"],
  ["COP", "Colombian Peso"], ["JPY", "Japanese Yen"], ["CAD", "Canadian Dollar"],
  ["AUD", "Australian Dollar"], ["CHF", "Swiss Franc"], ["MXN", "Mexican Peso"], ["BRL", "Brazilian Real"],
];

export function parseAmount(raw) {
  const value = Number(raw);
  if (String(raw).trim() === "" || !Number.isFinite(value) || value < 0 || value > MAX_AMOUNT) {
    throw new Error("Enter an amount from 0 to 999,999,999.");
  }
  return value;
}

export function readRate(data, from, to) {
  const rate = data?.rates?.[to];
  if (data?.result !== "success" || data.base_code !== from || typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    throw new Error("The rate provider returned an unavailable rate. Please try again later.");
  }
  return rate;
}
