import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Configure Axios Defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';

  // Add Axios Request Interceptor to dynamically attach current token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const activeToken = localStorage.getItem('token');
        if (activeToken) {
          config.headers['Authorization'] = `Bearer ${activeToken}`;
        } else {
          delete config.headers['Authorization'];
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Load profile context on startup if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('/auth/profile');
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error('[Auth Context] Failed to load profile:', error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      console.error('[Auth Context] Login exception:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Server connection failed! Please ensure your backend server is running on http://localhost:5000'
      };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register', { name, email, password });
      if (response.data.success) {
        // We receive verification request message
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      console.error('[Auth Context] Signup exception:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Server connection failed! Please ensure your backend server is running on http://localhost:5000'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  // Verify Email handler
  const verifyEmail = async (verificationToken) => {
    try {
      const response = await axios.get(`/auth/verify-email?token=${verificationToken}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification link invalid or expired'
      };
    }
  };

  // Forgot password request
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset request failed'
      };
    }
  };

  // Reset password handler
  const resetPassword = async (resetToken, newPassword) => {
    try {
      const response = await axios.put('/auth/reset-password', {
        token: resetToken,
        password: newPassword
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password update failed'
      };
    }
  };

  // Update profile and addresses
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
