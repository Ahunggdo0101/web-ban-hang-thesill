import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();
  const { addToCart } = useCart();
  const [cardColors, setCardColors] = useState({});

  const handleColorChange = useCallback((productId, colorName, e) => {
    e.stopPropagation();
    setCardColors(prev => ({
      ...prev,
      [productId]: colorName
    }));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in bg-brand-cream">
      {/* Tiêu đề trang theo style premium */}
      <div className="text-left border-b border-brand-sand pb-10 mb-14">
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
          Bộ sưu tập cá nhân
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-brand-forest font-light mt-2">
          Danh sách yêu thích
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate max-w-xl mt-3 leading-relaxed font-medium">
          Lưu giữ những chậu cây bạn yêu thích để dễ dàng theo dõi và bổ sung vào khu vườn của mình bất cứ lúc nào.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        /* Trạng thái trống (chưa có sản phẩm yêu thích) */
        <div className="text-center py-16 bg-brand-white border border-brand-sand p-8 max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto">
            <Heart className="text-brand-clay opacity-60" size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-lg text-brand-forest">Danh sách yêu thích trống</h3>
            <p className="text-xs text-brand-slate leading-relaxed">
              Hãy dạo quanh cửa hàng và chọn cho mình những sản phẩm ưng ý nhất bằng cách nhấn vào nút hình trái tim nhé!
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="w-full bg-brand-forest text-brand-cream text-[10px] font-bold uppercase tracking-widest py-3.5 hover:bg-brand-green transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            Khám phá cửa hàng <ArrowRight size={12} />
          </button>
        </div>
      ) : (
        /* Grid danh sách sản phẩm yêu thích */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product.id}
              plant={product}
              activeColor={cardColors[product.id] || 'Terracotta'}
              onColorChange={handleColorChange}
              addToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
