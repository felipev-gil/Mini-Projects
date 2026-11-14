export function passwordChecks(value) {
  return [
    [...value].length >= 12,
    /\p{L}/u.test(value),
    /[0-9]/.test(value),
    /\p{Lu}/u.test(value),
    /[\p{P}\p{S}]/u.test(value),
  ];
}

