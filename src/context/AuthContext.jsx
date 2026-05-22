import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load user from localStorage on initial render
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('thesill_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (authData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Đăng nhập không thành công.');
      }

      const data = await response.json(); // { accessToken, refreshToken, user: { id, email, name, avatar, role } }
      setUser(data.user);
      localStorage.setItem('thesill_user', JSON.stringify(data.user));
      localStorage.setItem('thesill_access_token', data.accessToken);
      localStorage.setItem('thesill_refresh_token', data.refreshToken);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('thesill_refresh_token');
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (e) {
        console.error('Logout API error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem('thesill_user');
    localStorage.removeItem('thesill_access_token');
    localStorage.removeItem('thesill_refresh_token');
  };

  // Helper function to call APIs with auto-refresh token logic
  const fetchWithAuth = async (url, options = {}) => {
    let accessToken = localStorage.getItem('thesill_access_token');
    
    // Set headers
    const headers = {
      ...options.headers,
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const fetchOptions = {
      ...options,
      headers,
    };

    let response = await fetch(url, fetchOptions);

    // If 401, token might be expired, try refreshing
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('thesill_refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('thesill_access_token', data.accessToken);
            localStorage.setItem('thesill_refresh_token', data.refreshToken);
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('thesill_user', JSON.stringify(data.user));
            }

            // Retry original request with new token
            fetchOptions.headers['Authorization'] = `Bearer ${data.accessToken}`;
            response = await fetch(url, fetchOptions);
          } else {
            logout();
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
        } catch (refreshErr) {
          logout();
          throw refreshErr;
        }
      } else {
        logout();
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

