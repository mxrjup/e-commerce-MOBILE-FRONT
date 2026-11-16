export const searchHistoryKey = 'catalog.search-history.v1';
export type HistoryStorage = { read: () => Promise<string | null>; write: (value: string) => Promise<void> };

export function normalizeHistory(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  return values.filter((value): value is string => typeof value === 'string').map(value => value.trim())
    .filter(value => {
      const key = value.toLocaleLowerCase('fr');
      if (!value || value.length > 150 || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10);
}

export function createSearchHistory(storage: HistoryStorage) {
  // Serialize reads and writes, including hydration, to avoid lost additions/deletions.
  let queue: Promise<unknown> = Promise.resolve();
  async function read() {
    const raw = await storage.read();
    try { return normalizeHistory(JSON.parse(raw ?? '[]')); } catch { return []; }
  }
  function run(operation: () => Promise<string[]>) {
    const next = queue.then(operation);
    queue = next.catch(() => {});
    return next;
  }
  return {
    read: () => run(read),
    add: (query: string) => run(async () => {
      const items = normalizeHistory([query, ...await read()]);
      await storage.write(JSON.stringify(items));
      return items;
    }),
    remove: (query: string) => run(async () => {
      const items = (await read()).filter(item => item.toLocaleLowerCase('fr') !== query.toLocaleLowerCase('fr'));
      await storage.write(JSON.stringify(items));
      return items;
    }),
  };
}
