import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Star, ChevronRight, BookOpen, X, Smile, ShieldCheck } from 'lucide-react';
import { optimizeUnsplashImage } from '../utils/image';
import ProductCard from '../components/ProductCard';
import SkeletonProductCard from '../components/SkeletonProductCard';
import { journals } from '../data/journals';
import useScrollAnimation from '../hooks/useScrollAnimation';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';

const potColorsInfo = [
  { name: "Terracotta", value: "#D77A61" },
  { name: "Cream", value: "#F5F2EB" },
  { name: "Mint", value: "#C1D5C0" },
  { name: "Charcoal", value: "#3E3E3E" }
];

export default function Home() {
  useDocumentTitle('Cây Cảnh Nội Thất Cao Cấp');
  const { addToCart } = useCart();
  const [selectedJournal, setSelectedJournal] = useState(null);
  const { getItems } = useRecentlyViewed();
  const [bestSellers, setBestSellers] = useState([]);
  const [isLoadingBestSellers, setIsLoadingBestSellers] = useState(true);
  const [viewedIds, setViewedIds] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);

  // Fetch Best Sellers
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products?limit=4&sortBy=rating_desc`);
        if (res.ok) {
          const data = await res.json();
          setBestSellers(data.items || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải Best Sellers:", error);
      } finally {
        setIsLoadingBestSellers(false);
      }
    };
    fetchBestSellers();
  }, []);

  // Lấy danh sách ID đã xem từ localStorage khi component mount
  useEffect(() => {
    setViewedIds(getItems());
  }, []);

  // Đồng bộ Recently Viewed Products
  useEffect(() => {
    if (viewedIds.length === 0) {
      setRecentlyViewedProducts([]);
      return;
    }

    const fetchRecentlyViewed = async () => {
      const items = [];
      const missingIds = [];

      // Kiểm tra xem ID nào đã có sẵn trong bestSellers để tái sử dụng
      for (const id of viewedIds) {
        const found = bestSellers.find((p) => p.id === id);
        if (found) {
          items.push(found);
        } else {
          missingIds.push(id);
        }
      }

      if (missingIds.length > 0) {
        try {
          // Fetch các sản phẩm còn thiếu song song
          const promises = missingIds.map((id) =>
            fetch(`${API_BASE_URL}/products/${id}`)
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null)
          );
          const fetchedItems = await Promise.all(promises);
          items.push(...fetchedItems.filter(Boolean));
        } catch (error) {
          console.error("Lỗi khi tải Recently Viewed:", error);
        }
      }

      // Sắp xếp lại theo đúng thứ tự lịch sử xem
      const orderedItems = viewedIds
        .map((id) => items.find((p) => p.id === id))
        .filter(Boolean);

      setRecentlyViewedProducts(orderedItems);
    };

    fetchRecentlyViewed();
  }, [viewedIds, bestSellers]);

  const [categoriesRef, categoriesVisible] = useScrollAnimation();
  const [bestSellersRef, bestSellersVisible] = useScrollAnimation();
  const [quizRef, quizVisible] = useScrollAnimation();
  const [whyRef, whyVisible] = useScrollAnimation();
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation();
  const [journalRef, journalVisible] = useScrollAnimation();
  const [recentRef, recentVisible] = useScrollAnimation();

  // Keep track of selected pot color for each product card
  const [productColors, setProductColors] = useState({});

  const handleColorChange = useCallback((productId, colorName) => {
    setProductColors(prev => ({
      ...prev,
      [productId]: colorName
    }));
  }, []);

  const categories = [
    {
      title: "Cây Dễ Chăm Sóc",
      image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=300",
      path: "/shop?difficulty=easy"
    },
    {
      title: "An Toàn Thú Cưng",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=300",
      path: "/shop?pet=true"
    },
    {
      title: "Cây Kích Thước Lớn",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=300",
      path: "/shop?size=large"
    },
    {
      title: "Cây Ánh Sáng Yếu",
      image: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=300",
      path: "/shop?light=low"
    }
  ];

  return (
    <div className="w-full space-y-16 md:space-y-28 pb-16 md:pb-28 animate-fade-in bg-brand-cream">
      
      {/* 1. Hero & Trust Badges Section - Gộp chung để loại bỏ khoảng cách space-y giữa 2 phần */}
      <div className="w-full flex flex-col">
        {/* 1. Hero Section - Premium Editorial Split Banner */}
        <section className="relative overflow-hidden bg-brand-beige">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            
            <div className="md:col-span-6 space-y-8 text-left">
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
                NGHỆ NHÂN CÂY CẢNH ĐỖ XUÂN HÙNG • NAM ĐỊNH
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-brand-forest font-light leading-[1.08] tracking-tight">
                Nghệ nhân cây cảnh <br />
                <span className="italic text-brand-clay font-normal">Đỗ Xuân Hùng</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#555] leading-relaxed max-w-md font-medium">
                Kiến tạo tổ ấm xanh mát với các loài cây dễ chăm sóc được chọn lọc kỹ lưỡng, kết hợp cùng các dòng chậu gốm thủ công tinh xảo. Đóng gói chuyên nghiệp và vận chuyển trực tiếp đến cửa nhà bạn.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/shop"
                  className="bg-brand-forest hover:bg-brand-green text-brand-white text-[10px] font-bold tracking-widest uppercase px-10 py-5 transition-all duration-300 shadow-sm cursor-pointer hover:-translate-y-0.5 inline-block text-center"
                >
                  MUA SẮM NGAY
                </Link>
                <Link
                  to="/quiz"
                  className="border border-brand-forest bg-transparent hover:bg-brand-moss text-brand-forest text-[10px] font-bold tracking-widest uppercase px-10 py-5 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 inline-block text-center"
                >
                  TRẮC NGHIỆM CHỌN CÂY
                </Link>
              </div>
            </div>

            <div className="md:col-span-6 relative flex justify-center">
              {/* Double framed image overlay */}
              <div className="relative w-full max-w-md aspect-[4/5] bg-brand-white p-4 border border-brand-sand shadow-xs">
                <div className="w-full h-full overflow-hidden border border-brand-sand bg-brand-beige">
                  <img
                    src={optimizeUnsplashImage("https://images.unsplash.com/photo-1585320806297-9794b3e4eeae", 800)}
                    alt="Premium houseplants collection"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[3000ms] ease-out"
                  />
                </div>
                {/* Decorative accent element */}
                <div className="absolute -bottom-4 -left-4 w-24 h-24 border border-brand-sand bg-brand-cream/95 hidden sm:flex items-center justify-center p-3 text-center">
                  <span className="font-serif text-[10px] italic text-brand-forest">100% Cây Khỏe Mạnh</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 1.5. Trust Badges / Divider Section - Sử dụng màu nền #f9f8f7 hài hòa với footer */}
        <section className="bg-[#f9f8f7] border-y border-brand-sand/60 py-12 md:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
              
              {/* Cột 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-brand-forest mt-0.5">
                  {/* SVG watering can */}
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M7 11h8a1 1 0 0 1 1 1v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6a1 1 0 0 1 1-1z" />
                    <path d="M7 13H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2" />
                    <path d="M16 14l5-3" />
                    <path d="M21 9v6" />
                  </svg>
                </div>
                <div className="space-y-1.5 text-left">
                  <h3 className="font-sans text-sm sm:text-base font-bold text-brand-charcoal">
                    Hướng dẫn của chuyên gia
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
                    Thành công bắt đầu từ việc lựa chọn đúng loại cây. Chúng tôi sẽ đảm bảo bạn làm được điều đó.
                  </p>
                </div>
              </div>

              {/* Cột 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-brand-forest mt-0.5">
                  <Smile size={24} strokeWidth={1.5} className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 text-left">
                  <h3 className="font-sans text-sm sm:text-base font-bold text-brand-charcoal">
                    Kết nối & Phát triển
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
                    Cộng đồng là tất cả. Các buổi hội thảo và sự kiện của chúng tôi giúp bạn học hỏi và kết nối.
                  </p>
                </div>
              </div>

              {/* Cột 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-brand-forest mt-0.5">
                  <ShieldCheck size={24} strokeWidth={1.5} className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 text-left">
                  <h3 className="font-sans text-sm sm:text-base font-bold text-brand-charcoal">
                    Dịch vụ không phán xét
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
                    Đội ngũ tận tâm của chúng tôi luôn sẵn sàng hỗ trợ — không có câu hỏi nào là quá nhỏ hay quá ngớ ngẩn!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 1.8. Popular Plants Section - Các loại cây trồng được ưa chuộng nhất hiện nay */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-10 md:pt-12">
          <div className="text-left space-y-1">
            <h2 
              className="text-[26px] sm:text-[32px] md:text-[40px] text-[#2A2D24] font-normal leading-tight tracking-tight"
              style={{ fontFamily: '"Domaine Display", Lora, Georgia, serif' }}
            >
              Các loại cây trồng được ưa chuộng nhất hiện nay
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            
            {/* Cây 1: Cây ô liu */}
            <div className="group flex flex-col space-y-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
                {/* Badge đỏ đặc biệt */}
                <div className="absolute top-0 left-0 z-10 bg-[#e74c3c] text-white text-[9px] font-bold px-2.5 py-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <Star size={10} fill="white" className="text-white" />
                  Ưu đãi đặc biệt nhân dịp kỷ niệm!
                </div>
                <img
                  src={optimizeUnsplashImage("https://images.unsplash.com/photo-1599599810769-bcde5a160d32", 600)}
                  alt="Cây ô liu"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="font-serif text-base sm:text-lg font-medium text-brand-forest hover:text-brand-green transition-colors">
                  <Link to="/shop">Cây ô liu</Link>
                </h3>
                <p className="text-xs sm:text-sm text-brand-slate italic leading-relaxed">
                  Loại cây lý tưởng cho không gian nội thất cao cấp.
                </p>
                {/* Rating */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="flex text-brand-forest">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" className="text-brand-forest" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-brand-slate font-semibold">158 đánh giá</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-brand-charcoal pt-0.5">
                  Từ 59 đô la
                </p>
              </div>
            </div>

            {/* Cây 2: Philodendron Brasil */}
            <div className="group flex flex-col space-y-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
                <img
                  src={optimizeUnsplashImage("https://images.unsplash.com/photo-1597055181300-e3633a207518", 600)}
                  alt="Philodendron Brasil"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="font-serif text-base sm:text-lg font-medium text-brand-forest hover:text-brand-green transition-colors">
                  <Link to="/shop">Philodendron Brasil</Link>
                </h3>
                <p className="text-xs sm:text-sm text-brand-slate italic leading-relaxed">
                  Ánh sáng mạnh hơn làm nổi bật nhiều màu sắc hơn.
                </p>
                {/* Rating */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="flex text-brand-forest">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" className="text-brand-forest" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-brand-slate font-semibold">1 đánh giá</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-brand-charcoal pt-0.5">
                  Từ 69 đô la
                </p>
              </div>
            </div>

            {/* Cây 3: Cây tiền */}
            <div className="group flex flex-col space-y-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
                {/* Badge đỏ đặc biệt */}
                <div className="absolute top-0 left-0 z-10 bg-[#e74c3c] text-white text-[9px] font-bold px-2.5 py-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <Star size={10} fill="white" className="text-white" />
                  Ưu đãi đặc biệt nhân dịp kỷ niệm!
                </div>
                <img
                  src={optimizeUnsplashImage("https://images.unsplash.com/photo-1520412099521-63b16afe9587", 600)}
                  alt="Cây tiền"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="font-serif text-base sm:text-lg font-medium text-brand-forest hover:text-brand-green transition-colors">
                  <Link to="/shop">Cây tiền</Link>
                </h3>
                <p className="text-xs sm:text-sm text-brand-slate italic leading-relaxed">
                  Cây may mắn nguyên thủy
                </p>
                {/* Rating */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="flex text-brand-forest">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" className="text-brand-forest" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-brand-slate font-semibold">66 đánh giá</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-brand-charcoal pt-0.5">
                  Từ 39 đô la
                </p>
              </div>
            </div>

            {/* Cây 4: Chanh Meyer */}
            <div className="group flex flex-col space-y-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
                {/* Badge đỏ đặc biệt */}
                <div className="absolute top-0 left-0 z-10 bg-[#e74c3c] text-white text-[9px] font-bold px-2.5 py-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-0.5 fill-white text-white">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  Ưu đãi đặc biệt
                </div>
                <img
                  src={optimizeUnsplashImage("https://images.unsplash.com/photo-1534531173927-aeb928d54385", 600)}
                  alt="Chanh Meyer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-brand-clay font-bold block uppercase tracking-wide leading-none pb-1">
                  Vùng trồng thích hợp: 4-11 (sân hiên) / 8-11 (ngoài trời)
                </span>
                <h3 className="font-serif text-base sm:text-lg font-medium text-brand-forest hover:text-brand-green transition-colors">
                  <Link to="/shop">Chanh Meyer</Link>
                </h3>
                <p className="text-xs sm:text-sm text-brand-slate italic leading-relaxed">
                  Mua ở cửa hàng &lt; tự trồng tại nhà
                </p>
                {/* Rating */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="flex text-brand-forest">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" className="text-brand-forest" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-brand-slate font-semibold">20 đánh giá</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-brand-charcoal pt-0.5 flex items-center gap-2">
                  <span className="text-brand-forest">Từ $99</span>
                  <span className="text-brand-slate/60 line-through font-normal text-xs">109 đô la</span>
                </p>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* 2. Shop by Category - Circular design like actual thesill.com */}
      <section ref={categoriesRef} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 transition-all duration-700 ${categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold">Danh mục sản phẩm</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light">Chọn cây theo phong cách sống</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.path}
              className="group cursor-pointer flex flex-col items-center text-center space-y-4"
            >
              {/* Circular Container */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-brand-beige border border-brand-sand relative group-hover:border-brand-clay transition-all duration-500 shadow-xs">
                <img
                  src={optimizeUnsplashImage(cat.image, 300)}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest group-hover:text-brand-clay transition-colors flex items-center">
                {cat.title} <ChevronRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Best Sellers Section - Editorial grid with interactive color swatches */}
      <section ref={bestSellersRef} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 transition-all duration-700 ${bestSellersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex justify-between items-end border-b border-brand-sand pb-6">
          <div className="text-left space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold">Lựa chọn hàng đầu</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light">Sản phẩm bán chạy nhất</h2>
          </div>
          <Link
            to="/shop"
            className="text-[10px] font-bold uppercase tracking-widest text-brand-forest hover:text-brand-clay transition-colors pb-1 border-b border-brand-forest hover:border-brand-clay cursor-pointer inline-block"
          >
            Tất cả sản phẩm
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {isLoadingBestSellers ? (
            [...Array(4)].map((_, idx) => <SkeletonProductCard key={idx} />)
          ) : (
            bestSellers.map((plant) => (
              <ProductCard
                key={plant.id}
                plant={plant}
                activeColor={productColors[plant.id] || 'Terracotta'}
                onColorChange={handleColorChange}
                addToCart={addToCart}
                potColorsInfo={potColorsInfo}
              />
            ))
          )}
        </div>
      </section>

      {/* 4. Plant Finder Quiz Callout - Minimal Text-centric Row */}
      <section ref={quizRef} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${quizVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-[#1F3E35] text-brand-cream grid grid-cols-1 md:grid-cols-12 items-center border border-brand-sand shadow-sm">
          <div className="md:col-span-7 p-12 sm:p-16 lg:p-24 space-y-6 text-left">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">Đồng hành cùng bạn</span>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#FDFBF7] font-light leading-[1.1]">
              Trắc nghiệm tìm cây cảnh phù hợp
            </h2>
            <p className="text-xs sm:text-sm text-brand-beige/75 leading-relaxed max-w-md font-medium">
              Bạn băn khoăn về ánh sáng phòng, hay lo lắng cây gây hại cho mèo cưng? Hãy thực hiện bài trắc nghiệm nhanh để hệ thống của chúng tôi tìm ra loài cây hoàn mỹ nhất cho bạn.
            </p>
            <Link
              to="/quiz"
              className="bg-brand-cream hover:bg-brand-beige text-brand-forest text-[10px] font-bold tracking-widest uppercase px-10 py-5 transition-all cursor-pointer inline-block hover:-translate-y-0.5 text-center"
            >
              LÀM TRẮC NGHIỆM NGAY
            </Link>
          </div>
          <div className="md:col-span-5 h-[350px] md:h-full min-h-[450px] overflow-hidden border-t md:border-t-0 md:border-l border-[#1A372C]">
            <img
              src={optimizeUnsplashImage("https://images.unsplash.com/photo-1545241047-6083a3684587", 600)}
              alt="Beautiful houseplant leaf"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[4000ms]"
            />
          </div>
        </div>
      </section>

      {/* 5. Why The Sill Section - Editorial features grid */}
      <section ref={whyRef} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 transition-all duration-700 ${whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold">Cam kết từ Nghệ nhân Đỗ Xuân Hùng</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light">Mang thiên nhiên về nhà thật đơn giản</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Cây trồng chất lượng cao",
              desc: "Cây cảnh được ươm dưỡng trong các điều kiện tối ưu tại vườn kính và được kiểm tra sức khỏe cẩn thận trước khi vận chuyển.",
              icon: "🌱"
            },
            {
              title: "Chậu sứ thiết kế riêng",
              desc: "Mọi loài cây được tích hợp chậu sứ có lỗ thoát nước và khay đĩa hứng, giúp tối giản việc chăm sóc và ngăn úng rễ.",
              icon: "🏺"
            },
            {
              title: "Tư vấn chăm cây trọn đời",
              desc: "Chúng tôi luôn ở đây để trả lời mọi thắc mắc. Đội ngũ chuyên gia nông nghiệp sẵn sàng hỗ trợ bạn qua chat và email.",
              icon: "💬"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-brand-white border border-brand-sand p-10 text-left space-y-4 hover:border-brand-forest transition-colors shadow-xs">
              <span className="text-3xl block">{item.icon}</span>
              <h3 className="font-serif text-lg font-medium text-brand-forest">{item.title}</h3>
              <p className="text-xs text-brand-slate leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Testimonials - Thư ngỏ từ nhà sáng lập Đỗ Xuân Hùng */}
      <section ref={testimonialsRef} className={`bg-brand-beige border-y border-brand-sand py-20 transition-all duration-700 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-brand-clay shadow-sm bg-brand-white">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
              alt="Đỗ Xuân Hùng" 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">Thư ngỏ từ người sáng lập</span>
          <blockquote className="font-serif text-2xl sm:text-3xl text-brand-forest font-light italic leading-relaxed">
            "Mỗi tác phẩm cây cảnh gửi đến tay quý khách không chỉ là một sản phẩm thương mại đơn thuần, mà là một tác phẩm nghệ thuật xanh, được tạo tác và chăm sóc cẩn thận dưới đôi bàn tay nghệ nhân và cả tâm huyết của tôi cùng các cộng sự tại Nam Định."
          </blockquote>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-charcoal">Nghệ nhân Đỗ Xuân Hùng</p>
            <p className="text-[10px] text-brand-clay font-bold uppercase tracking-wider">Chủ doanh nghiệp & Nghệ nhân Cây Cảnh Đỗ Xuân Hùng</p>
          </div>
        </div>
      </section>

      {/* 7. Plant Care Journal - Editorial Tips Grid */}
      <section ref={journalRef} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 transition-all duration-700 ${journalVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex justify-between items-end border-b border-brand-sand pb-6">
          <div className="text-left space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold">Cẩm nang kiến thức</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light">Tạp chí làm vườn</h2>
          </div>
          <Link
            to="/journal"
            className="text-[10px] font-bold uppercase tracking-widest text-brand-forest hover:text-brand-clay transition-colors pb-1 border-b border-brand-forest hover:border-brand-clay cursor-pointer"
          >
            Đọc tất cả bài viết
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {journals.map((blog, idx) => (
            <div 
              key={idx} 
              className="group space-y-6 cursor-pointer"
              onClick={() => setSelectedJournal(blog)}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-brand-beige border border-brand-sand relative">
                <img
                  src={optimizeUnsplashImage(blog.image, 400)}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-brand-clay tracking-widest">{blog.num} . {blog.category}</span>
                <h3 className="font-serif text-xl font-medium text-brand-forest group-hover:text-brand-clay transition-colors">{blog.title}</h3>
                <p className="text-xs text-brand-slate leading-relaxed font-medium">{blog.desc}</p>
                <div className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-brand-forest hover-underline pt-1">
                  Đọc thêm <ChevronRight size={12} className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Recently Viewed Section - Editorial grid with interactive color swatches */}
      {recentlyViewedProducts.length > 0 && (
        <section 
          ref={recentRef} 
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 transition-all duration-700 ${
            recentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex justify-between items-end border-b border-brand-sand pb-6">
            <div className="text-left space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold">Lịch sử xem</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light">Sản phẩm bạn đã xem gần đây</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {recentlyViewedProducts.map((plant) => (
              <ProductCard
                key={plant.id}
                plant={plant}
                activeColor={productColors[plant.id] || 'Terracotta'}
                onColorChange={handleColorChange}
                addToCart={addToCart}
                potColorsInfo={potColorsInfo}
              />
            ))}
          </div>
        </section>
      )}

      {/* Journal Detail Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-[#0D231A]/60 transition-opacity animate-fade-in" 
            onClick={() => setSelectedJournal(null)} 
          />
          <div className="relative bg-brand-cream border border-brand-sand shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto z-10 modal-panel animate-fade-in text-left">
            <button 
              onClick={() => setSelectedJournal(null)} 
              className="absolute right-4 top-4 p-2 text-brand-forest hover:text-brand-clay transition-colors cursor-pointer z-20 bg-brand-white/80 rounded-full border border-brand-sand/30"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
            
            <div className="w-full aspect-[16/9] overflow-hidden bg-brand-beige border-b border-brand-sand">
              <img 
                src={optimizeUnsplashImage(selectedJournal.image, 800)} 
                alt={selectedJournal.title} 
                className="w-full h-full object-cover animate-pulse-slow"
              />
            </div>
            
            <div className="p-8 sm:p-10 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brand-clay tracking-widest uppercase block">
                  {selectedJournal.num} • {selectedJournal.category}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light leading-tight">
                  {selectedJournal.title}
                </h2>
              </div>
              
              <div className="text-sm text-brand-slate leading-relaxed font-medium whitespace-pre-line border-t border-brand-sand/50 pt-6">
                {selectedJournal.content}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
