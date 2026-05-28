import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const MobileDrawer = React.memo(function MobileDrawer({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  user,
  handleMobileLogout,
  handleOpenLogin
}) {
  return (
    <div
      className={`md:hidden bg-brand-white border-b border-brand-sand overflow-hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="px-6 py-8 space-y-5">
        <NavLink
          to="/shop"
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => `block w-full text-left text-xs font-bold tracking-widest uppercase py-1 ${
            isActive ? 'text-brand-forest border-l-2 border-brand-forest pl-3' : 'text-brand-charcoal pl-3'
          }`}
        >
          Cửa Hàng
        </NavLink>
        <NavLink
          to="/quiz"
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => `block w-full text-left text-xs font-bold tracking-widest uppercase py-1 ${
            isActive ? 'text-brand-forest border-l-2 border-brand-forest pl-3' : 'text-brand-charcoal pl-3'
          }`}
        >
          Trắc Nghiệm Chọn Cây
        </NavLink>
        <NavLink
          to="/wishlist"
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => `block w-full text-left text-xs font-bold tracking-widest uppercase py-1 ${
            isActive ? 'text-brand-forest border-l-2 border-brand-forest pl-3' : 'text-brand-charcoal pl-3'
          }`}
        >
          Sản Phẩm Yêu Thích
        </NavLink>
        <a href="#" className="block w-full text-left text-xs font-bold tracking-widest uppercase py-1 text-brand-charcoal pl-3">
          Chậu Cảnh
        </a>
        <a href="#" className="block w-full text-left text-xs font-bold tracking-widest uppercase py-1 text-brand-charcoal pl-3">
          Cẩm Nang Chăm Sóc
        </a>
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => `block w-full text-left text-xs font-bold tracking-widest uppercase py-1 ${
              isActive ? 'text-brand-forest border-l-2 border-brand-forest pl-3' : 'text-brand-forest pl-3 border-l-2 border-brand-sand'
            }`}
          >
            ⚙️ Trang Quản Trị
          </NavLink>
        )}

        <div className="border-t border-brand-sand pt-4">
          {user ? (
            <div className="flex items-center space-x-3 pl-3">
              <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-brand-sand flex-shrink-0"
                  loading="lazy"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-bold text-brand-forest truncate hover:text-brand-clay block"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleMobileLogout}
                  className="text-[10px] text-brand-clay font-bold uppercase tracking-wider hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleOpenLogin}
              className="w-full text-left text-xs font-bold tracking-widest uppercase py-1 text-brand-forest pl-3 cursor-pointer"
            >
              Đăng Nhập / Đăng Ký
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default MobileDrawer;
