import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { optimizeUnsplashImage } from '../utils/image';
import useScrollAnimation from '../hooks/useScrollAnimation';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';

// Import các sub-components
import HeroSection from '../components/Home/HeroSection';
import TrustBadges from '../components/Home/TrustBadges';
import ProductShowcase from '../components/Home/ProductShowcase';
import ExpertAssistance from '../components/Home/ExpertAssistance';
import CategoryList from '../components/Home/CategoryList';
import HappySlider from '../components/Home/HappySlider';

export default function Home() {
  useDocumentTitle('Cây Cảnh Nội Thất Cao Cấp');
  const { addToCart } = useCart();
  const [selectedJournal, setSelectedJournal] = useState(null);
  const { getItems } = useRecentlyViewed();
  const [bestSellers, setBestSellers] = useState([]);
  const [isLoadingBestSellers, setIsLoadingBestSellers] = useState(true);
  const [viewedIds, setViewedIds] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);

  // ── Homepage Config từ API (Admin quản lý) ──────────────────────────────
  const [homepageConfig, setHomepageConfig] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/homepage-config`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setHomepageConfig(data); })
      .catch(() => {});
  }, []);

  const happySlides = useMemo(() => homepageConfig?.happySlides ?? [
    "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921",
    "https://images.unsplash.com/photo-1614594975525-e45190c55d0b",
    "https://images.unsplash.com/photo-1520412099521-63b16afe9587",
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae"
  ], [homepageConfig]);

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

  // ── Data từ API (Admin quản lý) ──────────────────────────────────────────
  const homepageCategories = useMemo(() => (homepageConfig?.categories ?? [
    { title: "Cây trồng trong nhà", image: "https://images.unsplash.com/photo-1566393028639-d108a42c46a7", path: "/shop?difficulty=easy", visible: true },
    { title: "Cây trồng ngoài trời", image: "https://images.unsplash.com/photo-1550950158-d0d960dff51b", path: "/shop?size=large", visible: true },
    { title: "Các loại cây thân thiện với thú cưng", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e", path: "/shop?pet=true", visible: true },
    { title: "Cây dễ chăm sóc", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411", path: "/shop?difficulty=easy", visible: true },
    { title: "Hoa lan", image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d", path: "/shop", visible: true },
    { title: "Cây trồng trong nhà cỡ lớn và khổng lồ", image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921", path: "/shop?size=large", visible: true },
    { title: "Cây chịu được ánh sáng yếu", image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b", path: "/shop?light=low", visible: true },
    { title: "Chăm sóc cây trồng", image: "https://images.unsplash.com/photo-1604762524889-3e2fcc145f86", path: "/shop", visible: true },
  ]).filter(c => c.visible !== false), [homepageConfig]);

  const popularPlants = useMemo(() => homepageConfig?.popularPlants ?? [
    { title: "Cây ô liu", desc: "Loại cây lý tưởng cho không gian nội thất cao cấp.", rating: 5, reviewsCount: "158 đánh giá", price: "Từ 59 đô la", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32", path: "/shop", badge: '' },
    { title: "Philodendron Brasil", desc: "Ánh sáng mạnh hơn làm nổi bật nhiều màu sắc hơn.", rating: 5, reviewsCount: "1 đánh giá", price: "Từ 69 đô la", image: "https://images.unsplash.com/photo-1597055181300-e3633a207518", path: "/shop", badge: '' },
    { title: "Cây tiền", desc: "Cây may mắn nguyên thủy", rating: 5, reviewsCount: "66 đánh giá", price: "Từ 39 đô la", image: "https://images.unsplash.com/photo-1520412099521-63b16afe9587", path: "/shop", badge: 'sale' },
    { title: "Chanh Meyer", desc: "Mua ở cửa hàng < tự trồng tại nhà", rating: 5, reviewsCount: "20 đánh giá", price: "Từ $99", oldPrice: "109 đô la", image: "https://images.unsplash.com/photo-1534531173927-aeb928d54385", path: "/shop", badge: 'sale' },
  ], [homepageConfig]);

  const floorPlants = useMemo(() => homepageConfig?.floorPlants ?? [
    { title: "Cây ô liu", desc: "Loại cây lý tưởng cho không gian nội thất cao cấp.", rating: 5, reviewsCount: "158 reviews", price: "Từ 59 đô la", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32", path: "/shop?size=large", badge: 'sale' },
    { title: "Cây sung lá đàn", desc: "Người yêu thích thiết kế", rating: 5, reviewsCount: "26 reviews", price: "Từ 69 đô la", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae", path: "/shop?size=large", badge: 'sale' },
    { title: "Chim Thiên Đường", desc: "Thiên paradise đã được ban tặng", rating: 5, reviewsCount: "29 reviews", price: "Từ 69 đô la", image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b", path: "/shop?size=large", badge: 'sale' },
    { title: "Alocasia Portora", desc: "To lớn, xù xì và phát triển nhanh.", rating: 0, reviewsCount: "", price: "Từ 169 đô la", oldPrice: "199 đô la", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", path: "/shop?size=large", badge: 'sale' },
  ], [homepageConfig]);

  const newArrivals = useMemo(() => homepageConfig?.newArrivals ?? [
    { title: "Lan kép lớn", desc: "Có thể nở hoa trong nhiều tháng", rating: 5, reviewsCount: "32 reviews", price: "Từ 139 đô la", image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d", path: "/shop", badge: 'bestseller' },
    { title: "Chim Thiên Đường", desc: "Thiên paradise đã được ban tặng", rating: 5, reviewsCount: "29 reviews", price: "Từ 69 đô la", image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b", path: "/shop?size=large", badge: 'sale' },
    { title: "Cây dành dành lớn", desc: "Những loài hoa thơm ngát dành cho không gian đầy nắng", rating: 0, reviewsCount: "", price: "Từ 119 đô la", oldPrice: "129 đô la", image: "https://images.unsplash.com/photo-1512428813824-f4a0f4a88352", path: "/shop?size=large", badge: 'sale' },
    { title: "Cây cọ lớn uy nghi", desc: "Không gian xanh mát như khu nghỉ dưỡng", rating: 5, reviewsCount: "9 reviews", price: "Từ 89 đô la", oldPrice: "99 đô la", image: "https://images.unsplash.com/photo-1584473457406-6240486418e9", path: "/shop?size=large", badge: 'sale' },
  ], [homepageConfig]);

  return (
    <div className="w-full space-y-16 md:space-y-28 pb-16 md:pb-28 animate-fade-in bg-brand-cream">
      
      {/* 1. Hero & Trust Badges Section */}
      <div className="w-full flex flex-col">
        <HeroSection />
        <TrustBadges />
      </div>

      {/* 1.8. Popular Plants Section */}
      <ProductShowcase 
        title="Các loại cây trồng được ưa chuộng nhất hiện nay" 
        items={popularPlants}
        className="pt-10 md:pt-12 pb-12 md:pb-16"
      />

      {/* 1.9. Expert Assistance Section */}
      <ExpertAssistance />

      {/* 1.95. Plants for Everyone Section */}
      <CategoryList categories={homepageCategories} />

      {/* 1.98. Large Floor Plants Section */}
      <ProductShowcase 
        title="Cây trồng lớn trên sàn" 
        items={floorPlants}
        viewAllPath="/shop?size=large"
        viewAllText="Mua tất cả các loại cây lớn"
      />

      {/* 1.99. New Arrivals Section */}
      <ProductShowcase 
        title="Hàng mới về" 
        items={newArrivals}
        viewAllPath="/shop"
        viewAllText="Xem tất cả sản phẩm mới về"
      />

      {/* 2.0. Care & Workshops Section - Chăm sóc cây trồng & Hội thảo */}
      <section className="relative bg-[#f9f8f7] py-16 md:py-24 overflow-hidden">
        
        {/* Nhánh lá trang trí màu xanh lục ở góc phải trên cùng */}
        <div className="absolute top-0 right-0 w-48 h-48 md:w-72 md:h-72 overflow-hidden pointer-events-none z-10">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform translate-x-4 -translate-y-4 scale-110 origin-top-right">
            {/* Cành chính */}
            <path d="M200,0 C175,25 150,60 135,110 C125,140 120,170 120,180" stroke="#1A3B2B" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Lá 1 - góc trên phải */}
            <g transform="translate(180, 15) rotate(-20)">
              <ellipse cx="0" cy="0" rx="14" ry="10" fill="#205038" />
              <path d="M-14,0 C-5,-2 5,-2 14,0" stroke="#307050" strokeWidth="0.8" />
            </g>
            
            {/* Lá 2 */}
            <g transform="translate(195, 38) rotate(35)">
              <ellipse cx="0" cy="0" rx="16" ry="12" fill="#2A5C43" />
              <path d="M-16,0 C-5,-2 5,-2 16,0" stroke="#3D7D5B" strokeWidth="0.8" />
            </g>
            
            {/* Lá 3 */}
            <g transform="translate(162, 42) rotate(-55)">
              <ellipse cx="0" cy="0" rx="18" ry="13" fill="#1B4731" />
              <path d="M-18,0 C-5,-2 5,-2 18,0" stroke="#2B5E43" strokeWidth="0.8" />
            </g>
            
            {/* Lá 4 */}
            <g transform="translate(170, 75) rotate(15)">
              <ellipse cx="0" cy="0" rx="20" ry="14" fill="#24543B" />
              <path d="M-20,0 C-5,-2 5,-2 20,0" stroke="#357354" strokeWidth="0.8" />
            </g>
            
            {/* Lá 5 */}
            <g transform="translate(142, 85) rotate(-35)">
              <ellipse cx="0" cy="0" rx="17" ry="12" fill="#2C5F46" />
              <path d="M-17,0 C-5,-2 5,-2 17,0" stroke="#3F8261" strokeWidth="0.8" />
            </g>
            
            {/* Lá 6 */}
            <g transform="translate(148, 122) rotate(45)">
              <ellipse cx="0" cy="0" rx="19" ry="14" fill="#1D4A33" />
              <path d="M-19,0 C-5,-2 5,-2 19,0" stroke="#2D664A" strokeWidth="0.8" />
            </g>
            
            {/* Lá 7 */}
            <g transform="translate(125, 135) rotate(-15)">
              <ellipse cx="0" cy="0" rx="16" ry="11" fill="#26583E" />
              <path d="M-16,0 C-5,-2 5,-2 16,0" stroke="#3A795B" strokeWidth="0.8" />
            </g>
            
            {/* Lá 8 - ngọn cành */}
            <g transform="translate(120, 172) rotate(10)">
              <ellipse cx="0" cy="0" rx="14" ry="10" fill="#2C5F46" />
              <path d="M-14,0 C-5,-2 5,-2 14,0" stroke="#3F8261" strokeWidth="0.8" />
            </g>
          </svg>
        </div>

        {/* Khối 1: Header và 3 Card hội thảo */}
        <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] space-y-12 relative z-20">
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-2">
            <div className="text-left space-y-2 max-w-xl">
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2A2D24] font-normal tracking-tight">
                Chăm sóc cây trồng & Hội thảo
              </h2>
              <p className="text-xs sm:text-sm text-brand-slate font-medium">
                Trao quyền cho tất cả mọi người trở thành những người yêu cây. Chào mừng đến với Plant Parenthood®.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 md:gap-6 text-left">
              <Link 
                to="/journal"
                className="font-serif text-xs sm:text-sm font-normal text-brand-forest hover:text-brand-green hover-underline inline-flex items-center gap-1 transition-colors pb-0.5"
              >
                Xem tất cả các hội thảo <span className="font-sans font-light">→</span>
              </Link>
              <Link 
                to="/journal"
                className="font-serif text-xs sm:text-sm font-normal text-brand-forest hover:text-brand-green hover-underline inline-flex items-center gap-1 transition-colors pb-0.5"
              >
                Ghé thăm Blog của chúng tôi <span className="font-sans font-light">→</span>
              </Link>
            </div>
          </div>

          {/* 3 Card hội thảo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Card 1 */}
            <div className="group flex flex-col space-y-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
                {/* Ngày diễn ra badge */}
                <div className="absolute top-3 left-3 z-10 bg-[#23A696] text-white text-[9px] font-bold px-2.5 py-1.5 uppercase tracking-wider">
                  Ngày 4 tháng 6
                </div>
                <img
                  src={optimizeUnsplashImage("https://images.unsplash.com/photo-1545241047-6083a3684587", 400)}
                  alt="Hỏi chuyên gia: Cách trồng và thay chậu cây"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-brand-forest font-bold block">
                  MIỄN PHÍ
                </span>
                <h3 className="font-serif text-lg font-medium text-brand-forest group-hover:text-brand-green transition-colors leading-snug">
                  Hỏi chuyên gia: Cách trồng và thay chậu cây
                </h3>
                <p className="text-xs text-brand-slate leading-relaxed font-medium">
                  Bạn có thắc mắc về việc trồng cây trong chậu? Hãy tham gia buổi hỏi đáp trực tiếp của chúng tôi để nắm vững kiến thức về đất, hệ thống thoát nước và cách thay chậu. Nhận câu trả lời từ chuyên gia để giữ cho cây của bạn luôn tươi tốt quanh năm!
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group flex flex-col space-y-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
                <div className="absolute top-3 left-3 z-10 bg-[#23A696] text-white text-[9px] font-bold px-2.5 py-1.5 uppercase tracking-wider">
                  Ngày 12 tháng 6
                </div>
                <img
                  src={optimizeUnsplashImage("https://images.unsplash.com/photo-1596547609652-9cf5d8d76921", 400)}
                  alt="Hướng dẫn chăm sóc cây trồng mùa hè"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-brand-forest font-bold block">
                  MIỄN PHÍ
                </span>
                <h3 className="font-serif text-lg font-medium text-brand-forest group-hover:text-brand-green transition-colors leading-snug">
                  Hướng dẫn chăm sóc cây trồng mùa hè: Trong nhà và ngoài trời
                </h3>
                <p className="text-xs text-brand-slate leading-relaxed font-medium">
                  Hãy tìm hiểu cách tưới nước, bón phân và bảo vệ cây cảnh trong nhà và vườn ngoài trời trong những ngày hè nóng bức.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group flex flex-col space-y-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
                <div className="absolute top-3 left-3 z-10 bg-[#23A696] text-white text-[9px] font-bold px-2.5 py-1.5 uppercase tracking-wider">
                  Ngày 1 tháng 7
                </div>
                <img
                  src={optimizeUnsplashImage("https://images.unsplash.com/photo-1614594975525-e45190c55d0b", 400)}
                  alt="Hướng dẫn cơ bản về cây cảnh trong nhà"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-brand-forest font-bold block">
                  MIỄN PHÍ
                </span>
                <h3 className="font-serif text-lg font-medium text-brand-forest group-hover:text-brand-green transition-colors leading-snug">
                  Hướng dẫn cơ bản về cây cảnh trong nhà
                </h3>
                <p className="text-xs text-brand-slate leading-relaxed font-medium">
                  Hướng dẫn cơ bản về chăm sóc cây trồng trong nhà, tưới nước và nhu cầu ánh sáng — không cần phải là người có kinh nghiệm trồng cây!
                </p>
              </div>
            </div>

          </div>

          {/* Ngăn cách giữa hai khối con bằng khoảng trống thích hợp */}
          <div className="pt-16 md:pt-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Cột trái: Ảnh ngang to */}
              <div className="lg:col-span-7">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-beige rounded-sm">
                  <img
                    src={optimizeUnsplashImage("https://images.unsplash.com/photo-1596547609652-9cf5d8d76921", 700)}
                    alt="Chăm sóc cây trồng trong nhà"
                    className="w-full h-full object-cover hover:scale-103 transition-transform duration-[2000ms] ease-out"
                  />
                </div>
              </div>

              {/* Cột phải: 3 bài viết xếp dọc */}
              <div className="lg:col-span-5 space-y-10 text-left">
                
                {/* Bài 1 */}
                <div className="space-y-2 group">
                  <span className="text-xs italic text-brand-forest font-medium block">
                    Chăm sóc cây trồng ngoài trời
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2A2D24] group-hover:text-brand-forest transition-colors leading-snug">
                    <Link to="/journal">Hướng dẫn làm vườn cơ bản: Cách đào một cái hố hoàn hảo</Link>
                  </h3>
                  <Link 
                    to="/journal"
                    className="text-xs font-serif text-sm text-[#2A2D24] hover:text-brand-forest transition-colors inline-block"
                  >
                    Đọc thêm →
                  </Link>
                </div>

                {/* Bài 2 */}
                <div className="space-y-2 group">
                  <span className="text-xs italic text-brand-forest font-medium block">
                    Kiến thức cơ bản về thực vật
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2A2D24] group-hover:text-brand-forest transition-colors leading-snug">
                    <Link to="/journal">Mẹo và thủ thuật chăm sóc cây cảnh trong nhà mùa xuân</Link>
                  </h3>
                  <Link 
                    to="/journal"
                    className="text-xs font-serif text-sm text-[#2A2D24] hover:text-brand-forest transition-colors inline-block"
                  >
                    Đọc thêm →
                  </Link>
                </div>

                {/* Bài 3 */}
                <div className="space-y-2 group">
                  <span className="text-xs italic text-brand-forest font-medium block">
                    Câu hỏi thường gặp về chăm sóc sức khỏe
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2A2D24] group-hover:text-brand-forest transition-colors leading-snug">
                    <Link to="/journal">Hỏi chuyên gia: Mẹo làm vườn mùa xuân từ The Sill® + NYBG</Link>
                  </h3>
                  <Link 
                    to="/journal"
                    className="text-xs font-serif text-sm text-[#2A2D24] hover:text-brand-forest transition-colors inline-block"
                  >
                    Đọc thêm →
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3.0. Plants Make People Happy Slider Section */}
      <HappySlider happySlides={happySlides} />
    </div>
  );
}
