import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from '@shared/ui';
import { useAuthStore } from '@entities/session/model';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './ErrorBoundary';

const App: React.FC = () => {
  const { isLoading } = useAuthStore();

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>

      <AppRoutes />
    </ErrorBoundary>
  );
};

export default App;
