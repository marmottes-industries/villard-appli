type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memory = new Map<string, string>();

const memoryAdapter: StorageAdapter = {
  getItem: async (k) => (memory.has(k) ? (memory.get(k) as string) : null),
  setItem: async (k, v) => { memory.set(k, v); },
  removeItem: async (k) => { memory.delete(k); },
};

// TODO: swap to expo-secure-store (`npx expo install expo-secure-store`)
// pour persister les tokens. Pour les données non sensibles : @react-native-async-storage/async-storage.
export const storage: StorageAdapter = memoryAdapter;
