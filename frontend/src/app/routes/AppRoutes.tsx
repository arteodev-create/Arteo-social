import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@shared/ui';
import { useAuthStore } from '@entities/session/model';
import { AuthPage, PrivateRoute } from '@features/auth';
import { hasCapability } from '@entities/session/model/accessControl';

const About = React.lazy(() => import('@app/pages/About'));
const HomePage = React.lazy(() => import('@app/pages/HomePage'));
const PostDetailPage = React.lazy(() => import('@app/pages/PostDetailPage'));
const SearchPage = React.lazy(() => import('@app/pages/SearchPage'));
const ProfilePage = React.lazy(() => import('@app/pages/ProfilePage'));
const HotEventsPage = React.lazy(() => import('@app/pages/HotEventsPage'));
const HotEventDetailPage = React.lazy(() => import('@app/pages/HotEventDetailPage'));
const AlgorithmsPage = React.lazy(() => import('@app/pages/AlgorithmsPage'));
const AlgorithmDetailPage = React.lazy(() => import('@app/pages/AlgorithmDetailPage'));
const AlgorithmStudioPage = React.lazy(() => import('@app/pages/AlgorithmStudioPage'));
const PluginsPage = React.lazy(() => import('@app/pages/PluginsPage'));
const PluginDetailPage = React.lazy(() => import('@app/pages/PluginDetailPage'));
const PluginStudioPage = React.lazy(() => import('@app/pages/PluginStudioPage'));
const AdminDashboard = React.lazy(() => import('@features/admin'));

const LAUNCH_CORE_ONLY = true;
const SHOW_ALGORITHMS = true;
const SHOW_PLUGINS = false;

const RouteFallback = () => (
  <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const withRouteSuspense = (children: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>
    {children}
  </Suspense>
);

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const canAccessAdmin = hasCapability(user, 'admin:access');

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage mode="login-identifier" />}
      />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            {withRouteSuspense(<HomePage />)}
          </PrivateRoute>
        }
      />

      <Route path="/flow/login" element={<AuthPage mode="login-identifier" />} />
      <Route path="/flow/register" element={<AuthPage mode="register-username" />} />
      <Route path="/flow/verify" element={<AuthPage mode="verify" />} />
      <Route path="/flow/reset" element={<AuthPage mode="reset" />} />

      <Route path="/login" element={<Navigate to="/flow/login" replace />} />
      <Route path="/register" element={<Navigate to="/flow/register" replace />} />
      <Route path="/flow/login/password" element={<Navigate to="/flow/login" replace />} />
      <Route path="/flow/register/email" element={<Navigate to="/flow/register" replace />} />
      <Route path="/flow/register/password" element={<Navigate to="/flow/register" replace />} />
      <Route path="/flow/register/verify" element={<Navigate to="/flow/register" replace />} />

      <Route
        path="/search"
        element={
          <PrivateRoute>
            {LAUNCH_CORE_ONLY ? <Navigate to="/home" replace /> : withRouteSuspense(<SearchPage />)}
          </PrivateRoute>
        }
      />

      <Route
        path="/algorithms"
        element={
          <PrivateRoute>
            {SHOW_ALGORITHMS ? withRouteSuspense(<AlgorithmsPage />) : <Navigate to="/home" replace />}
          </PrivateRoute>
        }
      />

      <Route
        path="/algorithms/studio"
        element={
          <PrivateRoute>
            {SHOW_ALGORITHMS && !LAUNCH_CORE_ONLY ? withRouteSuspense(<AlgorithmStudioPage />) : <Navigate to="/algorithms" replace />}
          </PrivateRoute>
        }
      />

      <Route
        path="/algorithms/:id"
        element={
          <PrivateRoute>
            {SHOW_ALGORITHMS ? withRouteSuspense(<AlgorithmDetailPage />) : <Navigate to="/home" replace />}
          </PrivateRoute>
        }
      />

      <Route
        path="/plugins"
        element={
          <PrivateRoute>
            {SHOW_PLUGINS ? withRouteSuspense(<PluginsPage />) : <Navigate to="/home" replace />}
          </PrivateRoute>
        }
      />

      <Route
        path="/plugins/studio"
        element={
          <PrivateRoute>
            {SHOW_PLUGINS ? withRouteSuspense(<PluginStudioPage />) : <Navigate to="/home" replace />}
          </PrivateRoute>
        }
      />

      <Route
        path="/plugins/studio/:id"
        element={
          <PrivateRoute>
            {SHOW_PLUGINS ? withRouteSuspense(<PluginStudioPage />) : <Navigate to="/home" replace />}
          </PrivateRoute>
        }
      />

      <Route
        path="/plugins/store/:id"
        element={
          <PrivateRoute>
            {SHOW_PLUGINS ? withRouteSuspense(<PluginDetailPage />) : <Navigate to="/home" replace />}
          </PrivateRoute>
        }
      />

      <Route
        path="/hot-events"
        element={
          <PrivateRoute>
            {LAUNCH_CORE_ONLY ? <Navigate to="/home" replace /> : withRouteSuspense(<HotEventsPage />)}
          </PrivateRoute>
        }
      />

      <Route
        path="/hot-events/:query"
        element={
          <PrivateRoute>
            {LAUNCH_CORE_ONLY ? <Navigate to="/home" replace /> : withRouteSuspense(<HotEventDetailPage />)}
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            {withRouteSuspense(<ProfilePage />)}
          </PrivateRoute>
        }
      />

      <Route
        path="/:username/status/:id"
        element={
          <PrivateRoute>
            {withRouteSuspense(<PostDetailPage />)}
          </PrivateRoute>
        }
      />

      <Route
        path="/:username"
        element={
          <PrivateRoute>
            {withRouteSuspense(<ProfilePage />)}
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            {canAccessAdmin && !LAUNCH_CORE_ONLY ? withRouteSuspense(<AdminDashboard />) : <Navigate to="/home" replace />}
          </PrivateRoute>
        }
      />

      <Route path="/about" element={withRouteSuspense(<About />)} />
      <Route path="/privacy" element={<Navigate to="/about" replace />} />
      <Route path="/terms" element={<Navigate to="/about" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
