import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';
import SkeletonProductCard from '../components/SkeletonProductCard';
import { useCart } from '../context/CartContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { optimizeUnsplashImage } from '../utils/image';

const defaultTrendingItems = [
  {
    productId: 'olive-tree-black',
    image: 'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?auto=format&fit=crop&w=600&q=80',
    title: 'Cây ô liu đen',
    desc: 'Cây ngoài trời sang trọng tạo điểm nhấn Địa Trung Hải',
    price: 'Từ 279 đô la',
    badge: '☆ Ưu đãi đặc biệt!',
    rating: 5,
    reviewsCount: 12
  },
  {
    productId: 'meyer-lemon',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
    title: 'Cây chanh Meyer',
    desc: 'Cây ăn quả ngoài trời cho trái vàng mọng nước',
    price: 'Từ 99 đô la',
    badge: '❤ Sản phẩm bán chạy',
    rating: 5,
    reviewsCount: 38
  },
  {
    productId: 'e-gift-card',
    image: '/images/thesill_giftcard.png',
    title: 'Thẻ quà tặng điện tử',
    desc: 'Ghi chú quà tặng',
    price: 'Từ 50 đô la',
    badge: '',
    rating: 5,
    reviewsCount: 2
  },
  {
    productId: 'bougainvillea-pink',
    image: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=600&q=80',
    title: 'Hoa giấy hồng rực rỡ',
    desc: 'Cây leo giàn chịu nắng cực tốt',
    price: 'Từ 89 đô la',
    badge: '✿ Màu sắc mới',
    rating: 5,
    reviewsCount: 7
  }
];

// Danh sách màu chậu dùng chung cho ProductCard
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
    { label: 'Cây ăn quả/Có hoa', value: 'cleanAir' },
    { label: 'Chịu nắng mạnh', value: 'brightSun' }
  ],
  light: [
    { label: 'Bóng râm bán phần', value: 'medium' },
    { label: 'Nắng toàn phần', value: 'bright' }
  ],
  growth: [
    { label: 'Chậm', value: 'slow' },
    { label: 'Trung bình', value: 'growth-medium' },
    { label: 'Nhanh', value: 'fast' }
  ],
  type: [
    { label: 'Cây cảnh', value: 'plants' },
    { label: 'Chậu trồng', value: 'pots' }
  ]
};

const filterLabels = {
  benefits: 'Lợi ích của thực vật',
  light: 'Yêu cầu về ánh sáng',
  growth: 'Tốc độ tăng trưởng',
  type: 'Loại'
};

export default function OutdoorPlantsPage() {
  useDocumentTitle('Cây trồng ngoài trời | Nghệ Nhân Cây Cảnh Đỗ Xuân Hùng');
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendingConfig, setTrendingConfig] = useState(null);

  // Trạng thái menu dropdown đang hoạt động
  const [activeDropdown, setActiveDropdown] = useState(null); // 'benefits', 'light', 'growth', 'type', 'sort' hoặc null
  const [cardColors, setCardColors] = useState({});

  // Đọc bộ lọc và sắp xếp từ URL
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const ITEMS_PER_PAGE = 36; // Phân trang 36 sản phẩm trên một trang (12x3 grid)

  // Khởi tạo state bộ lọc từ URL query params
  const [selectedFilters, setSelectedFilters] = useState({
    benefits: [],
    light: [],
    growth: [],
    type: []
  });

  const [sortBy, setSortBy] = useState('featured');

  // Cập nhật state khi URL search params thay đổi
  useEffect(() => {
    const urlSort = searchParams.get('sort') || 'featured';
    setSortBy(urlSort);

    const newFilters = {
      benefits: [],
      light: [],
      growth: [],
      type: []
    };

    // Đọc tham số light
    const urlLight = searchParams.get('light');
    if (urlLight && filterOptions.light.some(o => o.value === urlLight)) {
      newFilters.light.push(urlLight);
    }

    // Đọc tham số difficulty
    const urlDifficulty = searchParams.get('difficulty');
    if (urlDifficulty === 'easy') {
      newFilters.benefits.push('easy');
    }

    // Đọc tham số pet
    const urlPet = searchParams.get('pet');
    if (urlPet === 'true') {
      newFilters.benefits.push('petFriendly');
    }

    setSelectedFilters(newFilters);
  }, [searchParams]);

  // Ref để đóng dropdown khi click bên ngoài
  const filterBarRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch các sản phẩm ngoài trời và cấu hình slots từ backend
  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Gọi lấy danh sách toàn bộ sản phẩm để lọc (category=outdoor-plants)
        const productsRes = await fetch(`${API_BASE_URL}/products?limit=250`);
        if (!productsRes.ok) throw new Error('Không thể tải danh sách sản phẩm');
        const productsData = await productsRes.json();
        const filteredList = (productsData.items || []).filter(p => p.category === 'outdoor-plants');
        
        // 2. Gọi lấy cấu hình vị trí slots của Cây ngoài trời
        const configRes = await fetch(`${API_BASE_URL}/collection-config/outdoor-plants`);
        let loadedSlots = [];
        let loadedTrending = null;
        if (configRes.ok) {
          const configData = await configRes.json();
          loadedSlots = configData.slots || [];
          loadedTrending = configData.trending || null;
        }

        setProducts(filteredList);
        setSlots(loadedSlots);
        setTrendingConfig(loadedTrending);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang cây ngoài trời:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadPageData();
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

  // Cập nhật URL search params
  const updateUrlParams = useCallback((newFilters, newSort, newPage = 1) => {
    const params = new URLSearchParams();
    
    if (newSort && newSort !== 'featured') {
      params.set('sort', newSort);
    }
    
    // Ghi các bộ lọc vào URL
    if (newFilters.light.length === 1) {
      params.set('light', newFilters.light[0]);
    }
    if (newFilters.benefits.includes('easy')) {
      params.set('difficulty', 'easy');
    }
    if (newFilters.benefits.includes('petFriendly')) {
      params.set('pet', 'true');
    }

    if (newPage > 1) {
      params.set('page', newPage.toString());
    }

    setSearchParams(params);
  }, [setSearchParams]);

  // Bật/tắt một filter checkbox
  const handleFilterToggle = useCallback((category, value) => {
    setSelectedFilters(prev => {
      const current = prev[category];
      const next = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      
      const updatedFilters = {
        ...prev,
        [category]: next
      };

      updateUrlParams(updatedFilters, sortBy, 1); // Reset về trang 1 khi lọc
      return updatedFilters;
    });
  }, [sortBy, updateUrlParams]);

  // Xóa trắng một mục lọc
  const handleFilterReset = useCallback((category, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelectedFilters(prev => {
      const updatedFilters = {
        ...prev,
        [category]: []
      };
      updateUrlParams(updatedFilters, sortBy, 1);
      return updatedFilters;
    });
  }, [sortBy, updateUrlParams]);

  // Bật/tắt dropdown
  const toggleDropdown = useCallback((dropdownName) => {
    setActiveDropdown(prev => (prev === dropdownName ? null : dropdownName));
  }, []);

  // Xử lý Lọc và Sắp xếp phía client
  const processedProducts = useMemo(() => {
    // 1. Áp dụng các bộ lọc của khách hàng lên danh sách sản phẩm
    let filteredList = [...products];

    // Lọc theo benefits
    if (selectedFilters.benefits.length > 0) {
      filteredList = filteredList.filter(item => {
        return selectedFilters.benefits.some(filter => {
          if (filter === 'petFriendly') return item.petFriendly;
          if (filter === 'easy') return item.difficulty === 'easy';
          if (filter === 'beginner') return item.difficulty === 'easy';
          if (filter === 'cleanAir') return item.category === 'outdoor-plants';
          if (filter === 'brightSun') return item.light === 'bright';
          return true;
        });
      });
    }

    // Lọc theo light
    if (selectedFilters.light.length > 0) {
      filteredList = filteredList.filter(item => selectedFilters.light.includes(item.light));
    }

    // Lọc theo type
    if (selectedFilters.type.length > 0) {
      filteredList = filteredList.filter(item => selectedFilters.type.includes(item.category));
    }

    // 2. Sắp xếp hoặc áp dụng thứ tự slots cấu hình bởi Admin
    if (sortBy === 'featured') {
      const displayList = [];
      const pinnedIds = new Set(slots.filter(Boolean));
      
      // Lấy các sản phẩm chưa được gán cố định vào slots
      const unpinnedProducts = filteredList.filter(p => !pinnedIds.has(p.id));
      // Xếp sản phẩm chưa gán theo ngày tạo mới nhất trước
      unpinnedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      let unpinnedIdx = 0;

      // Duyệt qua từng slot để điền đầy lưới hiển thị
      for (let i = 0; i < slots.length; i++) {
        const slotProductId = slots[i];
        if (slotProductId) {
          // Lấy sản phẩm gán ở vị trí này
          const prod = filteredList.find(p => p.id === slotProductId);
          if (prod) {
            displayList.push({
              ...prod,
              _uniqueKey: `${prod.id}-slot-${i}`
            });
          }
        } else {
          // Ô trống: điền bằng sản phẩm chưa gán tiếp theo
          if (unpinnedIdx < unpinnedProducts.length) {
            const prod = unpinnedProducts[unpinnedIdx++];
            displayList.push({
              ...prod,
              _uniqueKey: `${prod.id}-unpinned-${i}`
            });
          }
        }
      }

      // Append tất cả các sản phẩm chưa gán còn lại vào cuối
      while (unpinnedIdx < unpinnedProducts.length) {
        const prod = unpinnedProducts[unpinnedIdx++];
        displayList.push({
          ...prod,
          _uniqueKey: `${prod.id}-end-${unpinnedIdx}`
        });
      }

      return displayList;
    } else {
      // Sắp xếp thông thường đối với các lựa chọn khác
      const sortedList = [...filteredList].map(p => ({ ...p, _uniqueKey: p.id }));
      if (sortBy === 'newest') {
        sortedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'price-asc' || sortBy === 'price_asc') {
        sortedList.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc' || sortBy === 'price_desc') {
        sortedList.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating' || sortBy === 'rating_desc') {
        sortedList.sort((a, b) => b.rating - a.rating);
      }
      return sortedList;
    }
  }, [products, selectedFilters, sortBy, slots]);

  // Phân trang sản phẩm trên Client
  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedProducts, currentPage]);

  // Cuộn mượt lên đầu danh sách khi chuyển trang
  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      window.scrollTo({ top: 250, behavior: 'smooth' });
    } else {
      isMounted.current = true;
    }
  }, [currentPage]);

  return (
    <div className="w-full bg-brand-cream min-h-screen text-brand-forest">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] py-16">
        
        {/* Tiêu đề & Mô tả đầu trang */}
        <div className="text-left mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-light leading-tight text-brand-forest mt-2">
            Cây ngoài trời
          </h1>
          <p className="text-base sm:text-lg text-brand-slate max-w-3xl mt-4 font-normal leading-relaxed">
            Bộ sưu tập các loại cây trồng ngoài trời sống khỏe, ưa nắng gió giúp biến ban công, sân hiên, hay khu vườn của bạn thành một ốc đảo xanh mát và tràn đầy sinh khí.
          </p>
        </div>

        {/* Thanh lọc & Sắp xếp ngang (Filter & Sort Bar) */}
        <div 
          ref={filterBarRef} 
          className="w-full border-b border-brand-sand/80 pb-6 mb-12 relative z-30"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Nhóm nút lọc dropdown bên trái */}
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

                    {/* Pop-down panel hiển thị các lựa chọn */}
                    {isOpen && (
                      <div className="absolute left-0 mt-2 w-64 bg-brand-white border border-brand-sand shadow-lg py-3 px-4 z-40 animate-fade-in text-left">
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

            {/* Nhóm Sắp xếp & Đếm sản phẩm bên phải */}
            <div className="flex items-center justify-between lg:justify-end gap-6 flex-shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-brand-sand/40">
              
              {/* Bộ chọn Sắp xếp */}
              <div className="relative">
                <span className="text-xs text-[#666] mr-2">Sắp xếp theo:</span>
                <button
                  onClick={() => toggleDropdown('sort')}
                  className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-brand-forest border-b border-[#bbb] hover:border-brand-forest cursor-pointer transition-all"
                >
                  <span>
                    {(sortBy === 'featured' || sortBy === 'newest') && 'Nổi bật'}
                    {(sortBy === 'price-asc' || sortBy === 'price_asc') && 'Giá: Thấp đến Cao'}
                    {(sortBy === 'price-desc' || sortBy === 'price_desc') && 'Giá: Cao đến Thấp'}
                    {(sortBy === 'rating' || sortBy === 'rating_desc') && 'Đánh giá cao nhất'}
                  </span>
                  <ChevronDown size={11} className="text-[#888]" />
                </button>

                {activeDropdown === 'sort' && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-white border border-brand-sand shadow-lg py-2 z-40 animate-fade-in text-left">
                    <button
                      onClick={() => { setSortBy('featured'); updateUrlParams(selectedFilters, 'featured', 1); setActiveDropdown(null); }}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-brand-cream transition-colors ${sortBy === 'featured' || sortBy === 'newest' ? 'font-bold text-brand-forest' : 'text-brand-charcoal'}`}
                    >
                      Nổi bật
                    </button>
                    <button
                      onClick={() => { setSortBy('price_asc'); updateUrlParams(selectedFilters, 'price_asc', 1); setActiveDropdown(null); }}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-brand-cream transition-colors ${sortBy === 'price_asc' || sortBy === 'price-asc' ? 'font-bold text-brand-forest' : 'text-brand-charcoal'}`}
                    >
                      Giá: Thấp đến Cao
                    </button>
                    <button
                      onClick={() => { setSortBy('price_desc'); updateUrlParams(selectedFilters, 'price_desc', 1); setActiveDropdown(null); }}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-brand-cream transition-colors ${sortBy === 'price_desc' || sortBy === 'price-desc' ? 'font-bold text-brand-forest' : 'text-brand-charcoal'}`}
                    >
                      Giá: Cao đến Thấp
                    </button>
                    <button
                      onClick={() => { setSortBy('rating_desc'); updateUrlParams(selectedFilters, 'rating_desc', 1); setActiveDropdown(null); }}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-brand-cream transition-colors ${sortBy === 'rating_desc' || sortBy === 'rating' ? 'font-bold text-brand-forest' : 'text-brand-charcoal'}`}
                    >
                      Đánh giá cao nhất
                    </button>
                  </div>
                )}
              </div>

              {/* Số lượng sản phẩm */}
              <span className="text-xs text-[#666] font-medium">
                {isLoading ? '...' : `${processedProducts.length} sản phẩm`}
              </span>
            </div>

          </div>
        </div>

        {/* Lưới sản phẩm */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[12px] gap-y-16 animate-pulse">
            {[...Array(3)].map((_, i) => (
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
        ) : paginatedProducts.length > 0 ? (
          <div className="space-y-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[12px] gap-y-16">
              {paginatedProducts.map((plant) => (
                <ProductCard
                  key={plant._uniqueKey || plant.id}
                  plant={plant}
                  activeColor={cardColors[plant.id] || 'Terracotta'}
                  onColorChange={handleColorChange}
                  addToCart={addToCart}
                  potColorsInfo={potColorsInfo}
                />
              ))}
            </div>

            {/* Phân trang (Pagination) */}
            {totalPages >= 1 && (
              <div className="flex justify-center items-center space-x-12 mt-20 py-3 border-y border-brand-sand/60 w-full">
                {/* Nút trang trước (<) */}
                {currentPage > 1 && (
                  <button
                    onClick={() => updateUrlParams(selectedFilters, sortBy, currentPage - 1)}
                    className="text-[13px] pb-1 px-1.5 cursor-pointer transition-colors text-brand-slate/80 hover:text-brand-charcoal font-light font-sans"
                    title="Trang trước"
                  >
                    &lt;
                  </button>
                )}

                {/* Các số trang */}
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNumber = idx + 1;
                  const isActive = currentPage === pageNumber;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => updateUrlParams(selectedFilters, sortBy, pageNumber)}
                      className={`text-[13px] px-1.5 pb-1 transition-all cursor-pointer font-sans ${
                        isActive
                          ? 'border-b-[1.5px] border-brand-charcoal text-brand-charcoal font-medium'
                          : 'text-brand-slate/80 hover:text-brand-charcoal font-light border-b-[1.5px] border-transparent'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Nút trang sau (>) */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => updateUrlParams(selectedFilters, sortBy, currentPage + 1)}
                    className="text-[13px] pb-1 px-1.5 cursor-pointer transition-colors text-brand-slate/80 hover:text-brand-charcoal font-light font-sans"
                    title="Trang sau"
                  >
                    &gt;
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-brand-white border border-brand-sand max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center mx-auto text-brand-clay">
              <SlidersHorizontal size={24} className="stroke-1.5" />
            </div>
            <div className="space-y-2 px-6">
              <h3 className="font-serif text-xl text-brand-forest font-medium">Không tìm thấy sản phẩm</h3>
              <p className="text-xs text-[#666] max-w-xs mx-auto leading-relaxed font-semibold">
                Rất tiếc, các bộ lọc hiện tại của bạn không khớp với bất kỳ cây ngoài trời nào.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedFilters({ benefits: [], light: [], growth: [], type: [] });
                  updateUrlParams({ benefits: [], light: [], growth: [], type: [] }, 'featured', 1);
                }}
                className="inline-block bg-brand-forest text-brand-cream text-[10px] font-bold uppercase tracking-widest px-8 py-4 hover:bg-brand-green transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        )}

        {/* Section Trending: Những loại cây này đang trở nên phổ biến */}
        <div className="mt-24 border-t border-brand-sand/40 pt-16">
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-forest mb-10 text-left font-normal">
            {trendingConfig?.title || "Những loại cây này đang trở nên phổ biến."}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[12px] gap-y-12">
            {(trendingConfig?.items || defaultTrendingItems).map((item, index) => {
              if (!item) return null;
              
              // Xác định màu sắc của badge
              const isAnniversary = item.badge && item.badge.includes('kỷ niệm');
              const badgeBg = isAnniversary ? 'bg-[#d46d4f]' : 'bg-[#23A696]';

              return (
                <div key={index} className="flex flex-col text-left group">
                  {/* Container Ảnh */}
                  <div className="aspect-[4/5] bg-brand-white border border-brand-sand overflow-hidden relative mb-4">
                    {item.image ? (
                      <img
                        src={optimizeUnsplashImage(item.image, 500)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#aaa]">Không có ảnh</div>
                    )}

                    {/* Badge trên ảnh */}
                    {item.badge && (
                      <span className={`absolute top-2.5 left-2.5 ${badgeBg} text-brand-cream text-[9px] font-semibold px-2 py-1 select-none`}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Thông tin chữ */}
                  <div className="space-y-1 pl-1">
                    <h3 className="font-serif text-[17px] text-[#2A2D24] font-normal group-hover:underline truncate leading-[1.6] tracking-[0.02em]">
                      {item.productId ? (
                        <a href={`/product/${item.productId}`} className="hover:text-[#007b5f] transition-colors">
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                    </h3>
                    
                    {item.desc && (
                      <p className="text-[13px] text-[#666] italic font-sans truncate">
                        {item.desc}
                      </p>
                    )}

                    {/* Stars Rating */}
                    {item.reviewsCount > 0 && (
                      <div className="flex items-center gap-1.5 py-0.5">
                        <div className="flex text-brand-forest text-xs">
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <span className="text-[11px] text-brand-slate font-medium">
                          {item.reviewsCount} đánh giá
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-[#1c1c1c] font-semibold mt-1">
                      {item.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Khối Nội dung Giới thiệu & FAQ (SEO Content) */}
        <div className="mt-24 border-t border-brand-sand/30 pt-16 max-w-5xl text-left space-y-8 pb-12">
          <div className="space-y-6">
            <h2 className="font-serif text-3xl md:text-[34px] font-normal text-brand-forest tracking-wide mb-6">
              Cây trồng ngoài trời & Cây cảnh không gian sân vườn, ban công
            </h2>
            
            <div className="space-y-8 text-brand-charcoal text-base md:text-[16.5px] leading-[1.8]">
              
              <div className="space-y-2">
                <h3 className="font-serif text-lg md:text-xl lg:text-[21px] font-normal text-brand-forest mt-4">
                  Cây xanh ngoài trời mang lại vẻ đẹp tự nhiên và sức sống mãnh liệt.
                </h3>
                <p className="text-brand-slate/95">
                  Tận hưởng không gian mở ngập tràn hoa lá ngay tại gia. Bộ sưu tập cây trồng ngoài trời của chúng tôi bao gồm các loại cây cảnh chịu nắng, hoa leo giàn, cây ăn quả nhỏ và cây cảnh ban công độc đáo giúp biến các khoảng không như ban công, sân thượng hoặc lối vào thành một khu vườn tươi tắn.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-lg md:text-xl lg:text-[21px] font-normal text-brand-forest mt-4">
                  Các loại cây ngoài trời phổ biến:
                </h3>
                <p className="text-brand-slate/95">
                  Từ những chậu hoa nhài ta thơm ngát, hoa giấy rực rỡ chịu nắng, đến các cây ăn quả như chanh Meyer hay cây ô liu quý phái, chúng tôi mang tới những lựa chọn cây ngoài trời khỏe khoắn và đa dạng. Các cây này được chọn lọc vì khả năng chống chọi tốt với thời tiết nắng nóng, gió ban công hoặc thay đổi nhiệt độ đột ngột ngoài tự nhiên.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-lg md:text-xl lg:text-[21px] font-normal text-brand-forest mt-4">
                  Cách chăm sóc cây ngoài trời có phức tạp không?
                </h3>
                <p className="text-brand-slate/95">
                  Chăm sóc cây ngoài trời có phần khác biệt so với cây trong nhà vì chúng tiếp xúc trực tiếp với các điều kiện thời tiết tự nhiên. Nhu cầu nước tưới của cây ngoài trời sẽ cao hơn, đặc biệt là trong những ngày hè oi bức. Chỉ cần đảm bảo tưới đủ nước định kỳ và chọn chậu có lỗ thoát nước tốt để tránh ngập úng, cây ngoài trời sẽ phát triển vô cùng mạnh mẽ.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-lg md:text-xl lg:text-[21px] font-normal text-brand-forest mt-4">
                  Cây ngoài trời giúp thanh lọc và làm dịu nhiệt độ ngôi nhà:
                </h3>
                <p className="text-brand-slate/95">
                  Việc trồng nhiều cây ngoài ban công hay sân hiên không chỉ tăng tính thẩm mỹ cho ngôi nhà mà còn đóng vai trò như một lá chắn xanh tự nhiên lọc bụi bẩn, giảm tiếng ồn và giúp hạ nhiệt độ không khí trước khi vào trong phòng. Một giàn hoa leo hay vài chậu cây đặt sát lan can sẽ biến không gian thư giãn ngoài trời của bạn thành nơi lý tưởng để đọc sách, uống trà.
                </p>
              </div>

              {/* Các câu hỏi thường gặp (FAQ) */}
              <div className="space-y-8 pt-6 border-t border-brand-sand/30">
                
                <div className="space-y-2">
                  <h4 className="font-serif text-lg md:text-[20px] italic font-normal text-brand-forest mt-4">
                    Những loại cây ngoài trời nào chịu nắng nóng tốt nhất cho ban công hướng Tây?
                  </h4>
                  <p className="text-brand-slate/95">
                    Các loại cây chịu nắng toàn phần xuất sắc bao gồm hoa giấy, cây ô liu, các loại cúc, cau cảnh chịu nắng và hoa sứ. Chúng đều yêu thích ánh sáng mạnh trực tiếp và có cơ chế giữ nước hiệu quả để thích nghi dưới thời tiết gay gắt.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-lg md:text-[20px] italic font-normal text-brand-forest mt-4">
                    Nên tưới nước cho cây ngoài trời vào lúc nào và bao lâu một lần?
                  </h4>
                  <p className="text-brand-slate/95">
                    Thời điểm tốt nhất để tưới nước cho cây ngoài trời là vào sáng sớm hoặc chiều mát, tránh tưới vào giữa trưa khi trời nắng gắt vì giọt nước có thể hoạt động như thấu kính làm cháy lá hoặc gây sốc nhiệt cho rễ. Tần suất tưới thông thường là 1-2 lần mỗi ngày tùy thuộc vào thời tiết và độ giữ nước của đất.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif text-lg md:text-[20px] italic font-normal text-brand-forest mt-4">
                    Làm thế nào để bảo vệ cây ngoài ban công khi có giông bão?
                  </h4>
                  <p className="text-brand-slate/95">
                    Khi có dự báo thời tiết xấu hoặc gió bão mạnh, hãy di chuyển các chậu cây nhỏ hoặc giỏ treo vào khu vực có mái che hoặc sát tường nhà. Đối với các chậu cây lớn, hãy cố định chậu chắc chắn hoặc đặt chúng nằm xuống để tránh bị đổ vỡ gây nguy hiểm.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
