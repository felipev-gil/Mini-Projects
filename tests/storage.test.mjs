import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCollectionStore } from '../shared/collection-store.mjs';

test('two tabs serialize concurrent edits against the latest saved list', async () => {
  const data = new Map();
  let queue = Promise.resolve();
  const lock = (_key, run) => { const next = queue.then(run); queue = next.catch(() => {}); return next; };
  const make = () => createCollectionStore({ key: 'tasks', initial: [], normalize: value => value,
    read: key => ({ available: true, value: data.get(key) ?? null }),
    write: (key, value) => { data.set(key, value); return true; }, lock, onChange() {}, onStatus() {} });
  const a = make(), b = make();
  await Promise.all([a.update(latest => [...latest, { id: 'a' }]), b.update(latest => [...latest, { id: 'b' }])]);
  assert.deepEqual(JSON.parse(data.get('tasks')), [{ id: 'a' }, { id: 'b' }]);
  await a.update(latest => latest.filter(item => item.id !== 'a'));
  await b.update(latest => [...latest, { id: 'c' }]);
  assert.deepEqual(JSON.parse(data.get('tasks')), [{ id: 'b' }, { id: 'c' }]);
});
test('storage events synchronize deletion and clear, including another tab clearing all storage', () => {
  let raw = '[{"id":"a"}]', shown;
  const store = createCollectionStore({ key: 'tasks', initial: [], normalize: value => value,
    read: () => ({ available: true, value: raw }), write() {}, lock: (_key, fn) => fn(), onChange: value => { shown = value; }, onStatus() {} });
  store.sync('tasks'); assert.deepEqual(shown, [{ id: 'a' }]);
  raw = null; store.sync(null); assert.deepEqual(shown, []);
});
test('without locks, edits stay temporary and never overwrite another tab', async () => {
  let writes = 0, warning = '';
  const store = createCollectionStore({ key: 'tasks', initial: [], normalize: value => value,
    read: () => ({ available: true, value: '[]' }), write: () => { writes++; }, lock: null,
    onChange() {}, onStatus: message => { warning = message; } });
  assert.deepEqual(await store.update(items => [...items, { id: 'temporary' }]), [{ id: 'temporary' }]);
  assert.equal(writes, 0); assert.match(warning, /could not be saved/);
});
