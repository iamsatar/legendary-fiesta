import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = window.localStorage.getItem('user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
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
    <UserContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used inside a <UserProvider>');
  }
  return ctx;
}

export { UserContext, UserProvider, useUser };
export default UserProvider;
