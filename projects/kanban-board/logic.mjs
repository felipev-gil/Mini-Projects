export const columns = ["To do", "In progress", "Done"];
export function normalizeCards(value) {
 if (!Array.isArray(value)) return [];
 const ids = new Set();
 return value.filter(card => {
  if (!card || typeof card.id !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(card.id) || ids.has(card.id) || typeof card.text !== "string" || !card.text.trim() || !columns.includes(card.column)) return false;
  ids.add(card.id); return true;
 }).slice(0, 200).map(card => ({ id: card.id, text: card.text.trim().slice(0, 200), column: card.column }));
}

