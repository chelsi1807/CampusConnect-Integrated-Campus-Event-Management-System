import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('cc_token');
    const savedUser = localStorage.getItem('cc_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
        // Verify current token validity with /auth/me
        api.get('/auth/me')
          .then((res) => {
            setUser(res.data);
            localStorage.setItem('cc_user', JSON.stringify(res.data));
          })
          .catch(() => {
            logout();
          })
          .finally(() => setLoading(false));
      } catch (e) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('cc_token', access_token);
    localStorage.setItem('cc_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { access_token, user: newUserData } = res.data;
    
    setToken(access_token);
    setUser(newUserData);
    localStorage.setItem('cc_token', access_token);
    localStorage.setItem('cc_user', JSON.stringify(newUserData));
    return newUserData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
  };

  const updateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('cc_user', JSON.stringify(updated));
  };

  // Demo accounts for instant 1-click evaluation
  const demoAccounts = {
    student: { email: 'david.student@campusconnect.edu', password: 'Student@123' },
    organizer: { email: 'sarah.organizer@campusconnect.edu', password: 'Organizer@123' },
    admin: { email: 'admin@campusconnect.edu', password: 'Admin@123' }
  };

  const quickLogin = async (roleType) => {
    const creds = demoAccounts[roleType];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        quickLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

