import { PropsWithChildren, useEffect } from 'react';
import AuthService from '@/Services/AuthService';

interface ProtectedRouteProps extends PropsWithChildren {
    redirectTo?: string;
}

export default function ProtectedRoute({ 
    children, 
    redirectTo = '/login' 
}: ProtectedRouteProps) {
    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            window.location.href = redirectTo;
        }
    }, [redirectTo]);

    if (!AuthService.isAuthenticated()) {
        return null;
    }

    return <>{children}</>;
}
