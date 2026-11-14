// Storage is optional: apps must remain usable when the browser blocks it.
export function readStored(key) {
  try { return { value: localStorage.getItem(key), available: true }; }
  catch { return { value: null, available: false }; }
}

export function writeStored(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch { return false; }
}
