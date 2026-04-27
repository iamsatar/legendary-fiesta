import React from 'react';
import { Navigate } from 'react-router-dom';

function RedirectIfAuthenticated({ children, redirectTo = '/', isAuthenticated }) {
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

export { RedirectIfAuthenticated };
export default RedirectIfAuthenticated;
