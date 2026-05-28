import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const UserDropdown = React.memo(function UserDropdown({
  user,
  isDropdownOpen,
  handleToggleDropdown,
  handleCloseDropdown,
  handleLogout,
  setIsAuthModalOpen
}) {
  const navigate = useNavigate();

  return (
    user ? (
      <div className="relative flex items-center">
        <button
          onClick={handleToggleDropdown}
          className="w-8 h-8 rounded-full border border-brand-sand overflow-hidden hover:border-brand-forest focus:outline-none transition-colors cursor-pointer"
          title={user.name}
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={handleCloseDropdown}
              aria-hidden
            />
            <div
              className="absolute right-0 top-10 w-56 bg-brand-cream border border-brand-sand shadow-xl z-20 py-2 animate-fade-in text-left"
              role="menu"
            >
              <div className="px-4 py-2 border-b border-brand-sand">
                <p className="text-xs font-bold text-brand-forest truncate">{user.name}</p>
                <p className="text-[10px] text-[#666] truncate">{user.email}</p>
              </div>
              <Link
                to="/account"
                role="menuitem"
                onClick={handleCloseDropdown}
                className="block w-full text-left px-4 py-2.5 text-xs text-brand-charcoal hover:bg-brand-white hover:text-brand-forest transition-colors cursor-pointer"
              >
                Tài khoản của tôi
              </Link>
              <button
                role="menuitem"
                onClick={() => { handleCloseDropdown(); navigate('/orders'); }}
                className="w-full text-left px-4 py-2.5 text-xs text-brand-charcoal hover:bg-brand-white hover:text-brand-forest transition-colors cursor-pointer"
              >
                Đơn hàng của tôi
              </button>
              <button
                role="menuitem"
                onClick={() => { handleCloseDropdown(); alert('Tính năng Khu vườn của tôi sẽ sớm ra mắt!'); }}
                className="w-full text-left px-4 py-2.5 text-xs text-brand-charcoal hover:bg-brand-white hover:text-brand-forest transition-colors cursor-pointer"
              >
                Khu vườn của tôi 🌱
              </button>
              {user.role === 'admin' && (
                <button
                  role="menuitem"
                  onClick={() => { handleCloseDropdown(); navigate('/admin'); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-brand-forest font-bold hover:bg-brand-white transition-colors cursor-pointer"
                >
                  ⚙️ Trang Quản Trị
                </button>
              )}
              <div className="border-t border-brand-sand my-1" />
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs text-brand-clay hover:bg-brand-white transition-colors cursor-pointer font-semibold"
              >
                Đăng xuất
              </button>
            </div>
          </>
        )}
      </div>
    ) : (
      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="text-brand-charcoal hover:text-brand-green p-2 cursor-pointer transition-colors"
        title="Đăng nhập"
        aria-label="Đăng nhập"
      >
        <User size={18} />
      </button>
    )
  );
});

export default UserDropdown;
