import { useState, useCallback, memo } from 'react';
import { useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import { Search, X, ShoppingBag, Menu, User, Heart, Leaf, Sun, Moon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import MegaMenu from './MegaMenu';
import { NAVIGATION_DATA } from '../data/navigation';

// React.memo: header chỉ re-render khi searchQuery hoặc auth thay đổi
const Header = memo(function Header({ onSearch, searchQuery }) {
  const { theme, toggleTheme } = useTheme();
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const { wishlistCount } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchToggle = useCallback(() => {
    setShowSearch(prev => {
      if (prev) onSearch('');
      return !prev;
    });
  }, [onSearch]);

  const handleSearchInput = useCallback((e) => {
    onSearch(e.target.value);
  }, [onSearch]);

  const handleSearchSubmit = useCallback((query) => {
    if (!query || !query.trim()) return;
    navigate('/search?q=' + encodeURIComponent(query.trim()));
    setShowSearch(false);
  }, [navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e.target.value);
    }
  }, [handleSearchSubmit]);

  const handleOpenCart = useCallback(() => setIsCartOpen(true), [setIsCartOpen]);
  const handleToggleDropdown = useCallback(() => setIsDropdownOpen(prev => !prev), []);
  const handleCloseDropdown = useCallback(() => setIsDropdownOpen(false), []);

  const handleLogout = useCallback(() => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handleMobileLogout = useCallback(() => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handleOpenLogin = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsAuthModalOpen(true);
  }, [setIsAuthModalOpen]);

  const renderUserIcon = () => (
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
              className="absolute right-0 top-10 w-56 bg-brand-cream border border-brand-sand shadow-xl z-20 py-2 animate-fade-in"
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

  const renderWishlistIcon = () => (
    <Link
      to="/wishlist"
      className="relative text-brand-charcoal hover:text-brand-green p-2 cursor-pointer transition-colors block"
      title="Yêu thích"
      aria-label={`Danh sách yêu thích ${wishlistCount > 0 ? `(${wishlistCount} sản phẩm)` : ''}`}
    >
      <Heart size={18} className={location.pathname === '/wishlist' ? 'fill-brand-forest text-brand-forest' : ''} />
      {wishlistCount > 0 && (
        <span className="absolute top-1 right-0.5 bg-brand-clay text-brand-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 border border-brand-white">
          {wishlistCount > 99 ? '99+' : wishlistCount}
        </span>
      )}
    </Link>
  );

  const renderCartIcon = () => (
    <button
      onClick={handleOpenCart}
      className="relative text-brand-charcoal hover:text-brand-green p-2 focus:outline-none cursor-pointer transition-colors"
      title="Giỏ hàng"
      aria-label={`Giỏ hàng ${cartCount > 0 ? `(${cartCount} sản phẩm)` : ''}`}
    >
      <ShoppingBag size={18} />
      {cartCount > 0 && (
        <span className="absolute top-1 right-0.5 bg-brand-clay text-brand-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 border border-brand-white">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );

  const renderThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="text-brand-charcoal hover:text-brand-green p-2 cursor-pointer transition-colors focus:outline-none"
      title={theme === 'light' ? 'Chuyển sang Dark Mode' : 'Chuyển sang Light Mode'}
      aria-label="Chuyển đổi giao diện"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );

  return (
    <header className="w-full bg-brand-white border-b border-brand-sand sticky top-0 z-40">
      {/* Top Announcement Banner */}
      <div className="w-full bg-brand-forest text-brand-cream text-[10px] py-2.5 px-4 text-center font-semibold tracking-[0.15em] uppercase flex items-center justify-center space-x-2">
        <Leaf size={10} className="text-brand-clay animate-pulse flex-shrink-0" />
        <span>Freeship cho đơn từ 150.000đ • Bảo hành cây khỏe mạnh 30 ngày</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Row */}
        <div className="flex md:hidden justify-between items-center h-16 px-2 relative border-b border-brand-sand/30">
          {/* Left Column: Mobile Menu Toggle */}
          <div className="w-10 flex justify-start items-center z-10">
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="text-brand-charcoal hover:text-brand-green p-1.5 focus:outline-none transition-colors"
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Center Column: Logo */}
          <div className="flex-1 flex justify-center items-center px-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center text-brand-forest focus:outline-none cursor-pointer group text-center"
            >
              <span className="font-serif text-[12px] xs:text-[13px] sm:text-sm font-light tracking-[0.02em] lowercase group-hover:text-brand-clay transition-colors duration-500 truncate max-w-[155px] xs:max-w-[190px] sm:max-w-none block">
                nghệ nhân đỗ xuân hùng
              </span>
            </Link>
          </div>

          {/* Right Column: Actions */}
          <div className="flex items-center space-x-0.5 z-10">
            {/* Search */}
            <div className="relative flex items-center">
              {showSearch && (
                <input
                  type="text"
                  placeholder="Tìm..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleKeyDown}
                  className="bg-brand-cream border border-brand-sand text-brand-charcoal text-[10px] py-1 px-2.5 pr-7 focus:outline-none focus:border-brand-forest w-20 xs:w-28 animate-fade-in font-medium transition-all"
                  autoFocus
                  aria-label="Tìm kiếm sản phẩm"
                />
              )}
              <button
                onClick={() => {
                  if (showSearch && searchQuery.trim()) {
                    handleSearchSubmit(searchQuery);
                  } else {
                    handleSearchToggle();
                  }
                }}
                className="text-brand-charcoal hover:text-brand-green p-1.5 cursor-pointer transition-colors"
                title={showSearch && searchQuery.trim() ? 'Tìm kiếm' : (showSearch ? 'Đóng tìm kiếm' : 'Tìm kiếm')}
                aria-label={showSearch && searchQuery.trim() ? 'Tìm kiếm' : (showSearch ? 'Đóng tìm kiếm' : 'Tìm kiếm')}
              >
                {showSearch && searchQuery.trim() ? (
                  <Search size={16} />
                ) : showSearch ? (
                  <X size={16} />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>

            {renderThemeToggle()}
            {renderCartIcon()}
          </div>
        </div>

        {/* Desktop Container (Row 1 + Row 2) */}
        <div className="hidden md:flex flex-col">
          {/* Row 1 */}
          <div className="flex justify-between items-center h-20 border-b border-brand-sand/30">
            {/* Logo — Left Aligned */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center text-brand-forest focus:outline-none cursor-pointer group"
              >
                <span className="font-serif text-3xl font-light tracking-[0.05em] lowercase group-hover:text-brand-clay transition-colors duration-500">
                  nghệ nhân đỗ xuân hùng
                </span>
              </Link>
            </div>

            {/* Search Bar — Center Aligned, Long */}
            <div className="flex-grow max-w-xl mx-8 relative">
              <input
                type="text"
                placeholder="Tìm cây..."
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
                className="w-full bg-brand-cream border border-brand-sand/80 text-brand-charcoal text-xs py-2 px-4 pr-10 focus:outline-none focus:border-brand-forest focus:ring-1 focus:ring-brand-forest transition-all"
                aria-label="Tìm kiếm sản phẩm"
              />
              <Search 
                size={16} 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-sage cursor-pointer hover:text-brand-forest transition-colors" 
                onClick={() => handleSearchSubmit(searchQuery)}
              />
            </div>

            {/* Action Icons — Right Aligned */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {renderThemeToggle()}
              {renderUserIcon()}
              {renderWishlistIcon()}
              {renderCartIcon()}
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex justify-center items-center h-12 relative">
            <nav className="flex items-center h-full space-x-8" aria-label="Desktop navigation">
              {NAVIGATION_DATA.map((item, idx) => {
                if (item.hasMenu) {
                  return (
                    <div key={idx} className="group relative h-full flex items-center">
                      <NavLink
                        to={item.view === 'home' ? '/' : `/${item.view || 'shop'}`}
                        className={({ isActive }) => `text-[11px] font-bold tracking-widest uppercase py-2 cursor-pointer transition-colors hover-underline ${
                          isActive ? 'text-brand-forest' : (item.color || 'text-[#666] hover:text-brand-forest')
                        }`}
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        {item.title}
                      </NavLink>
                      <MegaMenu data={item.menuData} />
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={idx}
                    to={item.view === 'home' ? '/' : `/${item.view || 'shop'}`}
                    className={({ isActive }) => `text-[11px] font-bold tracking-widest uppercase py-2 cursor-pointer transition-colors hover-underline ${
                      isActive ? 'text-brand-forest' : (item.color || 'text-[#666] hover:text-brand-forest')
                    }`}
                  >
                    {item.title}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

      </div>

      {/* Mobile Menu — Animated slide down */}
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
    </header>
  );
});

export default Header;
