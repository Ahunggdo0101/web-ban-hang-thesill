import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageLoader from '../components/PageLoader';
import CartDrawer from '../components/CartDrawer';
import AuthModal from '../components/AuthModal';

/**
 * MainLayout định hình khung sườn giao diện E-commerce dành cho khách hàng.
 * Tích hợp Header dùng chung, vùng hiển thị nội dung trang động thông qua Outlet
 * được bao bọc bởi Suspense để xử lý quá trình nạp trang động.
 */
export default function MainLayout() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Outlet context={{ searchQuery }} />
        </Suspense>
      </main>
      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <AuthModal />
    </div>
  );
}
