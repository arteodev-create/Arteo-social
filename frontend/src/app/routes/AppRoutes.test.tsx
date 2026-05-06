import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

const mockUseAuthStore = jest.fn();

jest.mock('@shared/ui', () => ({
  LoadingSpinner: () => <div>Loading</div>,
}));

jest.mock('@entities/session/model', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

jest.mock('@entities/session/model/accessControl', () => ({
  hasCapability: () => false,
}));

jest.mock('@features/auth', () => ({
  AuthPage: ({ mode }: { mode?: string }) => <div>Auth page {mode}</div>,
  PrivateRoute: ({ children }: { children: React.ReactNode }) => {
    const { Navigate, useLocation } = jest.requireActual('react-router-dom');
    const location = useLocation();
    const { isAuthenticated } = mockUseAuthStore();
    return isAuthenticated ? <>{children}</> : <Navigate to="/flow/login" state={{ from: location }} replace />;
  },
}));

jest.mock('@app/pages/HomePage', () => () => <div>Home route</div>);
jest.mock('@app/pages/PostDetailPage', () => () => <div>Post detail route</div>);
jest.mock('@app/pages/PluginsPage', () => () => <div>Plugins route</div>);
jest.mock('@app/pages/PluginDetailPage', () => () => <div>Plugin detail route</div>);
jest.mock('@app/pages/PluginStudioPage', () => () => <div>Plugin studio route</div>);
jest.mock('@app/pages/SearchPage', () => () => <div>Search route</div>);
jest.mock('@app/pages/ProfilePage', () => () => <div>Profile route</div>);
jest.mock('@app/pages/About', () => () => <div>About route</div>);
jest.mock('@app/pages/HotEventsPage', () => () => <div>Hot events route</div>);
jest.mock('@app/pages/HotEventDetailPage', () => () => <div>Hot event detail route</div>);
jest.mock('@app/pages/AlgorithmsPage', () => () => <div>Algorithms route</div>);
jest.mock('@app/pages/AlgorithmDetailPage', () => () => <div>Algorithm detail route</div>);
jest.mock('@app/pages/AlgorithmStudioPage', () => () => <div>Algorithm studio route</div>);
jest.mock('@features/admin', () => () => <div>Admin route</div>);

const renderRoute = (path: string, isAuthenticated = false) => {
  mockUseAuthStore.mockReturnValue({
    isAuthenticated,
    user: isAuthenticated ? { uuid: 'user-1', username: 'tester' } : null,
  });

  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
};

describe('AppRoutes smoke coverage', () => {
  it('renders the login route publicly', () => {
    renderRoute('/flow/login');
    expect(screen.getByText('Auth page login-identifier')).toBeInTheDocument();
  });

  it.each(['/home', '/tester/status/post-1', '/plugins', '/plugins/store/plugin-1'])(
    'redirects protected route %s to login when signed out',
    async (path) => {
      renderRoute(path);
      await waitFor(() => {
        expect(screen.getByText('Auth page login-identifier')).toBeInTheDocument();
      });
    }
  );

  it('renders feed when authenticated', async () => {
    renderRoute('/home', true);
    expect(await screen.findByText('Home route')).toBeInTheDocument();
  });

  it('renders plugin marketplace detail route when authenticated', async () => {
    renderRoute('/plugins/store/plugin-1', true);
    expect(await screen.findByText('Plugin detail route')).toBeInTheDocument();
  });

  it('renders plugin studio edit route when authenticated', async () => {
    renderRoute('/plugins/studio/plugin-1', true);
    expect(await screen.findByText('Plugin studio route')).toBeInTheDocument();
  });
});
