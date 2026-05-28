import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Heart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { potColors } from '../../data/products';
import { optimizeUnsplashImage } from '../../utils/image';
import { formatVND } from '../../utils/translation';

const recommendedAddons = [
  {
    id: "premium-soil-mix",
    name: "Hỗn hợp đất trồng cao cấp",
    desc: "Hỗn hợp giàu dưỡng chất cho sự phát triển khỏe mạnh",
    price: 19,
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "olive-care-kit",
    name: "Bộ dụng cụ chăm sóc cây ô liu GrowScripts",
    desc: "",
    price: 19,
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "moisture-meter-lgl",
    name: "Máy đo độ ẩm (LGL)",
    desc: "Đo độ ẩm, độ pH và ánh sáng.",
    price: 20,
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=150"
  }
];

export default function ProductInfoSection({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();

  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedStyle, setSelectedStyle] = useState('Pallas');
  const [selectedColor, setSelectedColor] = useState('Charcoal');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [imgKey, setImgKey] = useState(0);

  const getPriceMultiplier = (size) => {
    if (size === 'small') return 0.75;
    if (size === 'medium') return 1.0;
    if (size === 'large') return 1.35;
    if (size === 'xlarge') return 1.75;
    return 1.0;
  };

  const displayPrice = product ? Math.round(product.price * getPriceMultiplier(selectedSize)) : 0;
  const originalPrice = displayPrice ? Math.round(displayPrice * 1.15) : 0;

  const getSizeLabel = (size) => {
    if (size === 'small') return 'Bé nhỏ (cao từ 15 đến 30 cm)';
    if (size === 'medium') return 'Trung bình (cao từ 30 đến 60 cm)';
    if (size === 'large') return 'Lớn (cao từ 60 đến 90 cm)';
    if (size === 'xlarge') return 'Cỡ cực lớn (cao từ 90 đến 150 cm)';
    return size;
  };

  const getSizeNameVi = (size) => {
    if (size === 'small') return 'Bé nhỏ';
    if (size === 'medium') return 'Trung bình';
    if (size === 'large') return 'Lớn';
    if (size === 'xlarge') return 'Cỡ cực lớn';
    return size;
  };

  const getStyleLabel = (style) => {
    if (style === 'Pallas') return 'Pallas (rộng 12 inch)';
    if (style === 'Isabella') return 'Isabella (rộng 10 inch)';
    if (style === 'Hàng hóa rần') return 'Hàng hóa rần (chậu treo)';
    if (style === 'Chậu trồng cây') return 'Chậu trồng cây (chậu nhựa)';
    return style;
  };

  const getColorLabel = (color) => {
    if (color === 'Charcoal') return 'Đá granit';
    if (color === 'Cream') return 'Kem mịn';
    if (color === 'Mint') return 'Bạc hà';
    if (color === 'Terracotta') return 'Đất nung';
    return color;
  };

  const isFavorite = product ? isInWishlist(product.id) : false;

  // Reset state khi sản phẩm thay đổi sau khi fetch
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedSize(product.size || 'medium');
      setSelectedStyle('Pallas');
      setSelectedColor('Charcoal');
      const colorImagesObj = typeof product.colorImages === 'string' ? JSON.parse(product.colorImages) : product.colorImages;
      const initImage = colorImagesObj?.['Charcoal'] || colorImagesObj?.[potColors[0]?.name] || product.image;
      setActiveImage(initImage);
      setImgKey(k => k + 1);
    }
  }, [product]);

  // Đổi ảnh khi chọn màu khác
  useEffect(() => {
    if (product) {
      const colorImagesObj = typeof product.colorImages === 'string' ? JSON.parse(product.colorImages) : product.colorImages;
      const img = colorImagesObj?.[selectedColor] || product.image;
      setActiveImage(img);
      setImgKey(k => k + 1);
    }
  }, [selectedColor, product]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    const customizedProduct = {
      ...product,
      price: displayPrice,
      name: `${product.name} (${getSizeNameVi(selectedSize)})`
    };
    
    addToCart(customizedProduct, quantity, selectedStyle, selectedColor);
    showToast('Đã thêm vào giỏ!', 'success');
  }, [addToCart, product, quantity, selectedStyle, selectedColor, displayPrice, selectedSize, showToast]);

  const handleThumbnailClick = useCallback((imgUrl) => {
    setActiveImage(imgUrl);
    setImgKey(k => k + 1);
  }, []);

  const handleDecrement = useCallback(() => setQuantity(q => Math.max(1, q - 1)), []);
  const handleIncrement = useCallback(() => setQuantity(q => q + 1), []);

  if (!product) return null;

  // Tập hợp ảnh gallery không trùng lặp từ product
  const colorImagesObj = typeof product.colorImages === 'string' ? JSON.parse(product.colorImages) : product.colorImages;
  const galleryItems = [
    product.image,
    ...(product.images || []),
    ...Object.values(colorImagesObj || {})
  ].filter((v, i, arr) => v && arr.indexOf(v) === i);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="text-[10px] text-brand-slate uppercase tracking-widest mb-8 flex items-center space-x-2 font-bold">
        <Link to="/" className="hover:text-brand-forest transition-colors">Trang chủ</Link>
        <span className="text-brand-sand">/</span>
        <Link to="/shop" className="hover:text-brand-forest transition-colors">Cửa hàng</Link>
        <span className="text-brand-sand">/</span>
        <span className="text-brand-forest font-extrabold">{product.name}</span>
      </nav>

      {/* Main product layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* ── LEFT COLUMN: Images (Col 7) ── */}
        <div className="col-span-12 md:col-span-7 flex flex-col md:flex-row gap-5 items-start md:sticky md:top-10">
          {/* Cột dọc thumbnail bên trái */}
          {galleryItems.length > 0 && (
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[75vh] shrink-0 w-full md:w-[92px] order-2 md:order-1 pb-2 md:pb-0 scrollbar-thin">
              {galleryItems.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => handleThumbnailClick(imgUrl)}
                  className={`w-16 h-20 md:w-full aspect-[4/5] border transition-all cursor-pointer overflow-hidden rounded-md flex-shrink-0 ${
                    activeImage === imgUrl
                      ? 'border-brand-forest ring-1 ring-brand-forest scale-102'
                      : 'border-brand-sand/70 hover:border-brand-forest opacity-85 hover:opacity-100'
                  }`}
                >
                  <img
                    src={optimizeUnsplashImage(imgUrl, 150)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Ảnh lớn chính */}
          <div className="aspect-[4/5] w-full max-h-[75vh] max-w-[60vh] bg-[#faf9f6] border border-brand-sand/40 overflow-hidden relative order-1 md:order-2 rounded-2xl shadow-xs flex-grow">
            <img
              key={imgKey}
              src={optimizeUnsplashImage(activeImage, 1000)}
              alt={product.name}
              className="w-full h-full object-cover animate-fade-in transition-opacity duration-500"
            />
            {product.petFriendly && (
              <span className="absolute top-4 left-4 bg-brand-forest border border-[#1A372C] text-brand-cream text-[8px] uppercase font-bold tracking-widest px-3 py-1.5 shadow-sm rounded-xs">
                An toàn thú cưng
              </span>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Content (Col 5) ── */}
        <div className="col-span-12 md:col-span-5 space-y-6 text-left">
          
          {/* Rating & Title */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex text-brand-forest text-xs">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" className="mr-0.5" />
                ))}
              </div>
              <span className="text-xs text-brand-slate font-bold uppercase tracking-wider">
                {product.reviewsCount} Đánh giá
              </span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#2A2D24] font-normal leading-tight">
              {product.name}
            </h1>
            <p className="text-sm text-brand-slate italic font-serif mt-1">{product.botanicalName}</p>
          </div>

          {/* Badges thông số */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
              ☀️ {product.light === 'low' ? 'Ánh sáng yếu' : product.light === 'medium' ? 'Ánh sáng trung bình' : 'Ánh sáng trực tiếp mạnh'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              📈 {product.difficulty === 'easy' ? 'Dễ chăm sóc' : product.difficulty === 'moderate' ? 'Tăng trưởng 1 ft/năm' : 'Cần chú ý kỹ'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
              🐾 {product.petFriendly ? 'An toàn cho thú cưng' : 'Độc tính với thú cưng'}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-brand-slate/95 leading-relaxed font-medium pt-1">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-center gap-3 py-1.5 border-y border-brand-sand/50">
            <span className="text-base line-through text-brand-slate/60 font-medium">{formatVND(originalPrice)}</span>
            <span className="text-3xl font-extrabold text-brand-forest">{formatVND(displayPrice)}</span>
            <span className="bg-red-600 text-white text-[9px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm">Giảm giá {formatVND(originalPrice - displayPrice)}</span>
          </div>

          {/* Size Selector */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-brand-forest uppercase tracking-wider">
              Chọn kích cỡ: <span className="text-brand-clay font-semibold normal-case ml-1">{getSizeLabel(selectedSize)}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1"></div>
              <button
                type="button"
                onClick={() => setSelectedSize('large')}
                className={`border px-3 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md text-center ${
                  selectedSize === 'large' ? 'bg-[#e2e0dd] border-[#888] text-brand-forest shadow-xs' : 'bg-white border-brand-sand/80 text-brand-charcoal hover:border-brand-forest'
                }`}
              >
                Lớn
              </button>
              <div className="col-span-1"></div>

              <button
                type="button"
                onClick={() => setSelectedSize('medium')}
                className={`border px-3 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md text-center ${
                  selectedSize === 'medium' ? 'bg-[#e2e0dd] border-[#888] text-brand-forest shadow-xs' : 'bg-white border-brand-sand/80 text-brand-charcoal hover:border-brand-forest'
                }`}
              >
                Trung bình
              </button>
              <div className="col-span-1"></div>
              <button
                type="button"
                onClick={() => setSelectedSize('small')}
                className={`border px-3 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md text-center ${
                  selectedSize === 'small' ? 'bg-[#e2e0dd] border-[#888] text-brand-forest shadow-xs' : 'bg-white border-brand-sand/80 text-brand-charcoal hover:border-brand-forest'
                }`}
              >
                Bé nhỏ
              </button>

              <div className="col-span-1"></div>
              <button
                type="button"
                onClick={() => setSelectedSize('xlarge')}
                className={`border px-3 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md text-center ${
                  selectedSize === 'xlarge' ? 'bg-[#e2e0dd] border-[#888] text-brand-forest shadow-xs' : 'bg-white border-brand-sand/80 text-brand-charcoal hover:border-brand-forest'
                }`}
              >
                Cỡ cực lớn
              </button>
              <div className="col-span-1"></div>
            </div>
          </div>

          {/* Pot Style Selector */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-brand-forest uppercase tracking-wider">
              Chọn chậu trồng cây: <span className="text-brand-clay font-semibold normal-case ml-1">{getStyleLabel(selectedStyle)}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1"></div>
              <button
                type="button"
                onClick={() => setSelectedStyle('Pallas')}
                className={`border px-3 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md text-center flex items-center justify-center gap-1 ${
                  selectedStyle === 'Pallas' ? 'bg-[#e2e0dd] border-[#888] text-brand-forest shadow-xs' : 'bg-white border-brand-sand/80 text-brand-charcoal hover:border-brand-forest'
                }`}
              >
                🍶 Pallas
              </button>
              <div className="col-span-1"></div>

              <button
                type="button"
                onClick={() => setSelectedStyle('Isabella')}
                className={`border px-3 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md text-center flex items-center justify-center gap-1 ${
                  selectedStyle === 'Isabella' ? 'bg-[#e2e0dd] border-[#888] text-brand-forest shadow-xs' : 'bg-white border-brand-sand/80 text-brand-charcoal hover:border-brand-forest'
                }`}
              >
                🏺 Isabella
              </button>
              <div className="col-span-1"></div>
              <button
                type="button"
                onClick={() => setSelectedStyle('Hàng hóa rần')}
                className={`border px-3 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md text-center flex items-center justify-center gap-1 ${
                  selectedStyle === 'Hàng hóa rần' ? 'bg-[#e2e0dd] border-[#888] text-brand-forest shadow-xs' : 'bg-white border-brand-sand/80 text-brand-charcoal hover:border-brand-forest'
                }`}
              >
                🧺 Hàng hóa rần
              </button>

              <div className="col-span-1"></div>
              <button
                type="button"
                onClick={() => setSelectedStyle('Chậu trồng cây')}
                className={`border px-3 py-3.5 text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md text-center flex items-center justify-center gap-1 ${
                  selectedStyle === 'Chậu trồng cây' ? 'bg-[#e2e0dd] border-[#888] text-brand-forest shadow-xs' : 'bg-white border-brand-sand/80 text-brand-charcoal hover:border-brand-forest'
                }`}
              >
                🪴 Chậu trồng
              </button>
              <div className="col-span-1"></div>
            </div>
          </div>

          {/* Pot Color Swatches */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-brand-forest uppercase tracking-wider">
              Chọn màu: <span className="text-brand-clay font-semibold normal-case ml-1">{getColorLabel(selectedColor)}</span>
            </label>
            <div className="flex space-x-3.5">
              {potColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                    selectedColor === color.name
                      ? 'border-brand-forest ring-2 ring-brand-forest/30 ring-offset-2 scale-110'
                      : 'border-brand-sand hover:scale-110 hover:border-brand-forest/50'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={getColorLabel(color.name)}
                >
                  {selectedColor === color.name && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-forest block" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Wishlist */}
          <div className="flex items-center space-x-4 pt-4 border-t border-brand-sand/40">
            <div className="flex items-center border border-brand-sand bg-white">
              <button
                onClick={handleDecrement}
                className="px-4 py-3 text-brand-slate hover:text-brand-forest hover:bg-brand-beige transition-colors"
                aria-label="Giảm số lượng"
              >
                <Minus size={11} />
              </button>
              <span className="px-4 text-sm font-bold text-brand-charcoal w-12 text-center select-none">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="px-4 py-3 text-brand-slate hover:text-brand-forest hover:bg-brand-beige transition-colors"
                aria-label="Tăng số lượng"
              >
                <Plus size={11} />
              </button>
            </div>

            <button
              onClick={() => {
                if (isFavorite) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist(product);
                }
              }}
              className={`border p-3 transition-all hover:border-brand-forest cursor-pointer rounded-sm ${
                isFavorite ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white border-brand-sand text-brand-slate'
              }`}
              title="Yêu thích"
              aria-label="Thêm vào yêu thích"
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* CTA Add to Cart */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full bg-brand-forest hover:bg-brand-green text-brand-cream font-extrabold py-4.5 text-sm uppercase tracking-widest transition-all shadow-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              THÊM VÀO GIỎ HÀNG • {formatVND(displayPrice * quantity)}
            </button>
          </div>

          {/* Cam kết thanh toán an toàn */}
          <div className="text-[11px] text-brand-slate leading-relaxed pt-1 text-left font-medium flex items-center gap-1.5">
            🔒 Thanh toán an toàn qua VietQR hoặc thu tiền khi giao hàng (COD)
          </div>

          {/* Chuyên gia khuyên dùng */}
          <div className="space-y-3 pt-3">
            <span className="block text-[13px] font-bold text-brand-charcoal tracking-wide border-t border-brand-sand/40 pt-4">
              Các chuyên gia về cây trồng của chúng tôi khuyên dùng:
            </span>
            <div className="space-y-3">
              {recommendedAddons.map((addon) => (
                <div key={addon.id} className="flex items-center gap-4 p-3.5 bg-[#f6f6f6] rounded-2xl hover:shadow-xs transition-shadow">
                  <div className="w-16 h-16 bg-white border border-black/5 rounded-xl overflow-hidden shrink-0">
                    <img src={addon.image} alt={addon.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="font-bold text-[13px] text-brand-charcoal leading-tight">{addon.name}</h4>
                    {addon.desc && (
                      <p className="text-xs text-brand-slate/85 leading-snug mt-1">{addon.desc}</p>
                    )}
                    <p className="text-sm font-bold text-brand-charcoal mt-1.5">+{formatVND(addon.price)}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addToCart({
                        id: addon.id,
                        name: addon.name,
                        price: addon.price,
                        image: addon.image,
                        category: 'care'
                      }, 1, 'Không có chậu', 'Mặc định');
                      showToast(`Đã thêm ${addon.name} vào giỏ hàng!`, 'success');
                    }}
                    className="bg-[#007b5f] hover:bg-[#005a45] text-white text-[11px] font-extrabold w-[80px] h-[40px] flex items-center justify-center rounded-full cursor-pointer transition-colors shadow-xs shrink-0 leading-tight"
                  >
                    Thêm<br />Vào
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
