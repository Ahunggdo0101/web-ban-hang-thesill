import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Minus, Heart, Star, Sun, Droplets, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { potStyles, potColors } from '../data/products';
import { API_BASE_URL } from '../config';
import ProductCard from '../components/ProductCard';
import useDocumentTitle from '../hooks/useDocumentTitle';
import SkeletonProductDetail from '../components/SkeletonProductDetail';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();
  const { addItem } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError404, setIsError404] = useState(false);
  const [relatedCardColors, setRelatedCardColors] = useState({});

  useDocumentTitle(product?.name);

  const [selectedStyle, setSelectedStyle] = useState(potStyles[0].name);
  const [selectedColor, setSelectedColor] = useState(potColors[0].name);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImage, setActiveImage] = useState('');
  const [imgKey, setImgKey] = useState(0); // key để trigger fade-in khi đổi ảnh

  const isFavorite = product ? isInWishlist(product.id) : false;

  // Fetch dữ liệu sản phẩm chi tiết và sản phẩm tương tự
  useEffect(() => {
    let isSubscribed = true;
    const fetchProductDetail = async () => {
      setIsLoading(true);
      setIsError404(false);
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (res.status === 404) {
          if (isSubscribed) {
            setIsError404(true);
            setProduct(null);
          }
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const productData = await res.json();
        if (isSubscribed) {
          setProduct(productData);
          addItem(productData.id); // ghi nhận vào lịch sử xem
        }

        // Fetch sản phẩm tương tự cùng danh mục
        const relatedRes = await fetch(`${API_BASE_URL}/products?category=${productData.category}&limit=5`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          if (isSubscribed) {
            // Lọc bỏ sản phẩm hiện tại
            const filtered = (relatedData.items || []).filter(p => p.id !== productData.id).slice(0, 4);
            setRelatedProducts(filtered);
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (isSubscribed) {
          setIsError404(true);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    fetchProductDetail();
    return () => {
      isSubscribed = false;
    };
  }, [id, addItem]);

  // Reset state khi sản phẩm thay đổi sau khi fetch
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setActiveTab('description');
      setSelectedStyle(potStyles[0].name);
      setSelectedColor(potColors[0].name);
      const colorImagesObj = typeof product.colorImages === 'string' ? JSON.parse(product.colorImages) : product.colorImages;
      const initImage = colorImagesObj?.[potColors[0].name] || product.image;
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
    addToCart(product, quantity, selectedStyle, selectedColor);
    showToast('Đã thêm vào giỏ!', 'success');
  }, [addToCart, product, quantity, selectedStyle, selectedColor, showToast]);

  const handleThumbnailClick = useCallback((imgUrl) => {
    setActiveImage(imgUrl);
    setImgKey(k => k + 1);
  }, []);

  const handleDecrement = useCallback(() => setQuantity(q => Math.max(1, q - 1)), []);
  const handleIncrement = useCallback(() => setQuantity(q => q + 1), []);

  // Nếu sản phẩm đang tải dữ liệu
  if (isLoading) {
    return <SkeletonProductDetail />;
  }

  // Nếu sản phẩm không tồn tại hoặc lỗi 404
  if (isError404 || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="font-serif text-3xl text-brand-forest font-light">Sản phẩm không tồn tại</h2>
        <p className="text-sm text-brand-slate max-w-md mx-auto">
          Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ khỏi cửa hàng của chúng tôi.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-brand-forest hover:bg-brand-green text-brand-white text-xs font-bold uppercase tracking-widest px-8 py-4 transition-all animate-fade-in"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  // Tập hợp ảnh gallery không trùng lặp từ product
  const colorImagesObj = typeof product.colorImages === 'string' ? JSON.parse(product.colorImages) : product.colorImages;
  const galleryItems = [
    ...(product.images || []),
    ...Object.values(colorImagesObj || {})
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-[10px] text-brand-slate uppercase tracking-widest mb-6 flex items-center space-x-2 font-bold">
        <Link to="/" className="hover:text-brand-forest transition-colors">Trang chủ</Link>
        <span className="text-brand-sand">/</span>
        <Link to="/shop" className="hover:text-brand-forest transition-colors">Cửa hàng</Link>
        <span className="text-brand-sand">/</span>
        <span className="text-brand-forest font-extrabold">{product.name}</span>
      </nav>

      {/* Main product container */}
      <div className="bg-brand-cream w-full rounded-none overflow-hidden border border-brand-sand relative flex flex-col md:flex-row">
        
        {/* ── LEFT: Image Panel ── */}
        <div className="w-full md:w-1/2 bg-brand-white p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-brand-sand">
          {/* Main Image với fade-in khi đổi */}
          <div className="flex-grow flex items-center justify-center min-h-[300px] max-h-[380px] md:max-h-[460px] overflow-hidden relative border border-brand-sand bg-brand-beige">
            <img
              key={imgKey}
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover animate-fade-in transition-opacity duration-500"
              loading="lazy"
            />
            {product.petFriendly && (
              <span className="absolute top-4 left-4 bg-brand-forest border border-[#1A372C] text-brand-cream text-[8px] uppercase font-bold tracking-widest px-3 py-1.5 shadow-sm">
                Pet Friendly
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {galleryItems.length > 1 && (
            <div className="flex space-x-2 pt-4 overflow-x-auto">
              {galleryItems.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => handleThumbnailClick(imgUrl)}
                  className={`w-14 h-14 border flex-shrink-0 transition-all cursor-pointer overflow-hidden ${
                    activeImage === imgUrl
                      ? 'border-brand-forest ring-1 ring-brand-forest scale-105'
                      : 'border-brand-sand hover:border-brand-forest opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Customization Panel ── */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between text-left">
          <div className="space-y-6">

            {/* Header Info */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest text-brand-clay font-extrabold block">
                {product.category === 'plants' ? 'Cây xanh nội thất' : 'Sản phẩm'}
              </span>
              <div className="flex justify-between items-start gap-4">
                <h2 className="font-serif text-3xl text-brand-forest font-light leading-tight">
                  {product.name}
                </h2>
                <span className="text-2xl font-light text-brand-charcoal whitespace-nowrap">${product.price}</span>
              </div>
              <p className="text-xs text-brand-slate italic font-serif mt-0.5">{product.botanicalName}</p>
              <div className="flex items-center space-x-2 pt-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" className="mr-0.5" />
                  ))}
                </div>
                <span className="text-[10px] text-brand-slate font-bold uppercase tracking-widest">
                  {product.rating} ({product.reviewsCount} Đánh giá)
                </span>
              </div>
            </div>

            <hr className="border-brand-sand" />

            {/* Pot Style Selector */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-brand-forest uppercase tracking-widest">
                1. Chọn kiểu dáng chậu: <span className="text-brand-clay font-medium ml-1 normal-case">{selectedStyle}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {potStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.name)}
                    className={`border p-3 text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                      selectedStyle === style.name
                        ? 'border-brand-forest bg-[#F0F3F1] text-brand-forest'
                        : 'border-brand-sand bg-brand-white text-[#555] hover:border-brand-forest'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block">{style.name.split(' ')[0]}</span>
                    <span className="text-[9px] text-brand-slate leading-normal font-medium">
                      {style.name.includes("Classic") ? "Men gốm mịn" : style.name.includes("Earthen") ? "Đất thô ráp" : "Chậu nhựa ươm"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pot Color Swatches */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-brand-forest uppercase tracking-widest">
                2. Chọn màu sắc chậu: <span className="text-brand-clay font-medium ml-1 normal-case">{selectedColor}</span>
              </label>
              <div className="flex space-x-3">
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
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-forest block" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Wishlist */}
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center border border-brand-sand bg-brand-white">
                <button
                  onClick={handleDecrement}
                  className="px-3.5 py-2.5 text-brand-slate hover:text-brand-forest hover:bg-brand-beige transition-colors"
                  aria-label="Giảm số lượng"
                >
                  <Minus size={11} />
                </button>
                <span className="px-4 text-xs font-bold text-brand-charcoal w-10 text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="px-3.5 py-2.5 text-brand-slate hover:text-brand-forest hover:bg-brand-beige transition-colors"
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
                className={`border p-3 transition-all hover:border-brand-forest cursor-pointer ${
                  isFavorite ? 'bg-red-50 text-red-500 border-red-200' : 'bg-brand-white border-brand-sand text-brand-slate'
                }`}
                title="Yêu thích"
                aria-label="Thêm vào yêu thích"
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <hr className="border-brand-sand" />

            {/* Info Tabs */}
            <div className="space-y-4">
              <div className="flex border-b border-brand-sand text-[10px] font-bold uppercase tracking-widest">
                {['description', 'care'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 pr-8 border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab
                        ? 'border-brand-forest text-brand-forest'
                        : 'border-transparent text-brand-slate hover:text-brand-forest'
                    }`}
                  >
                    {tab === 'description' ? 'Mô tả sản phẩm' : 'Cẩm nang chăm sóc'}
                  </button>
                ))}
              </div>

              <div className="text-xs text-brand-slate leading-relaxed min-h-[110px] font-medium">
                {activeTab === 'description' ? (
                  <p className="animate-fade-in">{product.description}</p>
                ) : (
                  <div className="space-y-4 animate-fade-in text-[#555]">
                    <div className="flex items-start">
                      <Sun size={14} className="text-brand-forest mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-brand-forest font-bold block uppercase text-[9px] tracking-wider mb-0.5">Ánh sáng:</strong>
                        <span>{(typeof product.careDetails === 'string' ? JSON.parse(product.careDetails) : product.careDetails)?.light || '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Droplets size={14} className="text-brand-forest mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-brand-forest font-bold block uppercase text-[9px] tracking-wider mb-0.5">Nước tưới:</strong>
                        <span>{(typeof product.careDetails === 'string' ? JSON.parse(product.careDetails) : product.careDetails)?.water || '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Info size={14} className="text-brand-forest mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-brand-forest font-bold block uppercase text-[9px] tracking-wider mb-0.5">Độc tính với thú cưng:</strong>
                        <span>{(typeof product.careDetails === 'string' ? JSON.parse(product.careDetails) : product.careDetails)?.toxicity || '—'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-6 border-t border-brand-sand mt-6">
            <button
              onClick={handleAddToCart}
              className="w-full bg-brand-forest hover:bg-brand-green text-brand-white font-bold py-4 text-xs uppercase tracking-widest transition-all shadow-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              THÊM VÀO GIỎ HÀNG • ${(product.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* ── RELATED PRODUCTS SECTION ── */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-brand-sand pt-12 text-left">
          <span className="text-[10px] uppercase tracking-widest text-brand-clay font-bold block mb-2">
            Có thể bạn cũng thích
          </span>
          <h3 className="font-serif text-2xl text-brand-forest font-light mb-8">
            Sản phẩm tương tự
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((plant) => (
              <ProductCard
                key={plant.id}
                plant={plant}
                activeColor={relatedCardColors[plant.id] || 'Terracotta'}
                onColorChange={(productId, colorName, e) => {
                  e.stopPropagation();
                  setRelatedCardColors(prev => ({ ...prev, [productId]: colorName }));
                }}
                addToCart={addToCart}
                potColorsInfo={[
                  { name: "Terracotta", value: "#D77A61" },
                  { name: "Cream", value: "#F5F2EB" },
                  { name: "Mint", value: "#C1D5C0" },
                  { name: "Charcoal", value: "#3E3E3E" }
                ]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
