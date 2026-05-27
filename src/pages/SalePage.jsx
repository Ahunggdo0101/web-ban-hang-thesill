import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';
import SkeletonProductCard from '../components/SkeletonProductCard';
import { useCart } from '../context/CartContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Danh sách potColorsInfo dùng chung
const potColorsInfo = [
  { name: "Terracotta", value: "#D77A61" },
  { name: "Cream", value: "#F5F2EB" },
  { name: "Mint", value: "#C1D5C0" },
  { name: "Charcoal", value: "#3E3E3E" }
];

const filterOptions = {
  benefits: [
    { label: 'Thân thiện với thú cưng', value: 'petFriendly' },
    { label: 'Phù hợp nhất cho người mới bắt đầu', value: 'beginner' },
    { label: 'Dễ chăm sóc', value: 'easy' },
    { label: 'Máy lọc không khí', value: 'cleanAir' },
    { label: 'Ánh sáng yếu', value: 'lowLight' }
  ],
  light: [
    { label: 'Ánh sáng yếu', value: 'low' },
    { label: 'Ánh sáng trung bình', value: 'medium' },
    { label: 'Ánh sáng rực rỡ', value: 'bright' }
  ],
  growth: [
    { label: 'Chậm', value: 'slow' },
    { label: 'Trung bình', value: 'growth-medium' },
    { label: 'Nhanh', value: 'fast' }
  ],
  zone: [
    { label: 'Trong nhà', value: 'indoor' },
    { label: 'Ngoài trời', value: 'outdoor' }
  ],
  type: [
    { label: 'Cây cảnh', value: 'plants' },
    { label: 'Hoa lan', value: 'orchids' },
    { label: 'Chậu trồng', value: 'pots' }
  ],
  features: [
    { label: 'Có hoa', value: 'flowering' },
    { label: 'Dễ nhân giống', value: 'easy-propagation' },
    { label: 'Lá màu sắc', value: 'colorful' }
  ]
};

const filterLabels = {
  benefits: 'Lợi ích của thực vật',
  light: 'Yêu cầu về ánh sáng',
  growth: 'Tốc độ tăng trưởng',
  zone: 'Khu vực trồng trọt',
  type: 'Loại',
  features: 'Đặc trưng'
};

export default function SalePage() {
  useDocumentTitle('Giảm Giá Cửa Hàng | Cây Cảnh Nam Điền');
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Dropdown menu state
  const [activeDropdown, setActiveDropdown] = useState(null); // 'benefits', 'light', 'growth', 'zone', 'type', 'features', 'sort', or null
  const [cardColors, setCardColors] = useState({});

  // Filter state
  const [selectedFilters, setSelectedFilters] = useState({
    benefits: [],
    light: [],
    growth: [],
    zone: [],
    type: [],
    features: []
  });

  const [sortBy, setSortBy] = useState('featured');

  // Ref to close dropdowns when click outside
  const filterBarRef = useRef(null);

  // Initialize countdown timer to a target date (e.g. 3 days from now)
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    targetDate.setHours(targetDate.getHours() + 15);
    targetDate.setMinutes(targetDate.getMinutes() + 38);

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch products from API and simulate discounts
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/products?limit=50`);
        if (!res.ok) throw new Error('Không thể lấy danh sách sản phẩm');
        const data = await res.json();
        
        // Giả lập giảm giá 20% cho các sản phẩm trang khuyến mãi
        const saleProducts = (data.items || []).map(item => ({
          ...item,
          originalPrice: item.price,
          price: Math.round(item.price * 0.8) // Giảm 20%
        }));
        setProducts(saleProducts);
      } catch (err) {
        console.error('Lỗi fetch sản phẩm:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleColorChange = useCallback((plantId, colorName, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCardColors(prev => ({
      ...prev,
      [plantId]: colorName
    }));
  }, []);

  // Handle filter checkbox toggle
  const handleFilterToggle = useCallback((category, value) => {
    setSelectedFilters(prev => {
      const current = prev[category];
      const next = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return {
        ...prev,
        [category]: next
      };
    });
  }, []);

  // Reset a specific filter category
  const handleFilterReset = useCallback((category, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelectedFilters(prev => ({
      ...prev,
      [category]: []
    }));
  }, []);

  // Toggle active dropdown
  const toggleDropdown = useCallback((dropdownName) => {
    setActiveDropdown(prev => (prev === dropdownName ? null : dropdownName));
  }, []);

  // Filtered and Sorted products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Lọc theo các bộ lọc đã chọn
    // Lợi ích thực vật (benefits)
    if (selectedFilters.benefits.length > 0) {
      result = result.filter(item => {
        return selectedFilters.benefits.some(filter => {
          if (filter === 'petFriendly') return item.petFriendly;
          if (filter === 'easy') return item.difficulty === 'easy';
          if (filter === 'beginner') return item.difficulty === 'easy';
          // Mock cleanAir and lowLight if fields not direct
          if (filter === 'cleanAir') return item.size === 'medium' || item.size === 'large';
          if (filter === 'lowLight') return item.light === 'low';
          return true;
        });
      });
    }

    // Yêu cầu ánh sáng (light)
    if (selectedFilters.light.length > 0) {
      result = result.filter(item => selectedFilters.light.includes(item.light));
    }

    // Kích thước/growth/zone/type
    if (selectedFilters.type.length > 0) {
      result = result.filter(item => selectedFilters.type.includes(item.category));
    }

    // 2. Sắp xếp sản phẩm
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedFilters, sortBy]);

  return (
    <div className="w-full bg-brand-cream min-h-screen text-brand-forest">
      
      {/* 1. Countdown Banner màu đỏ */}
      <div className="w-full bg-[#E32B2B] text-brand-cream py-3.5 px-4 text-center tracking-[0.1em] font-medium text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8">
        <span className="font-serif uppercase font-bold tracking-widest">
          CƠ HỘI CUỐI CÙNG — GIẢM GIÁ ĐẾN $200
        </span>
        <div className="flex items-center space-x-3.5 font-mono font-bold text-sm sm:text-base">
          <div className="flex items-center space-x-1">
            <span className="bg-red-800 px-1.5 py-0.5 rounded-sm">{timeLeft.days}</span>
            <span className="text-[9px] uppercase tracking-normal font-sans font-medium text-red-200">NGÀY</span>
          </div>
          <span>:</span>
          <div className="flex items-center space-x-1">
            <span className="bg-red-800 px-1.5 py-0.5 rounded-sm">{timeLeft.hours}</span>
            <span className="text-[9px] uppercase tracking-normal font-sans font-medium text-red-200">GIỜ</span>
          </div>
          <span>:</span>
          <div className="flex items-center space-x-1">
            <span className="bg-red-800 px-1.5 py-0.5 rounded-sm">{timeLeft.minutes}</span>
            <span className="text-[9px] uppercase tracking-normal font-sans font-medium text-red-200">PHÚT</span>
          </div>
          <span>:</span>
          <div className="flex items-center space-x-1">
            <span className="bg-red-800 px-1.5 py-0.5 rounded-sm">{timeLeft.seconds}</span>
            <span className="text-[9px] uppercase tracking-normal font-sans font-medium text-red-200">GIÂY</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* 2. Tiêu đề Khuyến mãi */}
        <div className="text-left mb-12">
          <h1 className="font-serif text-4xl sm:text-6xl font-light leading-tight text-brand-forest mt-2">
            Khuyến mãi nhân dịp Ngày Tưởng niệm
          </h1>
          <p className="text-sm sm:text-base text-brand-slate max-w-3xl mt-4 font-normal leading-relaxed">
            Từ những cây cảnh trong nhà cỡ lớn ấn tượng đến những loại cây hoa quả được yêu thích trồng ngoài hiên, hãy mua sắm với giá tốt nhất mùa này trong chương trình khuyến mãi Ngày Tưởng niệm của chúng tôi.
          </p>
        </div>

        {/* 3. Thanh bộ lọc ngang thiết kế chuẩn nhỏ gọn (The Sill Style) */}
        <div 
          ref={filterBarRef} 
          className="w-full border-b border-brand-sand/80 pb-6 mb-12 relative z-30"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Cụm Dropdown bộ lọc phía bên trái */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {Object.keys(filterOptions).map((category) => {
                const isSelected = selectedFilters[category].length > 0;
                const isOpen = activeDropdown === category;

                return (
                  <div key={category} className="relative">
                    <button
                      onClick={() => toggleDropdown(category)}
                      className={`inline-flex items-center gap-1 py-1.5 border-b-2 text-xs font-semibold cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'border-brand-forest text-brand-forest font-bold' 
                          : isOpen 
                            ? 'border-[#888] text-brand-forest' 
                            : 'border-transparent text-[#666] hover:text-brand-forest hover:border-[#aaa]'
                      }`}
                    >
                      <span>{filterLabels[category]}</span>
                      <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-forest' : 'text-[#888]'}`} />
                    </button>

                    {/* Pop-down menu nhỏ gọn màu trắng chứa checkbox */}
                    {isOpen && (
                      <div className="absolute left-0 mt-2 w-64 bg-brand-white border border-brand-sand shadow-lg py-3 px-4 z-40 animate-fade-in text-left">
                        {/* Header của Pop-down */}
                        <div className="flex items-center justify-between border-b border-brand-sand pb-2 mb-3">
                          <span className="text-[10px] text-[#666] font-medium">
                            {selectedFilters[category].length > 0 
                              ? `${selectedFilters[category].length} được chọn` 
                              : '0 được chọn • Phù hợp tất cả'
                            }
                          </span>
                          {selectedFilters[category].length > 0 && (
                            <button
                              onClick={(e) => handleFilterReset(category, e)}
                              className="text-[10px] text-brand-clay font-bold uppercase hover:underline cursor-pointer"
                            >
                              Cài lại
                            </button>
                          )}
                        </div>

                        {/* List checkbox */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {filterOptions[category].map((opt) => {
                            const checked = selectedFilters[category].includes(opt.value);
                            return (
                              <label 
                                key={opt.value} 
                                className="flex items-center space-x-2.5 text-xs font-medium text-brand-charcoal hover:text-brand-forest cursor-pointer py-0.5 select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleFilterToggle(category, opt.value)}
                                  className="w-3.5 h-3.5 accent-brand-forest border-brand-sand cursor-pointer"
                                />
                                <span>{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cụm Sắp xếp & Số lượng sản phẩm phía bên phải */}
            <div className="flex items-center justify-between lg:justify-end gap-6 flex-shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-brand-sand/40">
              
              {/* Dropdown Sắp xếp */}
              <div className="relative">
                <span className="text-xs text-[#666] mr-2">Sắp xếp theo:</span>
                <button
                  onClick={() => toggleDropdown('sort')}
                  className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-brand-forest border-b border-[#bbb] hover:border-brand-forest cursor-pointer transition-all"
                >
                  <span>
                    {sortBy === 'featured' && 'Nổi bật'}
                    {sortBy === 'price-asc' && 'Giá: Thấp đến Cao'}
                    {sortBy === 'price-desc' && 'Giá: Cao đến Thấp'}
                    {sortBy === 'rating' && 'Đánh giá cao nhất'}
                  </span>
                  <ChevronDown size={11} className="text-[#888]" />
                </button>

                {activeDropdown === 'sort' && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-white border border-brand-sand shadow-lg py-2 z-40 animate-fade-in text-left">
                    <button
                      onClick={() => { setSortBy('featured'); setActiveDropdown(null); }}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-brand-cream transition-colors ${sortBy === 'featured' ? 'font-bold text-brand-forest' : 'text-brand-charcoal'}`}
                    >
                      Nổi bật
                    </button>
                    <button
                      onClick={() => { setSortBy('price-asc'); setActiveDropdown(null); }}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-brand-cream transition-colors ${sortBy === 'price-asc' ? 'font-bold text-brand-forest' : 'text-brand-charcoal'}`}
                    >
                      Giá: Thấp đến Cao
                    </button>
                    <button
                      onClick={() => { setSortBy('price-desc'); setActiveDropdown(null); }}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-brand-cream transition-colors ${sortBy === 'price-desc' ? 'font-bold text-brand-forest' : 'text-brand-charcoal'}`}
                    >
                      Giá: Cao đến Thấp
                    </button>
                    <button
                      onClick={() => { setSortBy('rating'); setActiveDropdown(null); }}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-brand-cream transition-colors ${sortBy === 'rating' ? 'font-bold text-brand-forest' : 'text-brand-charcoal'}`}
                    >
                      Đánh giá cao nhất
                    </button>
                  </div>
                )}
              </div>

              {/* Đếm số sản phẩm */}
              <span className="text-xs text-[#666] font-medium">
                {isLoading ? '...' : `${processedProducts.length} sản phẩm`}
              </span>
            </div>

          </div>
        </div>

        {/* 4. Grid hiển thị danh sách sản phẩm khuyến mãi */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-brand-clay font-medium flex flex-col items-center gap-4">
            <span>Đã xảy ra lỗi: {error}</span>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-brand-forest text-brand-cream px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-brand-green transition-colors cursor-pointer"
            >
              <RefreshCw size={14} /> Thử lại
            </button>
          </div>
        ) : processedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {processedProducts.map((plant) => (
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
        ) : (
          <div className="text-center py-24 bg-brand-white border border-brand-sand max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center mx-auto text-brand-clay">
              <SlidersHorizontal size={24} className="stroke-1.5" />
            </div>
            <div className="space-y-2 px-6">
              <h3 className="font-serif text-xl text-brand-forest font-medium">Không tìm thấy sản phẩm</h3>
              <p className="text-xs text-[#666] max-w-xs mx-auto leading-relaxed font-semibold">
                Rất tiếc, các bộ lọc hiện tại của bạn không khớp với bất kỳ sản phẩm đang giảm giá nào.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setSelectedFilters({ benefits: [], light: [], growth: [], zone: [], type: [], features: [] })}
                className="inline-block bg-brand-forest text-brand-cream text-[10px] font-bold uppercase tracking-widest px-8 py-4 hover:bg-brand-green transition-colors cursor-pointer"
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
