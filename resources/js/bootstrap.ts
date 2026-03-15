import axios from 'axios';
import AuthService from './Services/AuthService';

window.axios = axios;

// Every request must carry credentials (session cookie) and mark itself as XHR
window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Request interceptor — re-reads the XSRF-TOKEN cookie on EVERY request so rotating
// tokens never cause a mismatch. This replaces the old one-time static read at load.
window.axios.interceptors.request.use(config => {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=').slice(1).join('='); // handle '=' inside the token value itself

    if (cookieValue) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(cookieValue);
    }
    return config;
});

// Ensure the Sanctum XSRF-TOKEN cookie exists before the first user action.
// This is the correct way to initialize CSRF protection with Sanctum.
axios.get('/sanctum/csrf-cookie').catch(() => {
    // Non-fatal — the interceptor above will still pick up the cookie if it was
    // already set by a previous page load.
});

// Initialize authentication
AuthService.initializeAuth();

// Setup axios interceptors for token refresh
AuthService.setupInterceptors();
