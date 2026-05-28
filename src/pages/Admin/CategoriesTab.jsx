import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusCircle, Search, X, Edit, Trash2, Loader2, Image as ImageIcon,
  AlertTriangle, Sparkles, Check, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { Toast, ConfirmModal } from './shared';
import MediaPickerModal from './MediaPickerModal';
import { optimizeUnsplashImage } from '../../utils/image';

const API = API_BASE_URL;

function initialCategoryForm() {
  return {
    id: '',
    name: '',
    description: '',
    image: ''
  };
}

export default function CategoriesTab({ fetchWithAuth }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Search và pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [formData, setFormData] = useState(initialCategoryForm());
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirm modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch danh mục từ backend
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      } else {
        throw new Error('Không thể tải danh sách danh mục');
      }
    } catch (err) {
      console.error('Lỗi tải categories:', err);
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Lọc và phân trang
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        cat.id.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q))
      );
    });
  }, [categories, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setFormData(initialCategoryForm());
    setFormError('');
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setFormError('');
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleGenerateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, id: slug }));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      showToast('Kích thước ảnh không được vượt quá 5MB', 'error');
      return;
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      showToast('Chỉ chấp nhận định dạng ảnh JPEG, PNG và WEBP', 'error');
      return;
    }

    setIsUploadingImage(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const res = await fetchWithAuth(`${API}/upload/image`, {
        method: 'POST',
        body: uploadFormData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Lỗi tải ảnh lên server');
      }
      const data = await res.json();
      setFormData(prev => ({ ...prev, image: data.url }));
      showToast('Tải ảnh lên thành công!');
    } catch (err) {
      showToast(err.message || 'Không thể tải ảnh lên', 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    const url = formData.image;
    if (!url) return;
    setIsDeletingImage(true);
    try {
      const res = await fetchWithAuth(`${API}/upload/image`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Lỗi xóa ảnh trên Cloudinary');
      }
      showToast('Đã xóa ảnh thành công!');
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa ảnh trên Cloudinary', 'error');
    } finally {
      setFormData(prev => ({ ...prev, image: '' }));
      setIsDeletingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.id.trim()) return setFormError('Mã danh mục (slug/ID) không được rỗng');
    if (!formData.name.trim()) return setFormError('Tên danh mục không được rỗng');

    setIsSubmitting(true);
    try {
      const url = modalMode === 'create' ? `${API}/categories` : `${API}/categories/${formData.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id.trim(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim()
        })
      });

      if (response.ok) {
        showToast(
          modalMode === 'create' ? 'Tạo danh mục mới thành công!' : 'Cập nhật danh mục thành công!',
          'success'
        );
        setIsModalOpen(false);
        loadCategories();
      } else {
        const err = await response.json();
        throw new Error(err.message || 'Lỗi lưu thông tin danh mục');
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`${API}/categories/${deleteId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        showToast(`Đã xóa thành công danh mục "${deleteId}"!`, 'success');
        setDeleteId(null);
        loadCategories();
      } else {
        const err = await response.json();
        throw new Error(err.message || 'Lỗi xóa danh mục');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      <ConfirmModal
        open={!!deleteId}
        title="Xác nhận xóa danh mục?"
        description={`Bạn có chắc muốn xóa danh mục "${deleteId}"? Lưu ý: Bạn chỉ xóa được những danh mục chưa chứa bất kỳ sản phẩm nào.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
        confirmLabel="Xóa ngay"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brand-forest font-light">Quản lý danh mục</h2>
          <p className="text-[11px] text-[#888] mt-0.5">Thêm, sửa, xóa, tìm kiếm danh mục sản phẩm của cửa hàng.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-brand-forest hover:bg-brand-green text-brand-cream px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-sm"
        >
          <PlusCircle size={13} /> Thêm danh mục
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-brand-sand p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-[#888]" size={14} />
          <input
            type="text"
            placeholder="Tìm theo mã ID, tên hoặc mô tả danh mục..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-brand-cream border border-brand-sand/70 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand-forest"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-[#888] hover:text-brand-charcoal cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-brand-sage flex items-center justify-center gap-2 bg-white border border-brand-sand">
          <Loader2 size={15} className="animate-spin text-brand-forest" />
          Đang tải danh sách danh mục...
        </div>
      ) : paginatedCategories.length > 0 ? (
        <div className="bg-white border border-brand-sand shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/80 border-b border-brand-sand text-[10px] uppercase tracking-widest text-[#555] font-bold">
                  <th className="py-3 px-4 w-16">Ảnh</th>
                  <th className="py-3 px-4 w-32">Mã ID (Slug)</th>
                  <th className="py-3 px-4 w-48">Tên danh mục</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4 w-28 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand/40 text-xs">
                {paginatedCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-brand-cream/10 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-9 h-9 bg-brand-cream border border-brand-sand overflow-hidden flex items-center justify-center text-[#aaa]">
                        {cat.image ? (
                          <img src={optimizeUnsplashImage(cat.image, 100)} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={14} />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-forest break-all">{cat.id}</td>
                    <td className="py-3 px-4 font-bold text-brand-charcoal">{cat.name}</td>
                    <td className="py-3 px-4 text-[#666] line-clamp-2 mt-1 border-none">{cat.description || <span className="italic text-[#aaa]">Không có mô tả</span>}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1 border border-brand-sand hover:bg-brand-cream hover:text-brand-forest text-brand-slate transition-colors cursor-pointer"
                          title="Sửa danh mục"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          className="p-1 border border-red-200 hover:bg-red-50 hover:text-red-600 text-red-400 transition-colors cursor-pointer"
                          title="Xóa danh mục"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-brand-sand px-4 py-3 bg-white">
              <span className="text-[10px] text-[#666] uppercase tracking-wider font-bold">
                Hiển thị {Math.min(filteredCategories.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredCategories.length, currentPage * itemsPerPage)} trên {filteredCategories.length}
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
        </div>
      ) : (
        <div className="bg-white border border-brand-sand p-12 text-center flex flex-col items-center justify-center space-y-2 rounded">
          <AlertTriangle size={24} className="text-brand-clay" />
          <span className="text-xs font-bold text-brand-forest uppercase tracking-wider">Không tìm thấy danh mục nào</span>
          <span className="text-[10px] text-[#aaa]">Thử đặt lại bộ lọc tìm kiếm.</span>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0d231a]/60" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-brand-cream w-full max-w-lg border border-brand-sand shadow-2xl animate-fade-in modal-panel z-10 flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-brand-sand bg-white">
              <h3 className="font-serif text-base text-brand-forest uppercase tracking-wider">
                {modalMode === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="text-brand-charcoal hover:text-brand-clay transition-colors cursor-pointer disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-start gap-3 text-red-800">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Mã ID (Slug) *</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    name="id"
                    required
                    disabled={isSubmitting || modalMode === 'edit'}
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="e.g. indoor-plants"
                    className="flex-grow bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest font-mono disabled:bg-gray-100 disabled:text-[#666]"
                  />
                  {modalMode === 'create' && (
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="text-[9px] bg-brand-cream border border-brand-sand px-3 uppercase tracking-widest font-bold text-brand-forest hover:bg-brand-sand/30 cursor-pointer whitespace-nowrap"
                    >
                      Tạo mã tự động
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Tên danh mục *</label>
                <input
                  type="text"
                  name="name"
                  required
                  disabled={isSubmitting}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Cây trong nhà"
                  className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Mô tả chi tiết</label>
                <textarea
                  name="description"
                  rows={3}
                  disabled={isSubmitting}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Giới thiệu về danh mục này..."
                  className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Ảnh đại diện danh mục</label>
                <div className="border border-brand-sand/80 bg-white p-3 flex flex-col items-center justify-center min-h-[90px] relative transition-all duration-300">
                  <input
                    type="file"
                    id="cat-image-upload"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isSubmitting || isUploadingImage}
                    onChange={handleUploadImage}
                    className="hidden"
                  />

                  {isUploadingImage ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-3">
                      <Loader2 className="animate-spin text-brand-forest" size={20} />
                      <span className="text-[10px] text-brand-sage font-semibold animate-pulse">Đang tải ảnh lên Cloud...</span>
                    </div>
                  ) : formData.image ? (
                    <div className="w-full flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 border border-brand-sand bg-brand-cream overflow-hidden shrink-0">
                          <img src={optimizeUnsplashImage(formData.image, 100)} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="max-w-[200px]">
                          <span className="text-[9px] text-brand-sage font-mono block truncate" title={formData.image}>
                            {formData.image}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        disabled={isSubmitting || isDeletingImage}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {isDeletingImage ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <label
                        htmlFor="cat-image-upload"
                        className="inline-flex items-center bg-brand-forest hover:bg-brand-green text-brand-cream px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
                      >
                        Chọn ảnh từ máy tính
                      </label>
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-brand-forest border border-brand-sand hover:bg-brand-cream/60 px-3 py-1.5 cursor-pointer transition-colors"
                      >
                        🖼️ Chọn từ thư viện ảnh
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-sand/55 bg-white -mx-6 -mb-6 px-6 py-4">
                <button
                  type="button"
                  disabled={isSubmitting || isUploadingImage}
                  onClick={() => setIsModalOpen(false)}
                  className="border border-[#bbb] hover:bg-brand-sand/20 text-brand-charcoal text-xs font-bold uppercase tracking-widest px-5 py-2.5 cursor-pointer transition-colors disabled:opacity-40"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="bg-brand-forest hover:bg-brand-green text-brand-cream text-xs font-bold uppercase tracking-widest px-6 py-2.5 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  {modalMode === 'create' ? 'Tạo danh mục' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pickerOpen && (
        <MediaPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(url) => setFormData(prev => ({ ...prev, image: url }))}
          fetchWithAuth={fetchWithAuth}
        />
      )}
    </div>
  );
}
