import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Save, Loader2, LayoutGrid, Plus, Search, X,
  Trash2, ArrowLeftRight, PlusCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import { Toast } from '../../../pages/Admin/shared';
import SlotItem from '../LargePlants/SlotItem';
import ProductCreateModal from './ProductCreateModal';
import AddSlotsModal from './AddSlotsModal';
import TrendingSectionConfig from './TrendingSectionConfig';

const API = API_BASE_URL;

export default function CollectionManager({ category, defaultSize, title, description, fetchWithAuth }) {
  const [products, setProducts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [trending, setTrending] = useState({
    title: 'Những loại cây này đang trở nên phổ biến.',
    items: Array(4).fill(null).map(() => ({
      productId: '',
      image: '',
      title: '',
      desc: '',
      price: '',
      badge: '',
      rating: 5,
      reviewsCount: 0
    }))
  });

  const [slotSearch, setSlotSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const slotsPerPage = 10;

  const [isAddSlotsModalOpen, setIsAddSlotsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Tải toàn bộ sản phẩm và lọc theo category mong muốn
      const productsRes = await fetch(`${API}/products?limit=250`);
      let productsList = [];
      if (productsRes.ok) {
        const data = await productsRes.json();
        // Lọc các sản phẩm thuộc category được truyền vào hoặc size đối với large-plants để tương thích ngược
        if (category === 'large-plants') {
          productsList = (data.items || []).filter(p => p.size === 'large' || p.category === 'large-plants');
        } else {
          productsList = (data.items || []).filter(p => p.category === category);
        }
        setProducts(productsList);
      } else {
        throw new Error('Không thể tải danh sách sản phẩm');
      }

      // 2. Tải cấu hình slots hiển thị cho bộ sưu tập
      const configRes = await fetch(`${API}/collection-config/${category}`);
      if (configRes.ok) {
        const configData = await configRes.json();
        const loadedSlots = configData.slots || [];
        
        // Đảm bảo có tối thiểu 8 slots ban đầu
        const paddedSlots = [...loadedSlots];
        while (paddedSlots.length < 8) {
          paddedSlots.push(null);
        }
        setSlots(paddedSlots);

        // Nạp thêm phần trending
        if (configData.trending) {
          const items = configData.trending.items || [];
          const paddedItems = [...items];
          while (paddedItems.length < 4) {
            paddedItems.push({
              productId: '',
              image: '',
              title: '',
              desc: '',
              price: '',
              badge: '',
              rating: 5,
              reviewsCount: 0
            });
          }
          setTrending({
            title: configData.trending.title || 'Những loại cây này đang trở nên phổ biến.',
            items: paddedItems
          });
        }
      }
    } catch (err) {
      console.error(`Lỗi tải dữ liệu cho ${category}:`, err);
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [category, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when slot search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [slotSearch]);

  const handleSelectProduct = useCallback((index, productId) => {
    setSlots(prev => {
      const next = [...prev];
      next[index] = productId;
      return next;
    });
    showToast(`Đã gán sản phẩm vào vị trí hiển thị #${index + 1}`, 'success');
  }, [showToast]);

  const handleClearSlot = useCallback((index) => {
    setSlots(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    showToast(`Đã đưa vị trí hiển thị #${index + 1} về trạng thái trống`, 'info');
  }, [showToast]);

  const handleDeleteSlot = useCallback((index) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
    showToast(`Đã xóa vị trí hiển thị #${index + 1} thành công!`, 'success');
  }, [showToast]);

  const handleMoveSlot = useCallback((index, direction) => {
    setSlots(prev => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    showToast(
      `Đã chuyển vị trí #${index + 1} sang #${direction === 'up' ? index : index + 2} thành công!`,
      'info'
    );
  }, [showToast]);

  const handleClearAllSlots = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ vị trí hiển thị hiện tại?')) {
      setSlots([]);
      showToast('Đã xóa sạch cấu hình các vị trí hiển thị!', 'warning');
    }
  };

  const handleRemoveEmptySlots = () => {
    const nextSlots = slots.filter(id => id !== null);
    setSlots(nextSlots);
    showToast('Đã dọn dẹp các vị trí rỗng!', 'success');
  };

  const handleAddSlotsSubmit = ({ count, positionType, customIndex }) => {
    const newEmptySlots = Array(count).fill(null);

    setSlots(prev => {
      const next = [...prev];
      if (positionType === 'start') {
        return [...newEmptySlots, ...next];
      } else if (positionType === 'custom') {
        const customIdx = Math.max(0, Math.min(next.length, customIndex - 1));
        next.splice(customIdx, 0, ...newEmptySlots);
        return next;
      } else {
        return [...next, ...newEmptySlots];
      }
    });

    setIsAddSlotsModalOpen(false);
    showToast(`Đã thêm ${count} vị trí trống mới thành công!`, 'success');
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetchWithAuth(`${API}/collection-config/${category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slots,
          trending
        })
      });
      if (response.ok) {
        showToast(`Đã lưu cấu hình ${title} thành công!`, 'success');
      } else {
        const err = await response.json();
        throw new Error(err.message || 'Lỗi lưu cấu hình');
      }
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình:', err);
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Filter & Pagination cho slots ──────────────────────────────────────────
  const filteredSlotsWithIndex = useMemo(() => {
    return slots
      .map((productId, originalIndex) => {
        const product = products.find(p => p.id === productId);
        return {
          originalIndex,
          productId,
          product
        };
      })
      .filter(item => {
        if (!slotSearch.trim()) return true;
        const q = slotSearch.toLowerCase().trim();
        
        if (q.startsWith('#')) {
          const indexNum = parseInt(q.replace('#', '')) - 1;
          return item.originalIndex === indexNum;
        } else if (!isNaN(parseInt(q)) && parseInt(q).toString() === q) {
          const indexNum = parseInt(q) - 1;
          return item.originalIndex === indexNum;
        }

        if (q === 'trống' || q === 'rỗng') {
          return item.productId === null;
        }

        if (!item.product) return false;
        return (
          item.product.name.toLowerCase().includes(q) ||
          item.productId.toLowerCase().includes(q) ||
          (item.product.botanicalName && item.product.botanicalName.toLowerCase().includes(q))
        );
      });
  }, [slots, products, slotSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredSlotsWithIndex.length / slotsPerPage));
  const paginatedSlots = useMemo(() => {
    const startIndex = (currentPage - 1) * slotsPerPage;
    return filteredSlotsWithIndex.slice(startIndex, startIndex + slotsPerPage);
  }, [filteredSlotsWithIndex, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-brand-sage flex items-center justify-center gap-2">
        <Loader2 size={16} className="animate-spin text-brand-forest" />
        Đang tải cấu hình vị trí hiển thị...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* Header quản trị */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 border border-brand-sand/60 rounded">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-forest">Quản lý vị trí hiển thị: {title}</h2>
          <p className="text-[11px] text-[#888] mt-0.5">{description}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="inline-flex items-center gap-2 bg-brand-cream border border-brand-sand hover:bg-brand-sand/30 text-brand-forest px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-xs"
          >
            <PlusCircle size={13} /> Thêm sản phẩm mới
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-brand-forest hover:bg-brand-green text-brand-cream px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Lưu vị trí
          </button>
        </div>
      </div>

      {/* Control Bar: Lọc, Phân trang & Xử lý Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-4 border border-brand-sand rounded">
        {/* Tìm nhanh vị trí / sản phẩm */}
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-3 top-2.5 text-[#888]" size={14} />
          <input
            type="text"
            placeholder="Tìm slot: gõ '#1', 'tên cây', hoặc 'trống'..."
            value={slotSearch}
            onChange={e => setSlotSearch(e.target.value)}
            className="w-full bg-brand-cream border border-brand-sand/70 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand-forest rounded-xs"
          />
          {slotSearch && (
            <button
              onClick={() => setSlotSearch('')}
              className="absolute right-3 top-2.5 text-[#888] hover:text-brand-charcoal cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Nút thao tác nhanh slots */}
        <div className="lg:col-span-8 flex flex-wrap justify-start lg:justify-end gap-2">
          <button
            onClick={() => setIsAddSlotsModalOpen(true)}
            className="inline-flex items-center gap-1.5 border border-brand-sand hover:bg-brand-cream/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-forest cursor-pointer rounded-xs"
          >
            <Plus size={11} /> Thêm lỗ trống
          </button>
          <button
            onClick={handleRemoveEmptySlots}
            className="inline-flex items-center gap-1.5 border border-brand-sand hover:bg-brand-cream/60 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-forest cursor-pointer rounded-xs"
            title="Loại bỏ toàn bộ các slots trống ở giữa"
          >
            <ArrowLeftRight size={11} /> Dọn dẹp ô trống
          </button>
          <button
            onClick={handleClearAllSlots}
            className="inline-flex items-center gap-1.5 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer rounded-xs"
          >
            <Trash2 size={11} /> Xóa tất cả
          </button>
        </div>
      </div>

      {/* Slots List Grid */}
      <div className="space-y-3">
        {paginatedSlots.map((item, index) => {
          const slotDisplayIndex = (currentPage - 1) * slotsPerPage + index;
          return (
            <SlotItem
              key={slotDisplayIndex}
              index={item.originalIndex}
              productId={item.productId}
              largeProducts={products} // Truyền sản phẩm của collection tương ứng
              onSelectProduct={handleSelectProduct}
              onClearSlot={handleClearSlot}
              onDeleteSlot={handleDeleteSlot}
              onMoveSlot={handleMoveSlot}
              isFirst={item.originalIndex === 0}
              isLast={item.originalIndex === slots.length - 1}
            />
          );
        })}

        {/* Trạng thái danh sách rỗng */}
        {filteredSlotsWithIndex.length === 0 && (
          <div className="bg-white border border-brand-sand/60 p-12 text-center rounded flex flex-col items-center justify-center space-y-2">
            <LayoutGrid size={24} className="text-[#bbb]" />
            <span className="text-xs font-bold text-[#888] uppercase tracking-wider">Không tìm thấy vị trí hiển thị nào</span>
            <span className="text-[10px] text-[#aaa] max-w-xs">
              Thử nhập lại từ khóa lọc khác hoặc bấm nút "Thêm lỗ trống" để nới rộng danh sách slots.
            </span>
          </div>
        )}
      </div>

      {/* Pagination footer cho Slots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border border-brand-sand px-4 py-3 bg-white rounded-xs">
          <span className="text-[10px] text-[#666] uppercase tracking-wider font-bold">
            Hiển thị vị trí {Math.min(filteredSlotsWithIndex.length, (currentPage - 1) * slotsPerPage + 1)} - {Math.min(filteredSlotsWithIndex.length, currentPage * slotsPerPage)} trên tổng số {filteredSlotsWithIndex.length}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer rounded-xs"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-[10px] font-bold px-2 py-1 flex items-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer rounded-xs"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Trending Section Cấu Hình */}
      <TrendingSectionConfig
        trending={trending}
        setTrending={setTrending}
        showToast={showToast}
      />

      {/* Modal chèn lỗ trống */}
      {isAddSlotsModalOpen && (
        <AddSlotsModal
          slotsLength={slots.length}
          onSubmit={handleAddSlotsSubmit}
          onClose={() => setIsAddSlotsModalOpen(false)}
        />
      )}

      {/* Modal Thêm Sản Phẩm Nhanh */}
      {isProductModalOpen && (
        <ProductCreateModal
          category={category}
          defaultSize={defaultSize}
          fetchWithAuth={fetchWithAuth}
          onSuccess={loadData}
          onClose={() => setIsProductModalOpen(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
