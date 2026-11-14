// Serialize read-modify-write operations across tabs; never overwrite from a stale UI snapshot.
export function createCollectionStore({ key, initial, normalize, read, write, lock, onChange, onStatus }) {
  let current = initial, firstWrite = true, temporary = false;
  let queue = Promise.resolve();
  function update(change) {
    const commit = () => {
      const stored = read(key);
      let latest = current;
      if (!temporary && stored.available && lock) {
        if (stored.value !== null) {
          try { latest = normalize(JSON.parse(stored.value)); }
          catch { if (!firstWrite) throw new Error('Saved tasks changed and could not be read. Reload before editing.'); }
        } else latest = firstWrite ? current : [];
      }
      current = change(latest);
      firstWrite = false;
      const saved = !temporary && Boolean(lock) && stored.available && write(key, JSON.stringify(current));
      if (!saved) temporary = true;
      onChange(current);
      onStatus(saved ? '' : 'Storage is unavailable or safe multi-tab saving is unsupported; changes could not be saved and last only for this visit.');
      return current;
    };
    const run = () => lock ? lock(key, commit) : commit();
    const result = queue.then(run);
    queue = result.catch(() => {});
    return result;
  }
  function sync(eventKey) {
    if (eventKey !== key && eventKey !== null) return;
    if (temporary) { onStatus('Another tab changed saved tasks. This tab has unsaved changes; copy them before reloading.'); return; }
    const stored = read(key);
    if (!stored.available) return;
    try {
      current = stored.value === null ? [] : normalize(JSON.parse(stored.value));
      firstWrite = false;
      onChange(current);
      onStatus('Tasks updated from another tab.');
    } catch { onStatus('Saved tasks changed and could not be read. Reload before editing.'); }
  }
  return { update, sync };
}
