import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './contexts/ToastContext';
import { ModalProvider } from './contexts/ModalContext';
import { AlgorithmProvider } from '@features/algorithm/model/AlgorithmContext';
import { DesignSystemProvider, GlobalModals } from '@shared/ui';
import './app/styles/index.css';
import './app/i18n';
import App from './app/App';

// Suppress non-critical ResizeObserver loop error notification in development
if (process.env.NODE_ENV === 'development') {
  const resizeObserverError = 'ResizeObserver loop completed with undelivered notifications.';
  window.addEventListener('error', (e) => {
    if (
      e.message === resizeObserverError || 
      e.message === 'ResizeObserver loop limit exceeded' ||
      e.message === 'Script error.' ||
      e.message?.includes('Turnstile')
    ) {
      const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay');
      if (resizeObserverErrDiv) {
        resizeObserverErrDiv.style.display = 'none';
      }
      e.stopImmediatePropagation();
    }
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes
      gcTime: 1000 * 60 * 60, // 60 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <DesignSystemProvider>
            <ModalProvider>
              <AlgorithmProvider>
                <ToastProvider>
                  <App />
                  <GlobalModals />
                </ToastProvider>
              </AlgorithmProvider>
            </ModalProvider>
          </DesignSystemProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
