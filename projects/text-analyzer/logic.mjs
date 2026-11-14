export function analyzeText(text) {
  const words = typeof Intl.Segmenter === "function"
    ? [...new Intl.Segmenter("en", { granularity: "word" }).segment(text)].filter(part => part.isWordLike).length
    : text.trim().split(/\s+/u).filter(Boolean).length;
  return { words, characters: [...text].length, letters: (text.match(/\p{L}/gu) || []).length, whitespace: (text.match(/\s/gu) || []).length };
}
export function changeCase(text, mode) {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  return text.toLowerCase().replace(/(^|[.!?]\s+)(\p{L})/gu, (_, prefix, letter) => prefix + letter.toUpperCase());
}

