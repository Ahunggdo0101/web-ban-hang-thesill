import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import router from './routes';

/**
 * App component đóng vai trò là điểm bắt đầu (Entry Point) của phần ứng dụng khách.
 * Ở đây chỉ định cấu hình các Context Providers và liên kết RouterProvider
 * nhằm thiết lập cơ chế định tuyến dữ liệu mới (React Router v6 Data API).
 */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
