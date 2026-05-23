import { memo } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut
} from 'lucide-react';

export const Sidebar = memo(({ activeTab, setActiveTab, onLogout, isOpen, onClose }) => {
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'products',  label: 'Sản phẩm',  icon: Package },
    { id: 'orders',    label: 'Đơn hàng',  icon: ShoppingCart },
    { id: 'users',     label: 'Người dùng',icon: Users },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-brand-forest text-brand-cream z-50
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <h2 className="font-serif text-xl font-light lowercase tracking-wider">đỗ xuân hùng</h2>
          <p className="text-[9px] uppercase tracking-widest text-brand-clay mt-0.5 font-bold">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all ${
                activeTab === id
                  ? 'bg-white/15 text-brand-cream border-l-2 border-brand-clay'
                  : 'text-white/60 hover:text-white hover:bg-white/10 border-l-2 border-transparent'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-brand-clay hover:bg-white/10 cursor-pointer transition-all"
          >
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
