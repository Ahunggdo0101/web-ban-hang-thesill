import { useState, useEffect, useCallback } from 'react';
import {
  X, Search, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const API = API_BASE_URL;

/**
 * MediaPickerModal — Popup chọn ảnh từ thư viện dùng chung
 * Props:
 *   open: boolean               — hiển thị hay không
 *   onClose: () => void         — đóng modal
 *   onSelect: (url) => void     — callback khi chọn ảnh
 *   fetchWithAuth: fn           — hàm fetch có kèm auth token
 */
export default function MediaPickerModal({ open, onClose, onSelect, fetchWithAuth }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Cloudinary Direct state
  const [activeSubTab, setActiveSubTab] = useState('website'); // 'website' | 'cloudinary'
  const [cldItems, setCldItems] = useState([]);
  const [cldNextCursor, setCldNextCursor] = useState(null);
  const [cldLoading, setCldLoading] = useState(false);

  const LIMIT = 18;

  const load = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set('search', search);
      const res = await fetchWithAuth(`${API}/media?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotal(data.meta?.total ?? 0);
        setTotalPages(data.meta?.totalPages ?? 1);
      }
    } catch (e) {
      console.error('MediaPicker load error:', e);
    } finally {
      setLoading(false);
    }
  }, [open, page, search, fetchWithAuth]);

  useEffect(() => { load(); }, [load]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadCloudinaryMedia = useCallback(async (cursor = null, append = false) => {
    if (!open) return;
    setCldLoading(true);
    try {
      const params = new URLSearchParams({ limit: LIMIT });
      if (cursor) params.set('nextCursor', cursor);
      const res = await fetchWithAuth(`${API}/media/cloudinary?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setCldItems(prev => [...prev, ...(data.items || [])]);
        } else {
          setCldItems(data.items || []);
        }
        setCldNextCursor(data.nextCursor || null);
      }
    } catch (e) {
      console.error('MediaPicker loadCloudinaryMedia error:', e);
    } finally {
      setCldLoading(false);
    }
  }, [open, fetchWithAuth]);

  useEffect(() => {
    if (open && activeSubTab === 'cloudinary' && cldItems.length === 0) {
      loadCloudinaryMedia(null, false);
    }
  }, [open, activeSubTab, loadCloudinaryMedia, cldItems.length]);

  // Reset khi đóng/mở lại
  useEffect(() => {
    if (!open) {
      setSearchInput('');
      setSearch('');
      setPage(1);
      setActiveSubTab('website');
      setCldItems([]);
      setCldNextCursor(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0d231a]/70" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl max-h-[88vh] flex flex-col border border-brand-sand shadow-2xl animate-fade-in z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-sand bg-brand-cream/40">
          <div>
            <h3 className="font-serif text-base text-brand-forest font-medium">Chọn ảnh từ thư viện</h3>
            <p className="text-[10px] text-[#888] mt-0.5">{total} ảnh · Click vào ảnh để chọn</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#888] hover:text-brand-charcoal transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-brand-sand px-5">
          <button
            type="button"
            onClick={() => setActiveSubTab('website')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'website'
                ? 'border-brand-forest text-brand-forest'
                : 'border-transparent text-[#888] hover:text-brand-forest'
            }`}
          >
            Thư viện Website
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('cloudinary')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'cloudinary'
                ? 'border-brand-forest text-brand-forest'
                : 'border-transparent text-[#888] hover:text-brand-forest'
            }`}
          >
            Bộ nhớ Cloudinary (Trực tiếp)
          </button>
        </div>
 
        {/* Search */}
        {activeSubTab === 'website' && (
          <div className="px-5 py-3 border-b border-brand-sand/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 text-[#aaa]" size={13} />
            <input
              type="text"
              placeholder="Tìm ảnh theo tên..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full bg-brand-cream/50 border border-brand-sand pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-brand-forest"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-2.5 text-[#aaa] hover:text-brand-charcoal cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeSubTab === 'website' ? (
            loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-brand-forest" size={28} />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#aaa]">
                <ImageIcon size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-serif">
                  {search ? `Không tìm thấy ảnh khớp với "${search}"` : 'Thư viện ảnh đang trống. Hãy tải ảnh lên trong Tab Thư viện ảnh.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {items.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.title}
                    onClick={() => { onSelect(item.url); onClose(); }}
                    className="group relative aspect-square bg-brand-cream border border-brand-sand overflow-hidden hover:border-brand-forest transition-all cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-brand-forest/0 group-hover:bg-brand-forest/50 transition-all flex items-end">
                      <div className="w-full bg-brand-forest/90 p-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                        <p className="text-[9px] text-brand-cream font-bold truncate">{item.title}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            cldLoading && cldItems.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-brand-forest" size={28} />
              </div>
            ) : cldItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#aaa]">
                <ImageIcon size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-serif">Tài khoản Cloudinary của bạn đang trống.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {cldItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      title={item.title}
                      onClick={() => { onSelect(item.url); onClose(); }}
                      className="group relative aspect-square bg-brand-cream border border-brand-sand overflow-hidden hover:border-brand-forest transition-all cursor-pointer"
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-brand-forest/0 group-hover:bg-brand-forest/50 transition-all flex items-end">
                        <div className="w-full bg-brand-forest/90 p-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                          <p className="text-[9px] text-brand-cream font-bold truncate">{item.title}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Cloudinary Load More */}
                {cldNextCursor && (
                  <div className="flex justify-center pt-3">
                    <button
                      type="button"
                      onClick={() => loadCloudinaryMedia(cldNextCursor, true)}
                      disabled={cldLoading}
                      className="inline-flex items-center gap-1.5 border border-brand-forest text-brand-forest hover:bg-brand-cream/35 px-4 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {cldLoading ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <RefreshCw size={11} />
                      )}
                      {cldLoading ? 'Đang tải...' : 'Xem thêm hình ảnh'}
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Pagination cho Website Tab */}
        {activeSubTab === 'website' && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-sand px-5 py-3 bg-brand-cream/30">
            <span className="text-[10px] text-[#666] uppercase tracking-wider font-bold">
              Trang {page}/{totalPages} · {total} ảnh
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
