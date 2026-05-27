import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Star, ChevronRight, BookOpen, X, Smile, ShieldCheck, MessageSquare, Phone, Mail, Heart } from 'lucide-react';
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-10 md:pt-12 pb-12 md:pb-16">
          <div className="text-left space-y-1">
            <h2 className="font-serif text-[26px] sm:text-[32px] md:text-[40px] text-[#2A2D24] font-normal leading-tight tracking-tight">
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

      {/* 1.9. Expert Assistance Section - Hãy nói chuyện với chuyên gia về cây trồng */}
      <section className="relative overflow-hidden bg-[#f9f8f7] py-14 sm:py-16 md:py-20 border-y border-brand-sand/60">
        {/* Vệt chiếc lá màu xanh trang trí ở góc trái trên cùng */}
        <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#007b5f] fill-current -translate-x-6 -translate-y-6 rotate-[15deg]">
            <path d="M0,0 C30,25 55,20 75,0 C65,35 45,65 0,85 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Cột trái: Văn bản giới thiệu */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-[11px] uppercase tracking-[0.15em] text-brand-slate font-bold block">
                Hãy nói chuyện với chuyên gia về cây trồng
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] text-[#2A2D24] font-normal leading-tight">
                Cần trợ giúp?
              </h2>
              <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium max-w-md">
                Sự tin tưởng của bạn là ưu tiên hàng đầu của chúng tôi. Bạn không chắc loại cây nào phù hợp với ánh sáng của mình? Bạn mới bắt đầu làm vườn ngoài trời và cần lời khuyên? Hãy liên hệ với chúng tôi, chúng tôi luôn sẵn sàng hỗ trợ.
              </p>
            </div>

            {/* Cột phải: 3 Card liên hệ */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Card 1: Trò chuyện */}
              <Link 
                to="/contact"
                className="bg-brand-white border border-brand-sand/65 p-6 flex flex-col items-center text-center justify-center space-y-4 hover:border-brand-forest hover:shadow-xs transition-all duration-300 group min-h-[180px]"
              >
                <div className="text-brand-forest group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare size={24} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-forest transition-colors">
                    Trò chuyện
                  </h3>
                  <p className="text-xs text-brand-slate leading-relaxed font-medium">
                    Nhắn tin trực tiếp với chuyên gia chăm sóc cây trồng
                  </p>
                </div>
              </Link>

              {/* Card 2: Gọi điện */}
              <a 
                href="tel:0988888888"
                className="bg-brand-white border border-brand-sand/65 p-6 flex flex-col items-center text-center justify-center space-y-4 hover:border-brand-forest hover:shadow-xs transition-all duration-300 group min-h-[180px]"
              >
                <div className="text-brand-forest group-hover:scale-110 transition-transform duration-300">
                  <Phone size={24} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-forest transition-colors">
                    Gọi
                  </h3>
                  <p className="text-xs text-brand-slate leading-relaxed font-medium">
                    Trò chuyện trực tiếp với chuyên gia chăm sóc cây trồng
                  </p>
                </div>
              </a>

              {/* Card 3: Email */}
              <a 
                href="mailto:info@thesill.com"
                className="bg-brand-white border border-brand-sand/65 p-6 flex flex-col items-center text-center justify-center space-y-4 hover:border-brand-forest hover:shadow-xs transition-all duration-300 group min-h-[180px]"
              >
                <div className="text-brand-forest group-hover:scale-110 transition-transform duration-300">
                  <Mail size={24} strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-forest transition-colors">
                    E-mail
                  </h3>
                  <p className="text-xs text-brand-slate leading-relaxed font-medium">
                    Hãy gửi thư đến địa chỉ info@thesill.com
                  </p>
                </div>
              </a>

            </div>

          </div>
        </div>
      </section>

      {/* 1.95. Plants for Everyone Section - Cây xanh cho mọi người */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-10 md:pt-12">
      <div className="text-left">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2A2D24] font-normal tracking-tight">
          Cây xanh cho mọi người
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        
        {[
          {
            title: "Cây trồng trong nhà",
            image: "https://images.unsplash.com/photo-1566393028639-d108a42c46a7",
            path: "/shop?difficulty=easy"
          },
          {
            title: "Cây trồng ngoài trời",
            image: "https://images.unsplash.com/photo-1550950158-d0d960dff51b",
            path: "/shop?size=large"
          },
          {
            title: "Các loại cây thân thiện với thú cưng",
            image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
            path: "/shop?pet=true"
          },
          {
            title: "Cây dễ chăm sóc",
            image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411",
            path: "/shop?difficulty=easy"
          },
          {
            title: "Hoa lan",
            image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d",
            path: "/shop"
          },
          {
            title: "Cây trồng trong nhà cỡ lớn và khổng lồ",
            image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921",
            path: "/shop?size=large"
          },
          {
            title: "Cây chịu được ánh sáng yếu",
            image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b",
            path: "/shop?light=low"
          },
          {
            title: "Chăm sóc cây trồng",
            image: "https://images.unsplash.com/photo-1604762524889-3e2fcc145f86",
            path: "/shop"
          }
        ].map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path}
            className="group flex flex-col space-y-3 cursor-pointer"
          >
            {/* Aspect 3:4 Image container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
              <img
                src={optimizeUnsplashImage(item.image, 500)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            {/* Title with Arrow */}
            <div className="text-left">
              <span className="font-serif text-sm sm:text-base font-normal text-brand-forest group-hover:text-brand-green hover-underline inline-flex items-center gap-1 transition-colors leading-snug">
                {item.title} <span className="font-sans font-light group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </Link>
        ))}

      </div>
    </section>

    {/* 1.98. Large Floor Plants Section - Cây trồng lớn trên sàn */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-10 md:pt-12">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2A2D24] font-normal tracking-tight">
            Cây trồng lớn trên sàn
          </h2>
        </div>
        <Link 
          to="/shop?size=large"
          className="font-serif text-xs sm:text-sm font-normal text-brand-forest hover:text-brand-green hover-underline inline-flex items-center gap-1 transition-colors pb-0.5"
        >
          Mua tất cả các loại cây lớn <span className="font-sans font-light">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        
        {[
          {
            title: "Cây ô liu",
            desc: "Loại cây lý tưởng cho không gian nội thất cao cấp.",
            rating: 5,
            reviewsCount: "158 reviews",
            price: "Từ 59 đô la",
            image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32",
            path: "/shop?size=large"
          },
          {
            title: "Cây sung lá đàn",
            desc: "Người yêu thích thiết kế",
            rating: 5,
            reviewsCount: "26 reviews",
            price: "Từ 69 đô la",
            image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae",
            path: "/shop?size=large"
          },
          {
            title: "Chim Thiên Đường",
            desc: "Thiên đường đã được ban tặng",
            rating: 5,
            reviewsCount: "29 reviews",
            price: "Từ 69 đô la",
            image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b",
            path: "/shop?size=large"
          },
          {
            title: "Alocasia Portora",
            desc: "To lớn, xù xì và phát triển nhanh.",
            rating: 0,
            price: "Từ 169 đô la",
            oldPrice: "199 đô la",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            path: "/shop?size=large"
          }
        ].map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path}
            className="group flex flex-col space-y-4 cursor-pointer"
          >
            {/* Aspect 3:4 Image container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
              {/* Badge đỏ đặc biệt */}
              <div className="absolute top-0 left-0 z-10 bg-[#e74c3c] text-white text-[9px] font-bold px-2.5 py-1.5 flex items-center gap-1 uppercase tracking-wider">
                <Star size={10} fill="white" className="text-white" />
                Ưu đãi đặc biệt nhân dịp kỷ niệm!
              </div>
              <img
                src={optimizeUnsplashImage(item.image, 600)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            
            <div className="space-y-1 text-left">
              <h3 className="font-serif text-base sm:text-lg font-medium text-brand-forest hover:text-brand-green transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-brand-slate italic leading-relaxed">
                {item.desc}
              </p>
              
              {/* Rating */}
              {item.rating > 0 ? (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="flex text-brand-forest">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" className="text-brand-forest" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-brand-slate font-semibold">
                    {item.reviewsCount}
                  </span>
                </div>
              ) : (
                // Dùng div rỗng chiều cao tương đương để đồng đều chiều cao cột trên grid
                <div className="h-[18px]" />
              )}
              
              {/* Price */}
              <p className="text-xs sm:text-sm font-bold text-brand-charcoal pt-0.5 flex items-center gap-2">
                <span className="text-brand-forest">{item.price}</span>
                {item.oldPrice && (
                  <span className="text-brand-slate/60 line-through font-normal text-xs">{item.oldPrice}</span>
                )}
              </p>
            </div>
          </Link>
        ))}

      </div>
    </section>

    {/* 1.99. New Arrivals Section - Hàng mới về */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-10 md:pt-12">
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2A2D24] font-normal tracking-tight">
            Hàng mới về
          </h2>
        </div>
        <Link 
          to="/shop"
          className="font-serif text-xs sm:text-sm font-normal text-brand-forest hover:text-brand-green hover-underline inline-flex items-center gap-1 transition-colors pb-0.5"
        >
          Xem tất cả sản phẩm mới về <span className="font-sans font-light">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        
        {[
          {
            title: "Lan kép lớn",
            desc: "Có thể nở hoa trong nhiều tháng",
            rating: 5,
            reviewsCount: "32 reviews",
            price: "Từ 139 đô la",
            badgeType: "bestseller",
            image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d",
            path: "/shop"
          },
          {
            title: "Chim Thiên Đường",
            desc: "Thiên đường đã được ban tặng",
            rating: 5,
            reviewsCount: "29 reviews",
            price: "Từ 69 đô la",
            badgeType: "anniversary",
            image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b",
            path: "/shop?size=large"
          },
          {
            title: "Cây dành dành lớn",
            desc: "Những loài hoa thơm ngát dành cho không gian đầy nắng",
            rating: 0,
            price: "Từ 119 đô la",
            oldPrice: "129 đô la",
            badgeType: "anniversary",
            image: "https://images.unsplash.com/photo-1512428813824-f4a0f4a88352",
            path: "/shop?size=large"
          },
          {
            title: "Cây cọ lớn uy nghi",
            desc: "Không gian xanh mát như khu nghỉ dưỡng",
            rating: 5,
            reviewsCount: "9 reviews",
            price: "Từ 89 đô la",
            oldPrice: "99 đô la",
            badgeType: "anniversary",
            image: "https://images.unsplash.com/photo-1584473457406-6240486418e9",
            path: "/shop?size=large"
          }
        ].map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path}
            className="group flex flex-col space-y-4 cursor-pointer"
          >
            {/* Aspect 3:4 Image container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-beige border border-brand-sand shadow-xs">
              {/* Badge */}
              {item.badgeType === "bestseller" ? (
                <div className="absolute top-0 left-0 z-10 bg-[#00ced1] text-white text-[9px] font-bold px-2.5 py-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <Heart size={10} fill="white" className="text-white" />
                  Sản phẩm bán chạy nhất
                </div>
              ) : (
                <div className="absolute top-0 left-0 z-10 bg-[#e74c3c] text-white text-[9px] font-bold px-2.5 py-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <Star size={10} fill="white" className="text-white" />
                  Ưu đãi đặc biệt nhân dịp kỷ niệm!
                </div>
              )}
              <img
                src={optimizeUnsplashImage(item.image, 600)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            
            <div className="space-y-1 text-left">
              <h3 className="font-serif text-base sm:text-lg font-medium text-brand-forest hover:text-brand-green transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-brand-slate italic leading-relaxed">
                {item.desc}
              </p>
              
              {/* Rating */}
              {item.rating > 0 ? (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="flex text-brand-forest">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" className="text-brand-forest" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-brand-slate font-semibold">
                    {item.reviewsCount}
                  </span>
                </div>
              ) : (
                // Dùng div rỗng chiều cao tương đương để đồng đều chiều cao cột trên grid
                <div className="h-[18px]" />
              )}
              
              {/* Price */}
              <p className="text-xs sm:text-sm font-bold text-brand-charcoal pt-0.5 flex items-center gap-2">
                <span className="text-brand-forest">{item.price}</span>
                {item.oldPrice && (
                  <span className="text-brand-slate/60 line-through font-normal text-xs">{item.oldPrice}</span>
                )}
              </p>
            </div>
          </Link>
        ))}

      </div>
    </section>

    {/* 2.0. Care & Workshops Section - Chăm sóc cây trồng & Hội thảo */}
    <section className="relative bg-[#f9f8f7] py-16 md:py-24">
      
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-20">
        
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
  </div>
  );
}
