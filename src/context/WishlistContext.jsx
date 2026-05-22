import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, fetchWithAuth } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách yêu thích của khách từ localStorage
  const getGuestWishlist = () => {
    try {
      const saved = localStorage.getItem('thesill_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse guest wishlist:', e);
      return [];
    }
  };

  // Tải danh sách yêu thích
  const loadWishlist = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/wishlist`);
        if (res.ok) {
          const data = await res.json(); // Array of { id, product, ... }
          setWishlistItems(data.map(item => item.product));
        }
      } catch (e) {
        console.error('Failed to load user wishlist:', e);
      } finally {
        setLoading(false);
      }
    } else {
      setWishlistItems(getGuestWishlist());
    }
  }, [user, fetchWithAuth]);

  // Đồng bộ và tải lại wishlist khi trạng thái user thay đổi
  useEffect(() => {
    const syncAndLoad = async () => {
      if (user) {
        // Đồng bộ danh sách của khách lên server khi đăng nhập
        const guestItems = getGuestWishlist();
        if (guestItems.length > 0) {
          try {
            await Promise.all(
              guestItems.map(item =>
                fetchWithAuth(`${API_BASE_URL}/wishlist/${item.id}`, {
                  method: 'POST',
                })
              )
            );
            localStorage.removeItem('thesill_wishlist');
          } catch (e) {
            console.error('Failed to sync guest wishlist with server:', e);
          }
        }
      }
      loadWishlist();
    };
    syncAndLoad();
  }, [user, loadWishlist]);

  // Thêm vào danh sách yêu thích
  const addToWishlist = async (product) => {
    if (user) {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/wishlist/${product.id}`, {
          method: 'POST',
        });
        if (res.ok) {
          setWishlistItems(prev => {
            if (prev.some(item => item.id === product.id)) return prev;
            return [...prev, product];
          });
        }
      } catch (e) {
        console.error('Failed to add to wishlist:', e);
      }
    } else {
      setWishlistItems(prev => {
        if (prev.some(item => item.id === product.id)) return prev;
        const updated = [...prev, product];
        localStorage.setItem('thesill_wishlist', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Xóa khỏi danh sách yêu thích
  const removeFromWishlist = async (productId) => {
    if (user) {
      try {
        const res = await fetchWithAuth(`${API_BASE_URL}/wishlist/${productId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setWishlistItems(prev => prev.filter(item => item.id !== productId));
        }
      } catch (e) {
        console.error('Failed to remove from wishlist:', e);
      }
    } else {
      setWishlistItems(prev => {
        const updated = prev.filter(item => item.id !== productId);
        localStorage.setItem('thesill_wishlist', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Kiểm tra xem sản phẩm có nằm trong danh sách yêu thích không
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
