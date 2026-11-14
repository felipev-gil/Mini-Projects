export function validQRText(text) { const size = new TextEncoder().encode(text).length; return Boolean(text.trim()) && size <= 250; }

