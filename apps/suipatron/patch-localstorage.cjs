/**
 * Patches Node's broken localStorage (--localstorage-file with invalid path).
 * Loaded via node -r before Next.js starts. Cursor injects --localstorage-file
 * when running commands; this fixes the broken polyfill.
 */
const mem = new Map();
const storage = {
  getItem: (k) => mem.get(k) ?? null,
  setItem: (k, v) => mem.set(k, v),
  removeItem: (k) => mem.delete(k),
  key: () => null,
  get length() {
    return mem.size;
  },
  clear: () => mem.clear(),
};

if (
  typeof globalThis !== "undefined" &&
  (!globalThis.localStorage ||
    typeof globalThis.localStorage.getItem !== "function")
) {
  globalThis.localStorage = storage;
}
