export function setAuthToken(token: string) {
  // Store in localStorage for API calls
  localStorage.setItem('guardian_token', token);
  
  // Store in cookie for middleware
  document.cookie = `guardian_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function removeAuthToken() {
  localStorage.removeItem('guardian_token');
  document.cookie = 'guardian_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('guardian_token');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
