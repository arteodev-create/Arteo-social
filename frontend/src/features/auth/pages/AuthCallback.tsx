import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@entities/session/model';
import { SplashScreen } from '@shared/ui';
import { toast } from 'sonner';

/**
 * AuthCallback - automatic sign-in callback for deployment flows.
 * Reads the returned token and signs the user in immediately.
 */
const AuthCallback: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const setAuth = useAuthStore(state => state.setAuth);
    const refreshProfile = useAuthStore(state => state.refreshProfile);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {

            // Set the new identity.
            setAuth({
                token,
                isAuthenticated: true,
                isLoading: true
            });

            // Load the admin profile.
            refreshProfile().then(() => {
                toast.success('Admin login successful');
                navigate('/admin', { replace: true });
            }).catch(() => {
                toast.error('Unable to verify admin access');
                navigate('/login', { replace: true });
            });
        } else {
            navigate('/login', { replace: true });
        }
    }, [location, navigate, setAuth, refreshProfile]);

    return <SplashScreen />;
};

export default AuthCallback;

