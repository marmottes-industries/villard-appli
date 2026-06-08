import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const webAdapter: StorageAdapter = {
  getItem: async (k) => {
    try { return globalThis.localStorage?.getItem(k) ?? null; } catch { return null; }
  },
  setItem: async (k, v) => {
    try { globalThis.localStorage?.setItem(k, v); } catch { /* SSR / privacy mode */ }
  },
  removeItem: async (k) => {
    try { globalThis.localStorage?.removeItem(k); } catch { /* SSR / privacy mode */ }
  },
};

const secureStoreAdapter: StorageAdapter = {
  getItem: (k) => SecureStore.getItemAsync(k),
  setItem: (k, v) => SecureStore.setItemAsync(k, v),
  removeItem: (k) => SecureStore.deleteItemAsync(k),
};

export const storage: StorageAdapter =
  Platform.OS === 'web' ? webAdapter : secureStoreAdapter;
