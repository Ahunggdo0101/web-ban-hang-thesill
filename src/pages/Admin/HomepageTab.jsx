import { useState, useEffect, useCallback } from 'react';
import {
  Save, Loader2, AlertTriangle, Image as ImageIcon, ExternalLink,
  Plus, Trash2, Eye, EyeOff, RefreshCw, Home, Upload, Search, X
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { Toast } from './shared';
import MediaPickerModal from './MediaPickerModal';

const API = API_BASE_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ImagePreview({ url, alt, size = 'sm' }) {
  const cls = size === 'sm' ? 'w-10 h-10' : 'w-16 h-16';
  if (!url) {
    return (
      <div className={`${cls} bg-brand-cream border border-dashed border-brand-sand flex items-center justify-center shrink-0`}>
        <ImageIcon size={12} className="text-[#bbb]" />
      </div>
    );
  }
  return (
    <div className={`${cls} border border-brand-sand overflow-hidden shrink-0 bg-brand-cream`}>
      <img src={url} alt={alt} className="w-full h-full object-cover" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-brand-sand/50">
      <div className="w-8 h-8 bg-brand-forest/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-brand-forest" />
      </div>
      <div>
        <h3 className="font-serif text-base text-brand-forest font-medium">{title}</h3>
        {subtitle && <p className="text-[11px] text-[#888] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Default config (fallback) ────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  happySlides: [
    'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921',
    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b',
    'https://images.unsplash.com/photo-1520412099521-63b16afe9587',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
  ],
  categories: Array.from({ length: 8 }, (_, i) => ({ title: '', image: '', path: '/shop', visible: true })),
  popularPlants: Array.from({ length: 4 }, () => ({ title: '', desc: '', rating: 5, reviewsCount: '', price: '', oldPrice: '', image: '', path: '/shop', badge: '' })),
  floorPlants: Array.from({ length: 4 }, () => ({ title: '', desc: '', rating: 5, reviewsCount: '', price: '', oldPrice: '', image: '', path: '/shop', badge: 'sale' })),
  newArrivals: Array.from({ length: 4 }, () => ({ title: '', desc: '', rating: 5, reviewsCount: '', price: '', oldPrice: '', image: '', path: '/shop', badge: 'sale' })),
};

// ─── Product Search Input Component ───────────────────────────────────────────
function ProductSearchInput({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/products?search=${encodeURIComponent(query)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.items || []);
        }
      } catch (err) {
        console.error('Lỗi search sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 text-[#aaa]" size={13} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm sản phẩm trong hệ thống..."
          className="w-full bg-brand-cream/50 border border-brand-sand pl-8 pr-8 py-1.5 text-xs focus:outline-none focus:border-brand-forest placeholder:text-[#999] placeholder:italic"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-2.5 top-2 text-[#aaa] hover:text-brand-charcoal cursor-pointer flex items-center h-full"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && (query.trim() || loading) && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 bg-white border border-brand-sand shadow-lg max-h-60 overflow-y-auto z-50 divide-y divide-brand-sand/50">
            {loading ? (
              <div className="py-4 text-center text-xs text-[#888] flex items-center justify-center gap-2">
                <Loader2 size={12} className="animate-spin text-brand-forest" />
                Đang tìm sản phẩm...
              </div>
            ) : results.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#888] italic">
                Không tìm thấy sản phẩm nào khớp với "{query}"
              </div>
            ) : (
              results.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-2 hover:bg-brand-cream/40 flex gap-2.5 items-center transition-colors cursor-pointer text-xs"
                >
                  <div className="w-8 h-8 bg-brand-cream border border-brand-sand overflow-hidden shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-brand-forest truncate">{p.name}</div>
                    <div className="text-[9px] text-[#999] italic truncate">{p.botanicalName}</div>
                  </div>
                  <div className="text-[10px] font-bold text-brand-forest shrink-0">
                    ${p.price}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomepageTab({ fetchWithAuth }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState('slides');

  // Media picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCallback, setPickerCallback] = useState(null);

  // Opens MediaPickerModal and wires up the onSelect callback
  const openPicker = useCallback((onSelectFn) => {
    setPickerCallback(() => onSelectFn);
    setPickerOpen(true);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch cấu hình hiện tại từ API
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/homepage-config`);
      if (res.ok) {
        const data = await res.json();
        setConfig(prev => ({
          ...DEFAULT_CONFIG,
          ...data,
          // Đảm bảo luôn có đủ 4/8 phần tử
          happySlides: (data.happySlides || DEFAULT_CONFIG.happySlides).slice(0, 4).concat(
            Array.from({ length: Math.max(0, 4 - (data.happySlides || []).length) }, () => '')
          ),
          categories: (data.categories || DEFAULT_CONFIG.categories).slice(0, 8).concat(
            DEFAULT_CONFIG.categories.slice((data.categories || []).length)
          ),
          popularPlants: (data.popularPlants || DEFAULT_CONFIG.popularPlants).slice(0, 4).concat(
            DEFAULT_CONFIG.popularPlants.slice((data.popularPlants || []).length)
          ),
          floorPlants: (data.floorPlants || DEFAULT_CONFIG.floorPlants).slice(0, 4).concat(
            DEFAULT_CONFIG.floorPlants.slice((data.floorPlants || []).length)
          ),
          newArrivals: (data.newArrivals || DEFAULT_CONFIG.newArrivals).slice(0, 4).concat(
            DEFAULT_CONFIG.newArrivals.slice((data.newArrivals || []).length)
          ),
        }));
      }
    } catch (e) {
      console.error('Lỗi tải cấu hình trang chủ:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // Lưu cấu hình lên server
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`${API}/homepage-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi lưu cấu hình');
      }
      showToast('Đã lưu cấu hình trang chủ thành công!');
    } catch (err) {
      showToast(err.message || 'Không thể lưu cấu hình', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Update helpers ────────────────────────────────────────────────────────
  const updateSlide = (idx, val) => setConfig(prev => {
    const slides = [...prev.happySlides];
    slides[idx] = val;
    return { ...prev, happySlides: slides };
  });

  const updateCategory = (idx, field, val) => setConfig(prev => {
    const cats = prev.categories.map((c, i) => i === idx ? { ...c, [field]: val } : c);
    return { ...prev, categories: cats };
  });

  const updateProductItem = (section, idx, field, val) => setConfig(prev => {
    const items = prev[section].map((p, i) => i === idx ? { ...p, [field]: val } : p);
    return { ...prev, [section]: items };
  });

  const handleSelectProduct = (idx, p) => {
    setConfig(prev => {
      const items = prev[activeSection].map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            title: p.name || '',
            desc: p.description ? (p.description.length > 80 ? p.description.substring(0, 80) + '...' : p.description) : '',
            price: p.price ? `Từ $${p.price}` : '',
            oldPrice: item.oldPrice || '',
            image: p.image || '',
            path: `/product/${p.id}`,
            rating: p.rating ? Math.round(p.rating) : 5,
            reviewsCount: p.reviewsCount !== undefined ? `${p.reviewsCount} reviews` : '0 reviews',
            productId: p.id
          };
        }
        return item;
      });
      return { ...prev, [activeSection]: items };
    });
  };

  const sections = [
    { id: 'slides', label: '🌿 Slider 4 ảnh' },
    { id: 'categories', label: '🏷️ Danh mục 8 ô' },
    { id: 'popularPlants', label: '⭐ Ưa chuộng nhất' },
    { id: 'floorPlants', label: '🌱 Cây lớn trên sàn' },
    { id: 'newArrivals', label: '🆕 Hàng mới về' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-forest" size={28} />
        <span className="ml-3 text-brand-sage text-sm">Đang tải cấu hình...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toast toast={toast} />

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => { if (pickerCallback) pickerCallback(url); }}
        fetchWithAuth={fetchWithAuth}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brand-forest font-light flex items-center gap-2">
            <Home size={20} className="text-brand-clay" />
            Quản lý Trang Chủ
          </h2>
          <p className="text-[11px] text-[#888] mt-0.5">Thay đổi nội dung hiển thị trên trang chủ — có hiệu lực ngay lập tức</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadConfig}
            title="Tải lại từ server"
            className="p-2 border border-brand-sand text-[#777] hover:text-brand-forest hover:bg-brand-cream/50 cursor-pointer transition-all"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-brand-forest hover:bg-brand-green text-brand-cream px-5 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? <><Loader2 size={12} className="animate-spin" /> Đang lưu...</> : <><Save size={13} /> Lưu tất cả</>}
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white border border-brand-sand">
        <div className="flex border-b border-brand-sand overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors border-b-2 ${
                activeSection === s.id
                  ? 'border-brand-forest text-brand-forest bg-brand-cream/40'
                  : 'border-transparent text-[#777] hover:text-brand-charcoal hover:bg-brand-cream/20'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── Tab: Slider 4 ảnh ── */}
          {activeSection === 'slides' && (
            <div className="space-y-5">
              <SectionHeader
                icon={ImageIcon}
                title='Slider "Plants Make People Happy"'
                subtitle="4 ảnh tự động chuyển mỗi 5 giây. Dán URL ảnh Unsplash hoặc Cloudinary."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.happySlides.map((url, idx) => (
                  <div key={idx} className="border border-brand-sand bg-brand-cream/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Ảnh {idx + 1}</span>
                      {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-forest hover:underline inline-flex items-center gap-1">
                          <ExternalLink size={10} /> Xem ảnh
                        </a>
                      )}
                    </div>
                    <div className="flex gap-3 items-center">
                      <ImagePreview url={url} alt={`Slide ${idx + 1}`} size="md" />
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={url}
                          onChange={e => updateSlide(idx, e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => openPicker(url => updateSlide(idx, url))}
                          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-brand-forest border border-brand-sand hover:bg-brand-cream/60 px-2.5 py-1.5 cursor-pointer transition-colors"
                        >
                          <ImageIcon size={10} /> Chọn từ thư viện ảnh
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: Danh mục 8 ô ── */}
          {activeSection === 'categories' && (
            <div className="space-y-5">
              <SectionHeader
                icon={ImageIcon}
                title='8 ô danh mục "Cây xanh cho mọi người"'
                subtitle="Hiển thị trên trang chủ theo lưới 4 cột. Bật/tắt từng ô riêng lẻ."
              />
              <div className="space-y-3">
                {config.categories.map((cat, idx) => (
                  <div key={idx} className={`border p-4 transition-colors ${cat.visible ? 'border-brand-sand bg-white' : 'border-brand-sand/40 bg-[#fafafa] opacity-60'}`}>
                    <div className="flex items-start gap-4">
                      {/* Số thứ tự */}
                      <div className="w-7 h-7 bg-brand-forest/10 flex items-center justify-center text-[10px] font-bold text-brand-forest shrink-0 mt-1">
                        {idx + 1}
                      </div>
                      {/* Preview */}
                      <ImagePreview url={cat.image} alt={cat.title} size="md" />
                      {/* Fields */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Tiêu đề</label>
                          <input
                            type="text"
                            value={cat.title}
                            onChange={e => updateCategory(idx, 'title', e.target.value)}
                            placeholder="Cây trồng trong nhà"
                            className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">URL ảnh</label>
                          <input
                            type="text"
                            value={cat.image}
                            onChange={e => updateCategory(idx, 'image', e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => openPicker(url => updateCategory(idx, 'image', url))}
                            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-brand-forest border border-brand-sand hover:bg-brand-cream/60 px-2 py-1 cursor-pointer transition-colors"
                          >
                            <ImageIcon size={9} /> Thư viện ảnh
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Đường link</label>
                          <input
                            type="text"
                            value={cat.path}
                            onChange={e => updateCategory(idx, 'path', e.target.value)}
                            placeholder="/shop?difficulty=easy"
                            className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest font-mono"
                          />
                        </div>
                      </div>
                      {/* Toggle hiển thị */}
                      <button
                        onClick={() => updateCategory(idx, 'visible', !cat.visible)}
                        title={cat.visible ? 'Ẩn mục này' : 'Hiện mục này'}
                        className={`p-1.5 border cursor-pointer transition-all shrink-0 mt-1 ${cat.visible ? 'border-brand-sand text-brand-forest hover:bg-brand-cream/50' : 'border-brand-sand/40 text-[#bbb] hover:text-brand-forest'}`}
                      >
                        {cat.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: Product Sections (3 section dùng chung UI) ── */}
          {['popularPlants', 'floorPlants', 'newArrivals'].includes(activeSection) && (() => {
            const sectionMeta = {
              popularPlants: { title: '4 sản phẩm "Ưa chuộng nhất"', subtitle: 'Section đầu tiên trên trang chủ — 4 cây được ưa chuộng nhất.' },
              floorPlants: { title: '4 sản phẩm "Cây lớn trên sàn"', subtitle: 'Section cây lớn — phù hợp không gian rộng.' },
              newArrivals: { title: '4 sản phẩm "Hàng mới về"', subtitle: 'Section hàng mới nhập về — cập nhật thường xuyên.' },
            };
            const meta = sectionMeta[activeSection];
            const items = config[activeSection] || [];
            const badgeOptions = [
              { value: '', label: 'Không có badge' },
              { value: 'sale', label: '🔴 Ưu đãi đặc biệt' },
              { value: 'bestseller', label: '🩵 Sản phẩm bán chạy' },
            ];

            return (
              <div className="space-y-5">
                <SectionHeader icon={ImageIcon} title={meta.title} subtitle={meta.subtitle} />
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="border border-brand-sand bg-white p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-brand-sand/30">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-brand-forest/10 flex items-center justify-center text-[10px] font-bold text-brand-forest shrink-0">
                            {idx + 1}
                          </div>
                          <ImagePreview url={item.image} alt={item.title} size="md" />
                          <div>
                            <span className="font-serif text-sm text-brand-forest font-medium block">{item.title || '(chưa đặt tên)'}</span>
                            {item.productId && (
                              <span className="inline-flex text-[9px] bg-brand-forest/10 text-brand-forest px-1.5 py-0.5 mt-0.5 font-mono">
                                Đã liên kết: {item.productId}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full sm:w-72">
                          <ProductSearchInput onSelect={(p) => handleSelectProduct(idx, p)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Tên sản phẩm *</label>
                          <input type="text" value={item.title} onChange={e => updateProductItem(activeSection, idx, 'title', e.target.value)} placeholder="Tên sản phẩm" className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Mô tả ngắn</label>
                          <input type="text" value={item.desc} onChange={e => updateProductItem(activeSection, idx, 'desc', e.target.value)} placeholder="Mô tả..." className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Giá hiển thị</label>
                          <input type="text" value={item.price} onChange={e => updateProductItem(activeSection, idx, 'price', e.target.value)} placeholder="Từ 59 đô la" className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Giá gạch (cũ)</label>
                          <input type="text" value={item.oldPrice || ''} onChange={e => updateProductItem(activeSection, idx, 'oldPrice', e.target.value)} placeholder="99 đô la" className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">URL ảnh *</label>
                          <input type="text" value={item.image} onChange={e => updateProductItem(activeSection, idx, 'image', e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest font-mono" />
                          <button
                            type="button"
                            onClick={() => openPicker(url => updateProductItem(activeSection, idx, 'image', url))}
                            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-brand-forest border border-brand-sand hover:bg-brand-cream/60 px-2 py-1 cursor-pointer transition-colors"
                          >
                            <ImageIcon size={9} /> Thư viện ảnh
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Đường link</label>
                          <input type="text" value={item.path} onChange={e => updateProductItem(activeSection, idx, 'path', e.target.value)} placeholder="/shop?size=large" className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Số sao (0-5)</label>
                          <input type="number" min="0" max="5" value={item.rating} onChange={e => updateProductItem(activeSection, idx, 'rating', Number(e.target.value))} className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Badge</label>
                          <select value={item.badge || ''} onChange={e => updateProductItem(activeSection, idx, 'badge', e.target.value)} className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest cursor-pointer">
                            {badgeOptions.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                          </select>
                        </div>
                      </div>
                      {item.rating > 0 && (
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Số đánh giá (ví dụ: "158 reviews")</label>
                          <input type="text" value={item.reviewsCount} onChange={e => updateProductItem(activeSection, idx, 'reviewsCount', e.target.value)} placeholder="158 reviews" className="w-full bg-white border border-brand-sand/80 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-forest max-w-xs" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* Save bar cố định dưới */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-brand-sand px-6 py-3 flex items-center justify-between -mx-0 shadow-sm">
        <p className="text-[10px] text-[#888] italic">Thay đổi sẽ hiệu lực ngay sau khi nhấn "Lưu tất cả"</p>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-brand-forest hover:bg-brand-green text-brand-cream px-5 py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? <><Loader2 size={12} className="animate-spin" /> Đang lưu...</> : <><Save size={13} /> Lưu tất cả</>}
        </button>
      </div>
    </div>
  );
}
