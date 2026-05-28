import { useState, useEffect, useCallback } from 'react';
import {
  Search, X, Upload, Trash2, Edit2, Copy, Loader2,
  Image as ImageIcon, Check, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { Toast, ConfirmModal } from './shared';

const API = API_BASE_URL;

// Format bytes to KB/MB
function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function MediaTab({ fetchWithAuth }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadPreview, setUploadPreview] = useState('');
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copied state
  const [copiedId, setCopiedId] = useState(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // Cloudinary Direct state
  const [activeSubTab, setActiveSubTab] = useState('website'); // 'website' | 'cloudinary'
  const [cldItems, setCldItems] = useState([]);
  const [cldNextCursor, setCldNextCursor] = useState(null);
  const [cldLoading, setCldLoading] = useState(false);
  const [cldDeletePublicId, setCldDeletePublicId] = useState(null);
  const [isCldDeleting, setIsCldDeleting] = useState(false);

  const LIMIT = 20;

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetchWithAuth(`${API}/media?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotal(data.meta?.total ?? 0);
        setTotalPages(data.meta?.totalPages ?? 1);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, searchQuery, fetchWithAuth]);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearchQuery(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Handle file selection for upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Ảnh không được vượt quá 5MB', 'error'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { showToast('Chỉ chấp nhận JPEG, PNG, WEBP', 'error'); return; }
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    // Auto-suggest tên dựa trên filename
    const suggested = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    setUploadTitle(suggested);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!uploadFile) { showToast('Vui lòng chọn ảnh', 'error'); return; }
    if (!uploadTitle.trim()) { showToast('Vui lòng nhập tên ảnh để dễ tìm kiếm sau này', 'error'); return; }
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('image', uploadFile);
      form.append('title', uploadTitle.trim());
      const res = await fetchWithAuth(`${API}/media`, { method: 'POST', body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi tải ảnh lên');
      }
      showToast('Đã tải ảnh lên thư viện thành công!');
      setUploadFile(null);
      setUploadPreview('');
      setUploadTitle('');
      setShowUploadPanel(false);
      setPage(1);
      setSearchInput('');
      setSearchQuery('');
      loadMedia();
    } catch (err) {
      showToast(err.message || 'Không thể tải ảnh lên', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editTitle.trim()) { showToast('Tên ảnh không được để trống', 'error'); return; }
    setIsEditing(true);
    try {
      const res = await fetchWithAuth(`${API}/media/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      if (!res.ok) throw new Error('Lỗi cập nhật tên ảnh');
      setItems(prev => prev.map(it => it.id === editId ? { ...it, title: editTitle.trim() } : it));
      showToast('Đã cập nhật tên ảnh!');
      setEditId(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`${API}/media/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Lỗi xoá ảnh');
      showToast('Đã xoá ảnh thành công!');
      setDeleteId(null);
      loadMedia();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = (item) => {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleSyncCloudinary = async () => {
    setIsSyncing(true);
    try {
      const res = await fetchWithAuth(`${API}/media/sync`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi đồng bộ hình ảnh');
      }
      const data = await res.json();
      showToast(data.message || 'Đồng bộ thành công! Đã thêm các hình ảnh mới từ Cloudinary.');
      setPage(1);
      loadMedia();
      if (activeSubTab === 'cloudinary') {
        loadCloudinaryMedia(null, false);
      }
    } catch (err) {
      showToast(err.message || 'Không thể đồng bộ từ Cloudinary', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const loadCloudinaryMedia = useCallback(async (cursor = null, append = false) => {
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
      } else {
        showToast('Không thể lấy danh sách ảnh từ Cloudinary', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi kết nối API Cloudinary', 'error');
    } finally {
      setCldLoading(false);
    }
  }, [fetchWithAuth, showToast]);

  useEffect(() => {
    if (activeSubTab === 'cloudinary' && cldItems.length === 0) {
      loadCloudinaryMedia(null, false);
    }
  }, [activeSubTab, loadCloudinaryMedia, cldItems.length]);

  const handleDeleteCloudinary = async () => {
    if (!cldDeletePublicId) return;
    setIsCldDeleting(true);
    try {
      const res = await fetchWithAuth(`${API}/media/cloudinary?publicId=${encodeURIComponent(cldDeletePublicId)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi xoá ảnh trên Cloudinary');
      }
      showToast('Đã xoá ảnh vĩnh viễn trên Cloudinary thành công!');
      setCldItems(prev => prev.filter(it => it.publicId !== cldDeletePublicId));
      setItems(prev => prev.filter(it => it.publicId !== cldDeletePublicId));
      setCldDeletePublicId(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCldDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Toast toast={toast} />
      <ConfirmModal
        open={!!deleteId}
        title="Xác nhận xoá ảnh?"
        description="Ảnh sẽ bị xoá vĩnh viễn khỏi thư viện và Cloudinary. Mọi nơi đang dùng URL này sẽ bị mất ảnh."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
        confirmLabel="Xoá ngay"
      />
      <ConfirmModal
        open={!!cldDeletePublicId}
        title="Xác nhận xoá vĩnh viễn trên Cloudinary?"
        description="Ảnh này sẽ bị xoá vĩnh viễn khỏi tài khoản Cloudinary của bạn. Điều này KHÔNG THỂ HOÀN TÁC và các website đang dùng URL này sẽ bị lỗi hiển thị ảnh."
        onConfirm={handleDeleteCloudinary}
        onCancel={() => setCldDeletePublicId(null)}
        loading={isCldDeleting}
        confirmLabel="Xoá vĩnh viễn"
      />

      {/* Tab Selector */}
      <div className="flex border-b border-brand-sand">
        <button
          onClick={() => setActiveSubTab('website')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'website'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-[#888] hover:text-brand-forest hover:bg-brand-cream/30'
          }`}
        >
          Thư viện Website ({total})
        </button>
        <button
          onClick={() => setActiveSubTab('cloudinary')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'cloudinary'
              ? 'border-brand-forest text-brand-forest'
              : 'border-transparent text-[#888] hover:text-brand-forest hover:bg-brand-cream/30'
          }`}
        >
          Bộ nhớ Cloudinary (Trực tiếp)
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brand-forest font-light flex items-center gap-2">
            <ImageIcon size={20} className="text-brand-clay" />
            Thư viện ảnh
          </h2>
          <p className="text-[11px] text-[#888] mt-0.5">{total} ảnh · Upload ảnh, đặt tên gợi nhớ, dùng ở mọi nơi trong admin</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSyncCloudinary}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 border border-brand-sand bg-white hover:bg-brand-cream text-brand-forest px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-sm disabled:opacity-55"
          >
            {isSyncing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ từ Cloudinary'}
          </button>
          <button
            onClick={() => setShowUploadPanel(p => !p)}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 bg-brand-forest hover:bg-brand-green text-brand-cream px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            <Upload size={13} />
            Tải ảnh lên thư viện
          </button>
        </div>
      </div>

      {/* Upload Panel */}
      {activeSubTab === 'website' && showUploadPanel && (
        <div className="bg-white border border-brand-sand p-5 space-y-4">
          <h3 className="text-[11px] uppercase tracking-widest font-bold text-brand-forest flex items-center gap-1.5">
            <Upload size={11} /> Tải ảnh mới lên thư viện
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* File picker */}
            <div>
              <label className="block text-[9px] uppercase tracking-wider font-bold text-[#888] mb-1.5">Chọn ảnh từ máy tính *</label>
              <div className="border border-dashed border-brand-sand bg-brand-cream/30 flex flex-col items-center justify-center min-h-[140px] relative cursor-pointer hover:bg-brand-cream/50 transition-colors">
                <input
                  id="media-upload-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                {uploadPreview ? (
                  <div className="relative w-full h-full">
                    <img src={uploadPreview} alt="preview" className="w-full h-40 object-contain p-2" />
                    <button
                      type="button"
                      onClick={() => { setUploadFile(null); setUploadPreview(''); setUploadTitle(''); }}
                      className="absolute top-1.5 right-1.5 bg-white border border-brand-sand p-0.5 text-[#888] hover:text-red-500 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="media-upload-file" className="flex flex-col items-center gap-2 cursor-pointer py-6">
                    <ImageIcon size={28} className="text-[#ccc]" />
                    <span className="text-xs text-[#888] font-medium">Click để chọn ảnh</span>
                    <span className="text-[9px] text-[#bbb]">JPEG, PNG, WEBP · Tối đa 5MB</span>
                  </label>
                )}
              </div>
            </div>

            {/* Title + submit */}
            <div className="flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] uppercase tracking-wider font-bold text-[#888]">Tên nhãn gợi nhớ *</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="ví dụ: Banner mùa hè 2026, Cây Monstera góc trái..."
                  className="w-full bg-white border border-brand-sand/80 px-3 py-2.5 text-xs focus:outline-none focus:border-brand-forest"
                  disabled={isUploading}
                />
                <p className="text-[9px] text-[#aaa] italic">
                  Đặt tên mô tả cụ thể để tìm kiếm nhanh sau này.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowUploadPanel(false); setUploadFile(null); setUploadPreview(''); setUploadTitle(''); }}
                  disabled={isUploading}
                  className="flex-1 border border-[#bbb] hover:bg-gray-50 text-brand-charcoal text-[10px] font-bold uppercase tracking-wider py-2.5 cursor-pointer transition-colors disabled:opacity-40"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading || !uploadFile || !uploadTitle.trim()}
                  className="flex-1 bg-brand-forest hover:bg-brand-green text-brand-cream text-[10px] font-bold uppercase tracking-wider py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isUploading ? <><Loader2 size={11} className="animate-spin" /> Đang tải lên...</> : <><Upload size={11} /> Tải lên thư viện</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {activeSubTab === 'website' && (
        <div className="bg-white border border-brand-sand p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 text-[#888]" size={14} />
            <input
              type="text"
              placeholder="Tìm ảnh theo tên nhãn..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full bg-brand-cream border border-brand-sand/70 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand-forest"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-3 top-2.5 text-[#888] hover:text-brand-charcoal cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="bg-white border border-brand-sand shadow-sm overflow-hidden">
        {activeSubTab === 'website' ? (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-brand-forest" size={28} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#bbb]">
              <ImageIcon size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-serif text-[#888]">
                {searchQuery ? `Không tìm thấy ảnh nào khớp với "${searchQuery}"` : 'Thư viện ảnh đang trống. Hãy tải ảnh lên!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 divide-x divide-y divide-brand-sand/50">
              {items.map(item => (
                <div key={item.id} className="group relative bg-white hover:bg-brand-cream/20 transition-colors">
                  {/* Ảnh preview */}
                  <div className="aspect-square overflow-hidden bg-brand-cream border-b border-brand-sand/40">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Info & Actions */}
                  <div className="p-3 space-y-2">
                    {editId === item.id ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditId(null); }}
                          className="flex-1 bg-white border border-brand-forest px-2 py-0.5 text-[10px] focus:outline-none min-w-0"
                          autoFocus
                          disabled={isEditing}
                        />
                        <button
                          onClick={handleEditSave}
                          disabled={isEditing}
                          className="p-1 bg-brand-forest text-white hover:bg-brand-green cursor-pointer disabled:opacity-50"
                        >
                          {isEditing ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          disabled={isEditing}
                          className="p-1 border border-brand-sand text-[#888] hover:text-red-500 cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <p
                        className="text-[10px] font-bold text-brand-charcoal truncate cursor-default"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                    )}

                    {item.bytes && (
                      <p className="text-[9px] text-[#bbb]">{formatBytes(item.bytes)}{item.format ? ` · ${item.format.toUpperCase()}` : ''}{item.width ? ` · ${item.width}×${item.height}` : ''}</p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-1 pt-0.5">
                      <button
                        onClick={() => handleCopyUrl(item)}
                        title="Copy URL"
                        className={`flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                          copiedId === item.id
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'border-brand-sand text-[#888] hover:text-brand-forest hover:bg-brand-cream/50'
                        }`}
                      >
                        {copiedId === item.id ? <><CheckCircle2 size={9} /> Copied!</> : <><Copy size={9} /> URL</>}
                      </button>
                      <button
                        onClick={() => { setEditId(item.id); setEditTitle(item.title); }}
                        title="Sửa tên"
                        className="p-1.5 border border-brand-sand text-[#888] hover:text-brand-forest hover:bg-brand-cream/50 cursor-pointer transition-all"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        title="Xoá ảnh"
                        className="p-1.5 border border-brand-sand text-[#888] hover:text-red-500 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Chế độ Cloudinary trực tiếp
          cldLoading && cldItems.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-brand-forest" size={28} />
            </div>
          ) : cldItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#bbb]">
              <ImageIcon size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-serif text-[#888]">Tài khoản Cloudinary của bạn đang trống.</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 divide-x divide-y divide-brand-sand/50 border border-brand-sand/50">
                {cldItems.map(item => (
                  <div key={item.id} className="group relative bg-white hover:bg-brand-cream/20 transition-colors">
                    {/* Ảnh preview */}
                    <div className="aspect-square overflow-hidden bg-brand-cream border-b border-brand-sand/40">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Info & Actions */}
                    <div className="p-3 space-y-2">
                      <p
                        className="text-[10px] font-bold text-brand-charcoal truncate cursor-default"
                        title={item.publicId}
                      >
                        {item.title}
                      </p>

                      {item.bytes && (
                        <p className="text-[9px] text-[#bbb]">
                          {formatBytes(item.bytes)}
                          {item.format ? ` · ${item.format.toUpperCase()}` : ''}
                          {item.width ? ` · ${item.width}×${item.height}` : ''}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-1 pt-0.5">
                        <button
                          onClick={() => handleCopyUrl(item)}
                          title="Copy URL"
                          className={`flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                            copiedId === item.id
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'border-brand-sand text-[#888] hover:text-brand-forest hover:bg-brand-cream/50'
                          }`}
                        >
                          {copiedId === item.id ? <><CheckCircle2 size={9} /> Copied!</> : <><Copy size={9} /> URL</>}
                        </button>
                        <button
                          onClick={() => setCldDeletePublicId(item.publicId)}
                          title="Xoá vĩnh viễn trên Cloudinary"
                          className="flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-bold uppercase tracking-wider border border-brand-sand text-[#888] hover:text-red-500 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-all"
                        >
                          <Trash2 size={9} /> Xoá
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cloudinary Load More */}
              {cldNextCursor && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => loadCloudinaryMedia(cldNextCursor, true)}
                    disabled={cldLoading}
                    className="inline-flex items-center gap-2 border border-brand-forest text-brand-forest hover:bg-brand-cream/30 px-6 py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                  >
                    {cldLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    {cldLoading ? 'Đang tải thêm...' : 'Xem thêm hình ảnh'}
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {/* Pagination cho Website Tab */}
        {activeSubTab === 'website' && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-sand px-5 py-3 bg-brand-cream/30">
            <span className="text-[10px] text-[#666] uppercase tracking-wider font-bold">
              Trang {page}/{totalPages} · {total} ảnh
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 cursor-pointer">
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 cursor-pointer">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
