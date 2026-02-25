import axios from 'axios';
import AuthService from './Services/AuthService';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Initialize authentication
AuthService.initializeAuth();

// Setup axios interceptors for token refresh
AuthService.setupInterceptors();
