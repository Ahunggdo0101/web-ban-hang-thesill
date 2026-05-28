import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Search, X, CornerDownRight, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

export default function SlotItem({
  index,
  productId,
  largeProducts,
  onSelectProduct,
  onClearSlot,
  onDeleteSlot,
  onMoveSlot,
  isFirst,
  isLast
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Trạng thái phục vụ tìm kiếm live qua API
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const dropdownRef = useRef(null);

  // Tìm sản phẩm hiện tại tương ứng với productId của slot này
  const currentProduct = largeProducts.find(p => p.id === productId);

  // Đồng bộ search text khi currentProduct thay đổi
  useEffect(() => {
    if (currentProduct) {
      setSearch(currentProduct.name);
    } else {
      setSearch('');
    }
  }, [currentProduct]);

  // Click outside listener để đóng dropdown tìm kiếm
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Trả lại tên sản phẩm cũ nếu chưa chọn cái mới
        if (currentProduct) {
          setSearch(currentProduct.name);
        } else {
          setSearch('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currentProduct]);

  // Gọi API tìm kiếm sản phẩm theo thời gian thực (Debounced search)
  useEffect(() => {
    if (!isOpen) return;
    
    // Nếu rỗng thì không gọi API, sẽ tự động dùng list largeProducts có sẵn
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('search', search.trim());
        queryParams.set('limit', '30');

        const response = await fetch(`${API_BASE_URL}/products?${queryParams}`, {
          signal: controller.signal
        });
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.items || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Lỗi khi live search sản phẩm:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(delayDebounceFn);
    };
  }, [search, isOpen]);

  // Chọn danh sách hiển thị: Nếu gõ tìm kiếm thì hiển thị searchResults từ API, nếu không gõ thì hiển thị list largeProducts có sẵn
  const visibleOptions = search.trim() ? searchResults : largeProducts;

  return (
    <div className="bg-white border border-brand-sand/60 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-xs relative">
      
      {/* Vị trí Index & Nút Di chuyển (Move Controls) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Nút di chuyển vị trí */}
        <div className="flex flex-col gap-0.5 mr-1">
          <button
            type="button"
            onClick={() => onMoveSlot(index, 'up')}
            disabled={isFirst}
            className="p-1 hover:bg-brand-cream border border-brand-sand/50 text-[#888] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer rounded-xs"
            title="Di chuyển lên"
          >
            <ArrowUp size={11} />
          </button>
          <button
            type="button"
            onClick={() => onMoveSlot(index, 'down')}
            disabled={isLast}
            className="p-1 hover:bg-brand-cream border border-brand-sand/50 text-[#888] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer rounded-xs"
            title="Di chuyển xuống"
          >
            <ArrowDown size={11} />
          </button>
        </div>

        <span className="w-8 h-8 rounded-full bg-brand-forest text-brand-cream text-xs font-bold flex items-center justify-center">
          #{index + 1}
        </span>
        
        {/* Hình ảnh xem trước */}
        <div className="w-12 h-12 bg-brand-cream border border-brand-sand/50 overflow-hidden shrink-0 flex items-center justify-center">
          {currentProduct?.image ? (
            <img 
              src={currentProduct.image} 
              alt={currentProduct.name} 
              className="w-full h-full object-cover"
              loading="lazy" 
            />
          ) : (
            <span className="text-[10px] text-[#aaa] italic">Trống</span>
          )}
        </div>
      </div>

      {/* Tìm kiếm & Chọn sản phẩm */}
      <div className="flex-1 w-full min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Ô Tìm kiếm Dropdown */}
        <div ref={dropdownRef} className="w-full sm:max-w-md relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-[#aaa]" size={13} />
            <input
              type="text"
              placeholder="Gõ tìm kiếm cây theo tên hoặc ID từ database..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full bg-brand-cream border border-brand-sand/80 pl-9 pr-8 py-2.5 text-xs focus:outline-none focus:border-brand-forest focus:ring-1 focus:ring-brand-forest transition-all"
            />
            {isSearching && (
              <div className="absolute right-8 top-3 text-[#aaa]">
                <Loader2 size={13} className="animate-spin text-brand-forest" />
              </div>
            )}
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  onClearSlot(index);
                }}
                className="absolute right-3 top-3 text-[#aaa] hover:text-brand-charcoal cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Danh sách kết quả thả xuống */}
          {isOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-brand-sand shadow-lg max-h-60 overflow-y-auto z-50 divide-y divide-brand-sand/40">
              <button
                type="button"
                onClick={() => {
                  onClearSlot(index);
                  setSearch('');
                  setIsOpen(false);
                }}
                className="w-full text-left p-2.5 hover:bg-brand-cream/40 text-brand-clay text-xs italic font-semibold cursor-pointer"
              >
                -- Đặt vị trí này thành Lỗ Trống --
              </button>
              
              {isSearching ? (
                <div className="p-3 text-center text-xs text-[#888] flex items-center justify-center gap-2">
                  <Loader2 size={12} className="animate-spin text-brand-forest" />
                  Đang tìm kiếm trong database...
                </div>
              ) : visibleOptions.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#888] italic">
                  Không tìm thấy sản phẩm nào khớp
                </div>
              ) : (
                visibleOptions.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProduct(index, p.id);
                      setSearch(p.name);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2 hover:bg-brand-cream/40 flex gap-2.5 items-center transition-colors cursor-pointer text-xs ${
                      productId === p.id ? 'bg-brand-moss/50 font-bold bg-brand-cream/60' : ''
                    }`}
                  >
                    <div className="w-8 h-8 bg-brand-cream border border-brand-sand overflow-hidden shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-brand-forest truncate">{p.name}</div>
                      <div className="text-[9px] text-[#999] italic truncate">
                        {p.botanicalName || 'Không có tên khoa học'} · <span className="font-semibold text-brand-sage uppercase">{p.category}</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-[#d46d4f] shrink-0">
                      ${p.price}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Thông tin phụ hiển thị nhanh */}
        <div className="text-left shrink-0">
          {currentProduct ? (
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-brand-forest flex items-center gap-1">
                <CornerDownRight size={10} className="text-[#888]" />
                {currentProduct.name}
              </div>
              <div className="text-[10px] text-[#888] italic pl-3.5">{currentProduct.botanicalName || 'N/A'}</div>
              <div className="text-[10px] font-bold text-brand-clay pl-3.5">Giá: ${currentProduct.price}</div>
            </div>
          ) : (
            <span className="text-xs text-brand-clay/70 font-semibold italic">
              Vị trí này đang trống (Lỗ trống)
            </span>
          )}
        </div>
      </div>

      {/* Cụm Nút Hành Động xóa vị trí */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onDeleteSlot(index)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
          title="Xóa hẳn vị trí hiển thị này"
        >
          <Trash2 size={15} />
        </button>
      </div>

    </div>
  );
}
