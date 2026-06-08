const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn('[env] EXPO_PUBLIC_API_URL is not defined — API calls will fail. Add it to .env.');
}

export const env = {
  apiUrl: apiUrl ?? '',
  isDev: __DEV__,
} as const;
