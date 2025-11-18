import {syncService} from './syncService';
export const authService = {
 // Set auth token directly (used when authentication succeeds)


    // Try to authenticate against backend /api/auth/login.
    // Expects JSON { token: string } on success.
    async authenticate(username: string, password: string): Promise<boolean> {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "username": username,
                    "password": password })
            });

            if (!res.ok) {
                const txt = await res.text();
                console.error('Auth failed:', res.status, txt);
                return false;
            }

            const data = await res.json();
            if (data && data.token) {
                syncService.setAuthToken(String(data.token));
                return true;
            }
            return false;
        } catch (e) {
            console.error('Auth error:', e);
            return false;
        }
    },


};