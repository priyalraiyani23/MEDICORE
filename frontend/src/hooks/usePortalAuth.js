import { useState, useEffect } from 'react';

export const usePortalAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('portalToken') || '');
  const [role, setRole] = useState(localStorage.getItem('portalRole') || ''); // 'admin' or 'doctor'

  const login = (newToken, newRole) => {
    localStorage.setItem('portalToken', newToken);
    localStorage.setItem('portalRole', newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('portalToken');
    localStorage.removeItem('portalRole');
    setToken('');
    setRole('');
  };

  return { token, role, login, logout };
};
