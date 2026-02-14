/**
 * Safe storage: use localStorage when it works, else in-memory.
 * Avoids Node's --localstorage-file polyfill which can have broken getItem.
 */
const memStore = new Map<string, string>();

type StorageAdapter = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
};

function memAdapter(): StorageAdapter {
  return {
    getItem: (k) => memStore.get(k) ?? null,
    setItem: (k, v) => {
      memStore.set(k, v);
    },
    removeItem: (k) => {
      memStore.delete(k);
    },
  };
}

function createStorage(): StorageAdapter {
  // Never use localStorage in Node (SSR, or broken --localstorage-file polyfill)
  if (typeof window === "undefined") return memAdapter();
  const isNode =
    typeof process !== "undefined" &&
    process.versions != null &&
    typeof process.versions.node === "string";
  if (isNode) return memAdapter();

  try {
    const s = window.localStorage;
    if (
      !s ||
      typeof s.getItem !== "function" ||
      typeof s.setItem !== "function"
    )
      return memAdapter();
    s.getItem("_"); // Prove callable (polyfill can expose non-callable getItem)
    return {
      getItem: (k) => s.getItem(k),
      setItem: (k, v) => s.setItem(k, v),
      removeItem: (k) => s.removeItem(k),
    };
  } catch {
    return memAdapter();
  }
}

const _storage = createStorage();
export const getStorage = () => _storage;
export const getAccessPassStorage = () => _storage;
export const getAuthStorage = () => _storage;
