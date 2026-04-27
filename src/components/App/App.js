import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RedirectIfAuthenticated from './RedirectIfAuthenticated/RedirectIfAuthenticated';
import { UserProvider, useUser } from '../../contexts/UserProvider';

function PrivateRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated } = useUser();
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children, redirectTo = '/' }) {
  const { isAuthenticated } = useUser();
  return (
    <RedirectIfAuthenticated isAuthenticated={isAuthenticated} redirectTo={redirectTo}>
      {children}
    </RedirectIfAuthenticated>
  );
}

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

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
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
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export { PrivateRoute, PublicOnlyRoute };
export default App;
