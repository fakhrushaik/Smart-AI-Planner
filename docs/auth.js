import { createClient } from './vendor/supabase.js';
import { config } from './config.js';
export { config };
export const authStorageKey = 'smart-planner:auth:v2';
// Fall back to memory when browser storage is blocked; never silently use persistent storage.
const memory = new Map();
export const authStorage = {
  getItem(key) { try { return sessionStorage.getItem(key); } catch { return memory.get(key) ?? null; } },
  setItem(key, value) { try { sessionStorage.setItem(key, value); } catch { memory.set(key, value); } },
  removeItem(key) { memory.delete(key); try { sessionStorage.removeItem(key); } catch {} }
};
// Tab-scoped sessions avoid leaving a persistent refresh token on shared devices.
export const client = createClient(config.url, config.publishableKey, {
  auth: { storage: authStorage, storageKey: authStorageKey, persistSession: true,
    autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' }
});
export function callbackURL(recovery = false) {
  const url = new URL('login.html', location.href);
  if (recovery) url.searchParams.set('flow', 'recovery');
  return url.href;
}
export async function currentUser() {
  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session) return null;
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data.user;
}
export async function signOut() {
  const { error } = await client.auth.signOut({ scope: 'global' });
  if (error) throw error;
  authStorage.removeItem('smart-planner:session:v1');
}
