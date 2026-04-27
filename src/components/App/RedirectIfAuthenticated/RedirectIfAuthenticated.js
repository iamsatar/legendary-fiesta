/**
 * RedirectIfAuthenticated
 *
 * React Router auth-guard component that redirects already-authenticated users
 * away from public pages (e.g. /login, /register).
 *
 * If the current user IS authenticated the component renders a <Navigate> to
 * the given `redirectTo` path (default: "/").
 * If the user is NOT authenticated the child routes / elements are rendered
 * normally.
 *
 * Usage (React Router v6):
 *
 *   <Route
 *     path="/login"
 *     element={
 *       <RedirectIfAuthenticated>
 *         <LoginPage />
 *       </RedirectIfAuthenticated>
 *     }
 *   />
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * @param {object}  props
 * @param {React.ReactNode} props.children    - Content to render for unauthenticated users.
 * @param {string}  [props.redirectTo="/"]    - Path to redirect authenticated users to.
 * @param {boolean} [props.isAuthenticated]   - Whether the current user is authenticated.
 *                                              Reads from a context/hook if not supplied
 *                                              directly (see note below).
 */
function RedirectIfAuthenticated({ children, redirectTo = '/', isAuthenticated }) {
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

export { RedirectIfAuthenticated };
export default RedirectIfAuthenticated;
