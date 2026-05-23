import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { SlidersHorizontal, Star, ShoppingBag, Eye, Check, ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SkeletonProductGrid from '../components/SkeletonProductGrid';

export default function Shop({ searchQuery }) {
  useDocumentTitle('Cửa Hàng');
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12;

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;

  // Filters from URL Search Params
  const lightFilter = searchParams.get('light') || 'all';
  const difficultyFilter = searchParams.get('difficulty') || 'all';
  const sizeFilter = searchParams.get('size') || 'all';
  const petFriendlyOnly = searchParams.get('pet') === 'true';
  const sortOption = searchParams.get('sort') || 'featured';

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());

      if (searchQuery) {
        params.set('search', searchQuery);
      }
      if (lightFilter !== 'all') {
        params.set('light', lightFilter);
      }
      if (difficultyFilter !== 'all') {
        params.set('difficulty', difficultyFilter);
      }
      if (sizeFilter !== 'all') {
        params.set('size', sizeFilter);
      }
      if (petFriendlyOnly) {
        params.set('petFriendly', 'true');
      }

      let sortBy = 'newest';
      if (sortOption === 'price-asc') sortBy = 'price_asc';
      else if (sortOption === 'price-desc') sortBy = 'price_desc';
      else if (sortOption === 'rating') sortBy = 'rating_desc';
      params.set('sortBy', sortBy);

      const res = await fetch(`${API_BASE_URL}/products?${params}`);
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();
      setDynamicProducts(data.items || []);
      setTotalPages(data.meta?.totalPages ?? 1);
      setTotalItems(data.meta?.totalItems ?? 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setDynamicProducts([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, lightFilter, difficultyFilter, sizeFilter, petFriendlyOnly, sortOption]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Accordion Expand/Collapse states for filter sections
  const [expandedSections, setExpandedSections] = useState({
    light: true,
    pet: true,
    difficulty: true,
    size: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Mobile Filter Drawer Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Selected Pot Color for each product card (defaults to 'Terracotta')
  const [cardColors, setCardColors] = useState({});

  const handleColorChange = useCallback((productId, colorName, e) => {
    e.stopPropagation(); // Avoid triggering open detail modal
    setCardColors(prev => ({
      ...prev,
      [productId]: colorName
    }));
  }, []);

  // Update URL search parameters
  const updateFilter = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === 'all' || value === 'false' || !value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      // Nếu thay đổi bất kỳ filter nào khác 'page', tự động reset về trang 1
      if (key !== 'page') {
        next.delete('page');
      }
      return next;
    });
  }, [setSearchParams]);

  // Reset all filters
  const resetFilters = () => setSearchParams({});

  const potColorsInfo = useMemo(() => [
    { name: "Terracotta", value: "#D77A61" },
    { name: "Cream", value: "#F5F2EB" },
    { name: "Mint", value: "#C1D5C0" },
    { name: "Charcoal", value: "#3E3E3E" }
  ], []);



  // Cuộn mượt lên đầu grid khi đổi trang (tránh cuộn khi load trang đầu tiên)
  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } else {
      isMounted.current = true;
    }
  }, [currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in bg-brand-cream">
      
      {/* Category Header Banner */}
      <div className="text-left border-b border-brand-sand pb-10 mb-14">
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
          Cửa hàng trực tuyến
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-brand-forest font-light mt-2">
          Sưu tập thực vật trong nhà
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate max-w-xl mt-3 leading-relaxed font-medium">
          Dễ dàng tìm kiếm loài cây hoàn mỹ phù hợp với ánh sáng phòng của bạn. Mỗi chậu cây đều được đội ngũ chuyên gia chọn lọc tỉ mỉ và vận chuyển tận nơi.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex justify-between items-center border-b border-brand-sand pb-5 mb-10">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex lg:hidden items-center space-x-2 text-[10px] font-bold text-brand-forest uppercase tracking-widest cursor-pointer border border-brand-forest px-4 py-2 bg-brand-white"
        >
          <SlidersHorizontal size={12} />
          <span>Bộ lọc ({totalItems})</span>
        </button>

        <div className="hidden lg:block text-xs text-brand-slate font-medium">
          Hiển thị <strong>{totalItems > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</strong>–<strong>{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</strong> trong số <strong>{totalItems}</strong> sản phẩm
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-1">
          <span className="text-[9px] font-bold text-brand-slate uppercase tracking-widest">Sắp xếp:</span>
          <select
            value={sortOption}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="bg-transparent text-[10px] font-bold text-brand-forest focus:outline-none cursor-pointer uppercase tracking-widest py-1 border-b border-transparent hover:border-brand-forest transition-colors"
          >
            <option value="featured">Mặc định</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="rating">Được đánh giá cao</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* DESKTOP FILTER PANEL (Left Column) - Elegant Accordion */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 text-left self-start sticky top-28 bg-brand-white p-6 border border-brand-sand">
          <div className="flex justify-between items-center border-b border-brand-sand pb-3 mb-4">
            <h3 className="font-serif text-lg font-medium text-brand-forest">Lọc kết quả</h3>
            <button
              onClick={resetFilters}
              className="text-[9px] text-brand-clay hover:text-brand-forest font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={10} /> Đặt lại
            </button>
          </div>

          {/* Section: Light Requirements */}
          <div className="space-y-3 py-2 border-b border-brand-sand/50">
            <button 
              onClick={() => toggleSection('light')}
              className="flex justify-between items-center w-full text-left focus:outline-none"
            >
              <h4 className="text-[10px] font-bold uppercase text-brand-forest tracking-widest">Yêu cầu ánh sáng</h4>
              {expandedSections.light ? <ChevronUp size={12} className="text-[#888]" /> : <ChevronDown size={12} className="text-[#888]" />}
            </button>
            {expandedSections.light && (
              <div className="space-y-2.5 pt-2 pb-1 animate-fade-in">
                {[
                  { id: 'all', name: 'Tất cả' },
                  { id: 'low', name: 'Ánh sáng yếu' },
                  { id: 'medium', name: 'Ánh sáng trung bình' },
                  { id: 'bright', name: 'Ánh sáng rực rỡ' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center text-xs text-[#555] hover:text-brand-forest cursor-pointer transition-colors font-medium">
                    <input
                      type="radio"
                      name="light"
                      checked={lightFilter === opt.id}
                      onChange={() => updateFilter('light', opt.id)}
                      className="mr-3 text-brand-forest focus:ring-brand-forest accent-brand-forest"
                    />
                    {opt.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Section: Pet Friendliness */}
          <div className="space-y-3 py-2 border-b border-brand-sand/50">
            <button 
              onClick={() => toggleSection('pet')}
              className="flex justify-between items-center w-full text-left focus:outline-none"
            >
              <h4 className="text-[10px] font-bold uppercase text-brand-forest tracking-widest">Thân thiện vật nuôi</h4>
              {expandedSections.pet ? <ChevronUp size={12} className="text-[#888]" /> : <ChevronDown size={12} className="text-[#888]" />}
            </button>
            {expandedSections.pet && (
              <div className="pt-2 pb-1 animate-fade-in">
                <label className="flex items-center text-xs text-[#555] hover:text-brand-forest cursor-pointer transition-colors font-medium">
                  <input
                    type="checkbox"
                    checked={petFriendlyOnly}
                    onChange={() => updateFilter('pet', (!petFriendlyOnly).toString())}
                    className="mr-3 rounded text-brand-forest focus:ring-brand-forest accent-brand-forest"
                  />
                  An toàn cho thú cưng
                </label>
              </div>
            )}
          </div>

          {/* Section: Care Difficulty */}
          <div className="space-y-3 py-2 border-b border-brand-sand/50">
            <button 
              onClick={() => toggleSection('difficulty')}
              className="flex justify-between items-center w-full text-left focus:outline-none"
            >
              <h4 className="text-[10px] font-bold uppercase text-brand-forest tracking-widest">Độ khó chăm sóc</h4>
              {expandedSections.difficulty ? <ChevronUp size={12} className="text-[#888]" /> : <ChevronDown size={12} className="text-[#888]" />}
            </button>
            {expandedSections.difficulty && (
              <div className="space-y-2.5 pt-2 pb-1 animate-fade-in">
                {[
                  { id: 'all', name: 'Tất cả' },
                  { id: 'easy', name: 'Dễ chăm sóc' },
                  { id: 'moderate', name: 'Trung bình' },
                  { id: 'care', name: 'Cần chú ý đặc biệt' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center text-xs text-[#555] hover:text-brand-forest cursor-pointer transition-colors font-medium">
                    <input
                      type="radio"
                      name="difficulty"
                      checked={difficultyFilter === opt.id}
                      onChange={() => updateFilter('difficulty', opt.id)}
                      className="mr-3 text-brand-forest focus:ring-brand-forest accent-brand-forest"
                    />
                    {opt.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Section: Size */}
          <div className="space-y-3 py-2">
            <button 
              onClick={() => toggleSection('size')}
              className="flex justify-between items-center w-full text-left focus:outline-none"
            >
              <h4 className="text-[10px] font-bold uppercase text-brand-forest tracking-widest">Kích cỡ cây</h4>
              {expandedSections.size ? <ChevronUp size={12} className="text-[#888]" /> : <ChevronDown size={12} className="text-[#888]" />}
            </button>
            {expandedSections.size && (
              <div className="space-y-2.5 pt-2 pb-1 animate-fade-in">
                {[
                  { id: 'all', name: 'Tất cả kích thước' },
                  { id: 'small', name: 'Nhỏ (Small)' },
                  { id: 'medium', name: 'Vừa (Medium)' },
                  { id: 'large', name: 'Lớn (Large)' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center text-xs text-[#555] hover:text-brand-forest cursor-pointer transition-colors font-medium">
                    <input
                      type="radio"
                      name="size"
                      checked={sizeFilter === opt.id}
                      onChange={() => updateFilter('size', opt.id)}
                      className="mr-3 text-brand-forest focus:ring-brand-forest accent-brand-forest"
                    />
                    {opt.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* MOBILE FILTER OVERLAY DRAWER */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop overlay optimized for mobile GPU (no blur) */}
            <div className="fixed inset-0 bg-[#0D231A]/50" onClick={() => setShowMobileFilters(false)} />
            <div className="relative flex flex-col w-full max-w-xs bg-brand-cream h-full p-6 shadow-2xl overflow-y-auto animate-slide-right text-left">
              <div className="flex justify-between items-center border-b border-brand-sand pb-4 mb-6">
                <h3 className="font-serif text-lg font-medium text-brand-forest">Bộ lọc</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-1 cursor-pointer"><X size={18} /></button>
              </div>

              <div className="space-y-6">
                {/* Light */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-forest">Yêu cầu ánh sáng</h4>
                  {['all', 'low', 'medium', 'bright'].map((id) => (
                    <button
                      key={id}
                      onClick={() => updateFilter('light', id)}
                      className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                        lightFilter === id ? 'bg-brand-moss text-brand-forest font-semibold' : 'text-brand-charcoal'
                      }`}
                    >
                      {id === 'all' ? 'Tất cả' : id === 'low' ? 'Ánh sáng yếu' : id === 'medium' ? 'Ánh sáng trung bình' : 'Ánh sáng rực rỡ'}
                    </button>
                  ))}
                </div>
                
                {/* Pet */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-forest">Vật nuôi</h4>
                  <button
                    onClick={() => updateFilter('pet', (!petFriendlyOnly).toString())}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs ${
                      petFriendlyOnly ? 'bg-brand-moss text-brand-forest font-semibold' : 'text-brand-charcoal'
                    }`}
                  >
                    <span>An toàn cho thú cưng</span>
                    {petFriendlyOnly && <Check size={14} />}
                  </button>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-forest">Chăm sóc</h4>
                  {['all', 'easy', 'moderate', 'care'].map((id) => (
                    <button
                      key={id}
                      onClick={() => updateFilter('difficulty', id)}
                      className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                        difficultyFilter === id ? 'bg-brand-moss text-brand-forest font-semibold' : 'text-brand-charcoal'
                      }`}
                    >
                      {id === 'all' ? 'Tất cả' : id === 'easy' ? 'Dễ chăm' : id === 'moderate' ? 'Trung bình' : 'Đòi hỏi cao'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 flex gap-2">
                <button
                  onClick={() => { resetFilters(); setShowMobileFilters(false); }}
                  className="flex-1 border border-brand-sand py-4 text-xs font-bold uppercase tracking-widest bg-brand-white text-brand-charcoal cursor-pointer"
                >
                  Xóa
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 bg-brand-forest text-brand-white text-xs font-bold uppercase py-4 tracking-widest cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS GRID (Right Column) - Premium Editorial Cards */}
        <main className="lg:col-span-9">
          {isLoading ? (
            <SkeletonProductGrid />
          ) : dynamicProducts.length === 0 ? (
            <div className="text-center py-24 bg-brand-white border border-brand-sand rounded-none max-w-md mx-auto space-y-5 shadow-xs">
              <span className="text-[10px] uppercase tracking-widest text-brand-clay font-bold block">Không có kết quả</span>
              <h3 className="font-serif text-xl font-light text-brand-forest">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-xs text-brand-slate px-6 leading-relaxed font-medium">
                Hãy thử nới lỏng các bộ lọc hoặc xóa bớt tiêu chí tìm kiếm để hiển thị thêm sản phẩm của chúng tôi.
              </p>
              <button
                onClick={resetFilters}
                className="bg-brand-forest hover:bg-brand-green text-brand-white text-xs font-semibold uppercase tracking-widest px-8 py-4 transition-colors cursor-pointer"
              >
                Đặt lại tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {dynamicProducts.map((plant) => (
                  <ProductCard
                    key={plant.id}
                    plant={plant}
                    activeColor={cardColors[plant.id] || 'Terracotta'}
                    onColorChange={handleColorChange}
                    addToCart={addToCart}
                    potColorsInfo={potColorsInfo}
                  />
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-10 border-t border-brand-sand mt-10">
                  <button
                    onClick={() => currentPage > 1 && updateFilter('page', (currentPage - 1).toString())}
                    disabled={currentPage === 1}
                    className={`px-4 py-2.5 border border-brand-sand text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed bg-brand-beige text-brand-slate'
                        : 'bg-brand-white hover:border-brand-forest text-brand-forest hover:bg-brand-beige'
                    }`}
                  >
                    Trang trước
                  </button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNumber = idx + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => updateFilter('page', pageNumber.toString())}
                        className={`w-9 h-9 border text-[10px] font-bold transition-all cursor-pointer ${
                          currentPage === pageNumber
                            ? 'bg-brand-forest border-brand-forest text-brand-white'
                            : 'border-brand-sand bg-brand-white hover:border-brand-forest text-brand-forest hover:bg-brand-beige'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => currentPage < totalPages && updateFilter('page', (currentPage + 1).toString())}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2.5 border border-brand-sand text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      currentPage === totalPages
                        ? 'opacity-40 cursor-not-allowed bg-brand-beige text-brand-slate'
                        : 'bg-brand-white hover:border-brand-forest text-brand-forest hover:bg-brand-beige'
                    }`}
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
