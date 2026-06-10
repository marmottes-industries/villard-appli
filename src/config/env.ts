const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// Fail fast, like the web front: a missing API URL is a build/config error
// (EXPO_PUBLIC_* vars are inlined at bundler start), not a recoverable runtime
// state. Continuing with '' would only produce opaque network errors later.
if (!apiUrl) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not defined — add it to .env and restart Metro.',
  );
}

export const env = {
  apiUrl,
  isDev: __DEV__,
} as const;
