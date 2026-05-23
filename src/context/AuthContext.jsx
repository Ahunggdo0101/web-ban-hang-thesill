import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // Access Token lưu trong bộ nhớ RAM (In-Memory)
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Tự động khôi phục phiên đăng nhập khi reload trang (F5)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem('thesill_user');
        const refreshToken = sessionStorage.getItem('thesill_refresh_token');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (refreshToken) {
          // Gọi API refresh để lấy Access Token mới đưa vào RAM
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            setAccessToken(data.accessToken);
            sessionStorage.setItem('thesill_refresh_token', data.refreshToken);
            setUser(data.user);
            sessionStorage.setItem('thesill_user', JSON.stringify(data.user));
          } else {
            // Refresh Token hết hạn hoặc không hợp lệ -> Đăng xuất
            await logout();
          }
        }
      } catch (error) {
        console.error('Failed to auto-refresh session on startup:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (authData) => {
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

      const data = await response.json();
      setUser(data.user);
      setAccessToken(data.accessToken); // Lưu vào React State
      sessionStorage.setItem('thesill_user', JSON.stringify(data.user));
      sessionStorage.setItem('thesill_refresh_token', data.refreshToken); // Lưu vào sessionStorage
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const loginWithPassword = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Email hoặc mật khẩu không chính xác.');
      }

      const data = await response.json();
      setUser(data.user);
      setAccessToken(data.accessToken); // Lưu vào React State
      sessionStorage.setItem('thesill_user', JSON.stringify(data.user));
      sessionStorage.setItem('thesill_refresh_token', data.refreshToken); // Lưu vào sessionStorage
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error('Password login error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Đăng ký thất bại.');
      }

      const data = await response.json();
      setUser(data.user);
      setAccessToken(data.accessToken); // Lưu vào React State
      sessionStorage.setItem('thesill_user', JSON.stringify(data.user));
      sessionStorage.setItem('thesill_refresh_token', data.refreshToken); // Lưu vào sessionStorage
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = sessionStorage.getItem('thesill_refresh_token');
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
    setAccessToken(null);
    sessionStorage.removeItem('thesill_user');
    sessionStorage.removeItem('thesill_refresh_token');
  }, []);

  // Helper thực hiện API call tự động đính kèm Token và cơ chế Refresh khi hết hạn
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    // Đọc Access Token trực tiếp từ memory state
    let currentAccessToken = accessToken;
    
    const headers = {
      ...options.headers,
    };
    
    if (currentAccessToken) {
      headers['Authorization'] = `Bearer ${currentAccessToken}`;
    }

    const fetchOptions = {
      ...options,
      headers,
    };

    let response = await fetch(url, fetchOptions);

    // Nếu mã lỗi 401 (Unauthorized) - có thể Access Token trong RAM đã hết hạn
    if (response.status === 401) {
      const refreshToken = sessionStorage.getItem('thesill_refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            // Cập nhật Access Token mới vào RAM
            setAccessToken(data.accessToken);
            sessionStorage.setItem('thesill_refresh_token', data.refreshToken);
            if (data.user) {
              setUser(data.user);
              sessionStorage.setItem('thesill_user', JSON.stringify(data.user));
            }

            // Gọi lại API ban đầu với Access Token mới
            fetchOptions.headers['Authorization'] = `Bearer ${data.accessToken}`;
            response = await fetch(url, fetchOptions);
          } else {
            await logout();
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }
        } catch (refreshErr) {
          await logout();
          throw refreshErr;
        }
      } else {
        await logout();
      }
    }

    return response;
  }, [accessToken, logout]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    loginWithPassword,
    register,
    logout,
    isAuthModalOpen,
    setIsAuthModalOpen,
    fetchWithAuth,
  }), [user, loading, login, loginWithPassword, register, logout, isAuthModalOpen, fetchWithAuth]);

  return (
    <AuthContext.Provider value={value}>
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
