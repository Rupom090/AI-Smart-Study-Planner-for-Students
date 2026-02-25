import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '@/Services/AuthService';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Initialize auth state from storage
        const storedUser = AuthService.getUser();
        const token = AuthService.getToken();
        
        if (storedUser && token) {
            setUser(storedUser);
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (email: string, password: string, remember: boolean = false) => {
        const response = await AuthService.login({ email, password, remember });
        
        if (response.success && response.data) {
            setUser(response.data.user);
            setIsAuthenticated(true);
        }
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const refreshUser = () => {
        const storedUser = AuthService.getUser();
        setUser(storedUser);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
