import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SkeletonProductCard from '../components/SkeletonProductCard';
import { useCart } from '../context/CartContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { API_BASE_URL } from '../config';

const potColorsInfo = [
  { name: "Terracotta", value: "#D77A61" },
  { name: "Cream", value: "#F5F2EB" },
  { name: "Mint", value: "#C1D5C0" },
  { name: "Charcoal", value: "#3E3E3E" }
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const query = searchParams.get('q') || '';
  useDocumentTitle(query ? `Tìm Kiếm: ${query}` : 'Tìm Kiếm');

  // State để quản lý màu sắc được chọn cho chậu của từng sản phẩm trong card
  const [cardColors, setCardColors] = useState({});

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

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }
    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(query.trim())}&limit=50`);
        if (!res.ok) throw new Error('Không thể kết nối máy chủ dữ liệu');
        const data = await res.json();
        setFilteredProducts(data.items || []);
      } catch (err) {
        console.error('Lỗi tìm kiếm:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in bg-brand-cream text-brand-forest min-h-screen">
      {/* Nút quay lại shop */}
      <div className="mb-8">
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#666] hover:text-brand-forest transition-colors"
        >
          <ArrowLeft size={14} /> Quay lại cửa hàng
        </Link>
      </div>

      {/* Header tìm kiếm */}
      <div className="text-left border-b border-brand-sand pb-8 mb-12">
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
          Kết quả tìm kiếm
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-brand-forest font-light mt-2 break-words">
          {query ? `Kết quả cho “${query}”` : "Tìm kiếm sản phẩm"}
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate max-w-xl mt-3 font-medium">
          {isLoading 
            ? "Đang tìm kiếm sản phẩm..."
            : filteredProducts.length > 0 
              ? `Tìm thấy ${filteredProducts.length} sản phẩm phù hợp với từ khóa của bạn.`
              : "Nhập từ khóa tìm kiếm để khám phá các sản phẩm cây cảnh độc đáo."
          }
        </p>
      </div>

      {/* Grid kết quả */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {[...Array(4)].map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map((plant) => (
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
        query.trim() && (
          <div className="text-center py-24 bg-brand-white border border-brand-sand shadow-xs max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center mx-auto text-brand-clay">
              <Search size={24} className="stroke-1.5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl text-brand-forest font-medium">Không tìm thấy kết quả</h3>
              <p className="text-xs text-brand-slate max-w-xs mx-auto leading-relaxed font-semibold">
                Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với từ khóa <span className="text-brand-clay">“{query}”</span>.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-block bg-brand-forest text-brand-cream text-[10px] font-bold uppercase tracking-widest px-8 py-4 hover:bg-brand-green transition-colors"
              >
                Khám phá tất cả sản phẩm
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
}
