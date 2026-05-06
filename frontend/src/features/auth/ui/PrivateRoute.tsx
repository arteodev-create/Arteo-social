import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@entities/session/model';

interface PrivateRouteProps {
    children: React.ReactNode;
}

/**
 * PrivateRoute (Standard v14.1)
 * Protects routes that require an authenticated user.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login but save the current location
        return <Navigate to="/flow/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;

