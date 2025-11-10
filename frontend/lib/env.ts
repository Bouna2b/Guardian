const DEFAULT_EXTERNAL_API = 'http://localhost:3001';

export function getApiBaseUrl() {
  const external = process.env.NEXT_PUBLIC_API_URL || DEFAULT_EXTERNAL_API;
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || external;
  }
  return external;
}
