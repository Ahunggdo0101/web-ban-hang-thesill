import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Lazy load các trang để hỗ trợ phân tách chunk (chunk splitting) tối ưu hiệu năng
const HomePage = lazy(() => import('../pages/HomePage'));
const ShopPage = lazy(() => import('../pages/ShopPage'));
const QuizPage = lazy(() => import('../pages/QuizPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));
const WishlistPage = lazy(() => import('../pages/WishlistPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const AccountPage = lazy(() => import('../pages/AccountPage'));
const JournalPage = lazy(() => import('../pages/JournalPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const PolicyPage = lazy(() => import('../pages/PolicyPage'));
const SalePage = lazy(() => import('../pages/SalePage'));

// Import các layout và trang lỗi toàn cục
import RootLayout from '../layouts/RootLayout';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import GlobalErrorPage from '../components/GlobalErrorPage';

// Cấu hình cây định tuyến (Routing Tree) chuẩn chỉnh
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <GlobalErrorPage />, // Bắt tất cả các lỗi nổi lên (bubbling errors)
    children: [
      // Child A: Public Main Layout chứa Header/Footer dùng chung cho phần đông công chúng
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'shop',
            element: <ShopPage />,
          },
          {
            path: 'collections/sale',
            element: <SalePage />,
          },
          {
            path: 'quiz',
            element: <QuizPage />,
          },
          {
            path: 'wishlist',
            element: <WishlistPage />,
          },
          {
            path: 'orders',
            element: <OrdersPage />,
          },
          {
            path: 'product/:id',
            element: <ProductDetailPage />,
          },
          {
            path: 'checkout',
            element: <CheckoutPage />,
          },
          {
            path: 'about',
            element: <AboutPage />,
          },
          {
            path: 'contact',
            element: <ContactPage />,
          },
          {
            path: 'journal',
            element: <JournalPage />,
          },
          {
            path: 'account',
            element: <AccountPage />,
          },
          {
            path: 'search',
            element: <SearchPage />,
          },
          {
            path: 'shipping',
            element: <PolicyPage type="shipping" />,
          },
          {
            path: 'returns',
            element: <PolicyPage type="returns" />,
          },
          {
            path: 'privacy',
            element: <PolicyPage type="privacy" />,
          },
        ],
      },
      // Child B: Admin Layout chứa Sidebar điều hướng dành riêng cho quản trị viên
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
