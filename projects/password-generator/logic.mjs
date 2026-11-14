export const CHARACTER_GROUPS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/",
};

export function randomIndex(max, random = globalThis.crypto) {
  if (!Number.isInteger(max) || max < 1 || max > 4294967296) throw new Error("Invalid random range.");
  if (!random?.getRandomValues) throw new Error("Secure randomness is unavailable in this browser.");
  const limit = Math.floor(4294967296 / max) * max;
  const buffer = new Uint32Array(1);
  do { random.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % max;
}

export function generatePassword(length, selectedGroups, random = globalThis.crypto) {
  if (!Number.isInteger(length) || length < 8 || length > 44) throw new Error("Choose a length from 8 to 44.");
  if (!selectedGroups.length || new Set(selectedGroups).size !== selectedGroups.length || selectedGroups.some((name) => !Object.hasOwn(CHARACTER_GROUPS, name))) throw new Error("Select at least one valid character group.");
  const groups = selectedGroups.map((name) => CHARACTER_GROUPS[name]);
  const pool = groups.join("");
  // Rejection sampling gives every valid password equal probability and guarantees
  // every selected group is represented, without a predictable character order.
  let password;
  do {
    password = Array.from({ length }, () => pool[randomIndex(pool.length, random)]).join("");
  } while (!groups.every((group) => [...password].some((character) => group.includes(character))));
  return password;
}

export function estimateStrength(password) {
  const poolSize = Object.values(CHARACTER_GROUPS).filter((group) => [...password].some((character) => group.includes(character))).reduce((sum, group) => sum + group.length, 0);
  const estimate = password.length * Math.log2(poolSize || 1);
  const score = Math.min(100, Math.round(estimate));
  return { score, label: password.length < 12 || score < 45 ? "Limited" : score < 75 ? "Moderate" : "Strong" };
}

