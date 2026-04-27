/**
 * App
 *
 * Root application component.
 * Wires up React Router with auth-aware route guards:
 *
 *  - Public routes wrapped in <RedirectIfAuthenticated> send logged-in users
 *    away from pages like /login.
 *  - Private routes render their content only when the user is authenticated;
 *    unauthenticated visitors are redirected to /login.
 */

import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RedirectIfAuthenticated from './RedirectIfAuthenticated/RedirectIfAuthenticated';

// ─── Auth Context ────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

/**
 * Provides authentication state and helpers to the component tree.
 *
 * @param {{ children: React.ReactNode }} props
 */
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = window.localStorage.getItem('user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Validate that the stored value is a plain object (not null/array/primitive)
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  function login(userData) {
    window.localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      window.localStorage.setItem('authToken', userData.token);
    }
    setUser(userData);
  }

  function logout() {
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('authToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume the AuthContext.
 *
 * @returns {{ user: object|null, isAuthenticated: boolean, login: Function, logout: Function }}
 */
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}

// ─── Route Guards ────────────────────────────────────────────────────────────

/**
 * Protects a route that requires authentication.
 * Unauthenticated visitors are redirected to /login.
 *
 * @param {{ children: React.ReactNode, redirectTo?: string }} props
 */
function PrivateRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

/**
 * Public-only route guard (thin wrapper around RedirectIfAuthenticated that
 * pulls isAuthenticated from the AuthContext automatically).
 *
 * @param {{ children: React.ReactNode, redirectTo?: string }} props
 */
function PublicOnlyRoute({ children, redirectTo = '/' }) {
  const { isAuthenticated } = useAuth();
  return (
    <RedirectIfAuthenticated isAuthenticated={isAuthenticated} redirectTo={redirectTo}>
      {children}
    </RedirectIfAuthenticated>
  );
}

// ─── Placeholder page components (replace with real implementations) ─────────

function LoginPage() {
  return <div>Login Page</div>;
}

function RegisterPage() {
  return <div>Register Page</div>;
}

function Dashboard() {
  return <div>Dashboard</div>;
}

function NotFound() {
  return <div>404 – Page Not Found</div>;
}

// ─── App ─────────────────────────────────────────────────────────────────────

/**
 * Root component. Wraps the entire app in <AuthProvider> and declares routes.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public-only routes – authenticated users are sent to "/" */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Private routes – unauthenticated users are sent to "/login" */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export { AuthContext, AuthProvider, useAuth, PrivateRoute, PublicOnlyRoute };
export default App;
