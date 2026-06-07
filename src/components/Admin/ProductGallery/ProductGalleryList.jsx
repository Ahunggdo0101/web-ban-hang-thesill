import { memo } from 'react';
import { Search, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeUnsplashImage } from '../../../utils/image';

export const ProductGalleryList = memo(({
  products,
  selectedProduct,
  searchInput,
  setSearchInput,
  loading,
  page,
  totalPages,
  setPage,
  onSelectProduct,
  saving
}) => {
  return (
    <div className="lg:col-span-4 bg-white border border-brand-sand shadow-sm flex flex-col max-h-[80vh] min-h-[500px]">
      
      {/* Ô Tìm kiếm sản phẩm */}
      <div className="p-4 border-b border-brand-sand bg-brand-cream/35">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-forest mb-2">Tìm kiếm sản phẩm</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-[#aaa]" size={13} />
          <input
            type="text"
            placeholder="Nhập tên sản phẩm để kiểm soát..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            disabled={saving}
            className="w-full bg-white border border-brand-sand pl-8 pr-8 py-2 text-xs focus:outline-none focus:border-brand-forest disabled:opacity-50"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              disabled={saving}
              className="absolute right-2.5 top-2.5 text-[#aaa] hover:text-brand-charcoal cursor-pointer disabled:opacity-50"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Danh sách sản phẩm kết quả */}
      <div className="flex-1 overflow-y-auto divide-y divide-brand-sand/70">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-forest" size={24} />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-[#888] font-serif text-xs px-4">
            Không tìm thấy sản phẩm nào khớp với tìm kiếm.
          </div>
        ) : (
          products.map(p => {
            const isActive = selectedProduct?.id === p.id;
            const galleryCount = Array.isArray(p.images) ? p.images.length : 0;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p)}
                disabled={saving}
                className={`w-full text-left p-3.5 flex items-center gap-3 transition-all cursor-pointer border-l-4 disabled:opacity-50 ${
                  isActive
                    ? 'bg-brand-forest/5 border-brand-forest'
                    : 'border-transparent hover:bg-brand-cream/20'
                }`}
              >
                <div className="w-10 h-10 border border-brand-sand bg-brand-cream shrink-0 overflow-hidden rounded-sm">
                  <img
                    src={optimizeUnsplashImage(p.image, 100)}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-brand-forest text-xs truncate">{p.name}</div>
                  <div className="text-[10px] text-[#888] font-serif italic truncate">{p.botanicalName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] uppercase tracking-wider font-bold bg-[#eae6dc] px-1.5 py-0.5 text-brand-charcoal">
                      {p.category}
                    </span>
                    <span className="text-[9px] font-medium text-brand-sage font-mono">
                      🖼️ {galleryCount} ảnh phụ
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Phân trang danh sách sản phẩm */}
      {totalPages > 1 && (
        <div className="border-t border-brand-sand p-3.5 bg-brand-cream/15 flex items-center justify-between">
          <span className="text-[9px] text-brand-sage font-bold uppercase tracking-wider">
            Trang {page}/{totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || saving}
              className="p-1 border border-brand-sand bg-white disabled:opacity-40 hover:bg-brand-cream cursor-pointer transition-colors"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || saving}
              className="p-1 border border-brand-sand bg-white disabled:opacity-40 hover:bg-brand-cream cursor-pointer transition-colors"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ProductGalleryList.displayName = 'ProductGalleryList';
