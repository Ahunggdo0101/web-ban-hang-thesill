import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, X, Menu, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

// Import các subcomponents đã được chia tách để tối ưu hóa bảo trì và re-render
import AnnouncementBanner from './Header/AnnouncementBanner';
import UserDropdown from './Header/UserDropdown';
import MobileDrawer from './Header/MobileDrawer';
import DesktopNav from './Header/DesktopNav';

// Header được ghi nhớ bằng React.memo, chỉ re-render khi các tham chiếu prop thay đổi
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
  const headerRef = useRef(null);

  // Lưu trạng thái Mobile Menu vào ref để handler cuộn trang (scroll) đọc trực tiếp, tránh re-render phụ thuộc
  const isMobileMenuOpenRef = useRef(isMobileMenuOpen);
  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  // Hiệu ứng ẩn thanh menu khi cuộn xuống và xuất hiện lại khi cuộn lên (Smart Sticky Header)
  // Tối ưu hóa: Thay đổi trực tiếp lớp classList của DOM qua ref, hoàn toàn không gọi setState của React
  // giúp loại bỏ hoàn toàn hiện tượng lag giật khung hình (jank) khi cuộn chuột.
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let isVisible = true;

    const handleScroll = () => {
      // Nếu Mobile Menu đang mở thì không ẩn thanh điều hướng để tránh vỡ giao diện
      if (isMobileMenuOpenRef.current) return;

      const currentScrollY = window.scrollY;
      const header = headerRef.current;
      if (!header) return;

      // Khi cuộn xuống quá 100px -> Ẩn menu
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        if (isVisible) {
          header.classList.remove('translate-y-0');
          header.classList.add('-translate-y-full');
          isVisible = false;
        }
      } 
      // Khi cuộn ngược lên -> Hiện lại menu
      else if (currentScrollY < lastScrollY) {
        if (!isVisible) {
          header.classList.remove('-translate-y-full');
          header.classList.add('translate-y-0');
          isVisible = true;
        }
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bọc tất cả hàm xử lý sự kiện trong useCallback để giữ nguyên tham chiếu giữa các lượt render
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

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Các phương thức render icons phụ
  const renderWishlistIcon = useCallback(() => (
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
  ), [wishlistCount, location.pathname]);

  const renderCartIcon = useCallback(() => (
    <button
      onClick={handleOpenCart}
      className="relative text-brand-charcoal hover:text-brand-green p-2 focus:outline-none cursor-pointer transition-colors"
      title="Giỏ hàng"
      aria-label={`Giỏ hàng ${cartCount > 0 ? `(${cartCount} sản phẩm)` : ''}`}
    >
      <ShoppingBagIcon cartCount={cartCount} />
    </button>
  ), [handleOpenCart, cartCount]);

  const renderThemeToggle = useCallback(() => (
    <button
      onClick={toggleTheme}
      className="text-brand-charcoal hover:text-brand-green p-2 cursor-pointer transition-colors focus:outline-none"
      title={theme === 'light' ? 'Chuyển sang Dark Mode' : 'Chuyển sang Light Mode'}
      aria-label="Chuyển đổi giao diện"
    >
      <ThemeIcon theme={theme} />
    </button>
  ), [toggleTheme, theme]);

  return (
    <header 
      ref={headerRef}
      className="w-full bg-brand-white border-b border-brand-sand sticky top-0 z-40 transform translate-y-0 transition-transform duration-300 ease-in-out"
    >
      {/* 1. Banner thông báo trên cùng */}
      <AnnouncementBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2. Thanh điều hướng cho Mobile */}
        <div className="flex md:hidden justify-between items-center h-16 px-2 relative border-b border-brand-sand/30">
          <div className="w-10 flex justify-start items-center z-10">
            <button
              onClick={handleMobileMenuToggle}
              className="text-brand-charcoal hover:text-brand-green p-1.5 focus:outline-none transition-colors"
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <div className="flex-1 flex justify-center items-center px-1">
            <Link
              to="/"
              onClick={handleMobileMenuClose}
              className="flex items-center text-brand-forest focus:outline-none cursor-pointer group text-center"
            >
              <span className="font-serif text-[12px] xs:text-[13px] sm:text-sm font-light tracking-[0.02em] lowercase group-hover:text-brand-clay transition-colors duration-500 truncate max-w-[155px] xs:max-w-[190px] sm:max-w-none block">
                nghệ nhân đỗ xuân hùng
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-0.5 z-10">
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
                <Search size={16} />
              </button>
            </div>

            {renderThemeToggle()}
            {renderCartIcon()}
          </div>
        </div>

        {/* 3. Container cho Desktop (Gồm Row 1 tên thương hiệu/tìm kiếm + Row 2 MegaMenu) */}
        <div className="hidden md:flex flex-col">
          {/* Row 1 */}
          <div className="flex justify-between items-center h-20 border-b border-brand-sand/30">
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

            <div className="flex items-center space-x-3 flex-shrink-0">
              {renderThemeToggle()}
              <UserDropdown 
                user={user}
                isDropdownOpen={isDropdownOpen}
                handleToggleDropdown={handleToggleDropdown}
                handleCloseDropdown={handleCloseDropdown}
                handleLogout={handleLogout}
                setIsAuthModalOpen={setIsAuthModalOpen}
              />
              {renderWishlistIcon()}
              {renderCartIcon()}
            </div>
          </div>

          {/* Row 2 */}
          <DesktopNav />
        </div>

      </div>

      {/* 4. Menu trượt cho Mobile */}
      <MobileDrawer 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        user={user}
        handleMobileLogout={handleMobileLogout}
        handleOpenLogin={handleOpenLogin}
      />
    </header>
  );
});

// Helper components cho Icons để tránh re-render không cần thiết
const ShoppingBagIcon = memo(({ cartCount }) => (
  <>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="lucide lucide-shopping-bag"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
    {cartCount > 0 && (
      <span className="absolute top-1 right-0.5 bg-brand-clay text-brand-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 border border-brand-white">
        {cartCount > 99 ? '99+' : cartCount}
      </span>
    )}
  </>
));
ShoppingBagIcon.displayName = 'ShoppingBagIcon';

const ThemeIcon = memo(({ theme }) => (
  theme === 'light' ? (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="lucide lucide-moon"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
  ) : (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="lucide lucide-sun"
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="M4.93 4.93l1.41 1.41"></path>
      <path d="M17.66 17.66l1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="M6.34 17.66l-1.41 1.41"></path>
      <path d="M19.07 4.93l-1.41 1.41"></path>
    </svg>
  )
));
ThemeIcon.displayName = 'ThemeIcon';

Header.displayName = 'Header';

export default Header;
