import axios, { AxiosError } from 'axios';

export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        access_token: string;
        token_type: string;
        expires_in: number;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    };
    errors?: Record<string, string[]>;
}

export interface AuthError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

class AuthService {
    private static readonly TOKEN_KEY = 'auth_token';
    private static readonly USER_KEY = 'auth_user';
    private static readonly API_URL = '/api/v1/auth';

    /**
     * Store authentication token and user data
     */
    static setAuth(token: string, user: any, remember: boolean = false): void {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(this.TOKEN_KEY, token);
        storage.setItem(this.USER_KEY, JSON.stringify(user));

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    /**
     * Get stored authentication token
     */
    static getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get stored user data
     */
    static getUser(): any | null {
        const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Clear authentication data
     */
    static clearAuth(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        delete axios.defaults.headers.common['Authorization'];
    }

    /**
     * Initialize axios with stored token.
     * Always sets the Bearer header if a token exists in storage.
     */
    static initializeAuth(): void {
        const token = this.getToken();
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }

    /**
     * Login user
     */
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${this.API_URL}/login`, {
                email: credentials.email,
                password: credentials.password,
            });

            if (response.data.success && response.data.data) {
                this.setAuth(
                    response.data.data.access_token,
                    response.data.data.user,
                    credentials.remember || false
                );
            }

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<AuthResponse>;
            throw {
                message: axiosError.response?.data?.message || 'Login failed. Please try again.',
                errors: axiosError.response?.data?.errors,
                status: axiosError.response?.status,
            } as AuthError;
        }
    }

    /**
     * Logout user
     */
    static async logout(): Promise<void> {
        try {
            await axios.post(`${this.API_URL}/logout`);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
        }
    }

    /**
     * Refresh authentication token
     */
    static async refreshToken(): Promise<boolean> {
        try {
            const response = await axios.post<AuthResponse>(`${this.API_URL}/refresh`);

            if (response.data.success && response.data.data) {
                const user = this.getUser();
                const remember = !!localStorage.getItem(this.TOKEN_KEY);
                this.setAuth(response.data.data.access_token, user, remember);
                return true;
            }
            return false;
        } catch (error) {
            this.clearAuth();
            return false;
        }
    }

    /**
     * Setup axios interceptors for token refresh
     */
    static setupInterceptors(): void {
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If the refresh endpoint itself returns 401, clear auth and bail out
                if (originalRequest.url?.includes('/refresh')) {
                    this.clearAuth();
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // Apply the new token to the retried request header
                        const newToken = this.getToken();
                        if (newToken) {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        }
                        return axios(originalRequest);
                    }
                }

                return Promise.reject(error);
            }
        );
    }
}

export default AuthService;
