import { auth } from "../firebase";

export const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://api-foem2jj2ha-uc.a.run.app';

/**
 * Wait for Firebase Auth to initialise and return a valid ID token.
 * Retries up to 3 times with 1-second delays to handle the race condition
 * where auth.currentUser is null on first render but becomes available shortly after.
 */
export async function getAuthToken(retries = 3, delayMs = 1000): Promise<string | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await user.getIdToken(attempt > 1); // force-refresh on retry
                if (token) return token;
            } catch (err) {
                console.warn(`[AUTH] getIdToken attempt ${attempt} failed:`, err);
            }
        }
        if (attempt < retries) {
            console.warn(`[AUTH] auth.currentUser not ready (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    console.error('[AUTH] Failed to obtain ID token after all retries. User may not be logged in.');
    return null;
}
