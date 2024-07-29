"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserRole: () => Promise<void>;
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
        // If a token exists, fetch the user role
        await fetchUserRole();
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
  
    checkAuth();
  }, []);

  
  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token retrieved from localStorage:', token);
  
      if (!token) {
        console.error('No token found in localStorage');
        setAuthState({ user: null, isLoading: false });
        return;
      }
  
      const response = await fetch('http://localhost:5215/api/Auth/getCurrentUserRole', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
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
        throw new Error('Failed to fetch user role');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setAuthState({ user: null, isLoading: false });
    }
  };




  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5215/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const data = await response.json();
      console.log('Login response:', data);
  
      if (!data.accessToken) {
        throw new Error('No access token received from server');
      }
  
      localStorage.setItem('token', data.accessToken);
      console.log('Token saved to localStorage:', data.accessToken);
  
      setAuthState({ 
        user: { email, role: 'User' }, // We'll fetch the role separately
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

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, fetchUserRole }}>
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