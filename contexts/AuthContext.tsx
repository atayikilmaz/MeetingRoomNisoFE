"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserRole: () => Promise<void>;
  googleLogin: () => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchUserRole();
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
  
    checkAuth();
  }, []);

  const setToken = (token: string) => {
    localStorage.setItem('token', token);
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token retrieved from localStorage:', token);
  
      if (!token) {
        console.error('No token found in localStorage');
        setAuthState({ user: null, isLoading: false });
        return;
      }
  
      const response = await fetch('https://meetingroomappniso.onrender.com/api/Auth/getCurrentUserRole', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      console.log('Response status:', response.status);
  
      if (response.ok) {
        const roles = await response.json();
        console.log('Received roles:', roles);
        
        const role = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'User';
        console.log('Assigned role:', role);
  
        setAuthState({
          user: { email: 'user@example.com', role }, // You might want to fetch the email as well
          isLoading: false,
        });
      } else if (response.status === 401) {
        console.error('Token is invalid or expired');
        localStorage.removeItem('token');
        setAuthState({ user: null, isLoading: false });
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user role. Status: ${response.status}, Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setAuthState({ user: null, isLoading: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('https://meetingroomappniso.onrender.com/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const data = await response.json();
  
      if (!data.token) {
        throw new Error('No token received from server');
      }
  
      setToken(data.token);
  
      setAuthState({ 
        user: { email, role: 'User' },
        isLoading: false 
      });
  
      await fetchUserRole();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };



  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ user: null, isLoading: false });
  };

  const googleLogin = () => {
    window.location.href = 'https://meetingroomappniso.onrender.com/api/Auth/google-login';
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, fetchUserRole, googleLogin, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};