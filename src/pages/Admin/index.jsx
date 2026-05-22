import { useState, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import DashboardTab from './DashboardTab';
import ProductsTab from './ProductsTab';
import OrdersTab from './OrdersTab';
import UsersTab from './UsersTab';

export default function Admin({ refreshProducts }) {
  const { fetchWithAuth, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(() => logout(), [logout]);

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top bar */}
        <header className="bg-white border-b border-brand-sand px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-brand-charcoal hover:text-brand-forest p-1 cursor-pointer"
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-slate font-bold">Admin Dashboard</p>
              <h1 className="font-serif text-lg text-brand-forest font-light capitalize">{activeTab === 'dashboard' ? 'Tổng quan' : activeTab === 'products' ? 'Sản phẩm' : activeTab === 'orders' ? 'Đơn hàng' : 'Người dùng'}</h1>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              {user.avatar && <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-brand-sand" />}
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-brand-forest">{user.name}</p>
                <p className="text-[9px] uppercase text-brand-clay font-bold tracking-widest">{user.role}</p>
              </div>
            </div>
          )}
        </header>

        {/* Tab Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && <DashboardTab fetchWithAuth={fetchWithAuth} />}
          {activeTab === 'products' && <ProductsTab fetchWithAuth={fetchWithAuth} refreshProducts={refreshProducts} />}
          {activeTab === 'orders' && <OrdersTab fetchWithAuth={fetchWithAuth} />}
          {activeTab === 'users' && <UsersTab fetchWithAuth={fetchWithAuth} />}
        </main>
      </div>
    </div>
  );
}
