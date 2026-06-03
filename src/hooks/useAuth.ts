/**
 * useAuth - простий auth hook (TEMP)
 * TODO: Replace with real Firebase auth integration
 */

export function useAuth() {
  // TEMP: Always return logged in user for demo
  // TODO: Real Firebase auth state
  return {
    user: { id: 'demo-user', email: 'demo@whitewrite.com' },
    loading: false,
  };
}
