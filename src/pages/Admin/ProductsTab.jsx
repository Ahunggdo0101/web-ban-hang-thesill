import { useState, useEffect, useCallback } from 'react';
import {
  Search, X, Filter, Check, Edit, Trash2, ChevronLeft, ChevronRight,
  Loader2, Plus, AlertTriangle, Sparkles
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { potStyles, potColors } from '../../data/products';
import { Toast, ConfirmModal } from './shared';
import { optimizeUnsplashImage } from '../../utils/image';
import MediaPickerModal from './MediaPickerModal';
import { formatVND } from '../../utils/translation';

const API = API_BASE_URL;

export default function ProductsTab({ fetchWithAuth, refreshProducts }) {
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(initialForm());
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error('Lỗi tải categories:', err));
  }, []);

  function initialForm() {
    return { id: '', name: '', botanicalName: '', price: '', description: '', category: 'plants', image: '', images: '', light: 'medium', petFriendly: false, difficulty: 'easy', size: 'medium', careDetails: { light: '', water: '', toxicity: '' } };
  }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearchQuery(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      const res = await fetch(`${API}/products?${params}`);
      const data = await res.json();
      setProducts(data.items || []);
      setTotalItems(data.meta?.totalItems ?? 0);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, searchQuery, categoryFilter]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleOpenCreate = () => {
    const defaultCat = categories.length > 0 ? categories[0].id : 'plants';
    setFormData({
      ...initialForm(),
      category: defaultCat
    });
    setFormError('');
    setModalType('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setFormError('');
    setModalType('edit');
    setSelectedId(p.id);
    setFormData({
      id: p.id, name: p.name, botanicalName: p.botanicalName || '',
      price: p.price, description: p.description || '', category: p.category || 'plants',
      image: p.image || '', images: Array.isArray(p.images) ? p.images.join(', ') : '',
      light: p.light || 'medium', petFriendly: !!p.petFriendly, difficulty: p.difficulty || 'easy',
      size: p.size || 'medium',
      careDetails: { light: p.careDetails?.light || '', water: p.careDetails?.water || '', toxicity: p.careDetails?.toxicity || '' },
    });
    setIsModalOpen(true);
  };

  const handleInput = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('careDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, careDetails: { ...prev.careDetails, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  }, []);

  const handleGenerateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, id: slug }));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Kiểm tra kích thước file (5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      showToast('Kích thước ảnh không được vượt quá 5MB', 'error');
      return;
    }

    // 2. Kiểm tra định dạng file
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
      // Eventual Consistency: Luôn xoá trên UI dù API lỗi hay không
      setFormData(prev => ({ ...prev, image: '' }));
      setIsDeletingImage(false);
    }
  };

  const generateSlug = (name) => {
    let slug = name.toLowerCase().trim();
    // Thay thế các ký tự tiếng Việt
    slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a');
    slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, 'e');
    slug = slug.replace(/[íìỉĩị]/g, 'i');
    slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o');
    slug = slug.replace(/[úùủũụưứừửữự]/g, 'u');
    slug = slug.replace(/[ýỳỷỹỵ]/g, 'y');
    slug = slug.replace(/đ/g, 'd');
    // Thay thế ký tự đặc biệt, khoảng trắng thành dấu gạch ngang
    slug = slug.replace(/[^a-z0-9 -]/g, '')
               .replace(/\s+/g, '-')
               .replace(/-+/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${slug}-${randomSuffix}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) return setFormError('Tên sản phẩm không được để trống.');
    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) return setFormError('Giá bán phải là số hợp lệ.');
    if (!formData.image || !formData.image.trim()) return setFormError('Vui lòng tải lên ảnh sản phẩm chính.');
    setIsSubmitting(true);

    let finalId = formData.id;
    if (modalType === 'create') {
      finalId = generateSlug(formData.name);
    }

    const imagesArray = [formData.image.trim()];
    const payload = { 
      id: finalId, 
      name: formData.name.trim(), 
      botanicalName: formData.botanicalName.trim(), 
      price: Number(formData.price), 
      description: formData.description.trim(), 
      category: formData.category, 
      image: formData.image.trim(), 
      images: imagesArray, 
      light: formData.light, 
      petFriendly: formData.petFriendly, 
      difficulty: formData.difficulty, 
      size: formData.size, 
      careDetails: { 
        light: formData.careDetails.light.trim(), 
        water: formData.careDetails.water.trim(), 
        toxicity: formData.careDetails.toxicity.trim() 
      } 
    };
    if (modalType !== 'create') {
      delete payload.id;
    }
    try {
      const url = modalType === 'create' ? `${API}/products` : `${API}/products/${selectedId}`;
      const method = modalType === 'create' ? 'POST' : 'PATCH';
      const res = await fetchWithAuth(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || 'Lỗi server'); }
      showToast(modalType === 'create' ? 'Đã thêm sản phẩm thành công!' : 'Đã cập nhật sản phẩm thành công!');
      setIsModalOpen(false);
      loadProducts();
      if (refreshProducts) refreshProducts();
    } catch (err) { setFormError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const productToDelete = products.find(p => p.id === deleteId);
      const imageUrl = productToDelete?.image;

      const deleteProductPromise = fetchWithAuth(`${API}/products/${deleteId}`, { method: 'DELETE' });
      const deleteImagePromise = imageUrl
        ? fetchWithAuth(`${API}/upload/image`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl }),
          })
        : Promise.resolve(null);

      const results = await Promise.allSettled([deleteProductPromise, deleteImagePromise]);
      const productResult = results[0];
      const imageResult = results[1];

      if (productResult.status === 'fulfilled') {
        const res = productResult.value;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Lỗi xóa sản phẩm');
        }
      } else {
        throw productResult.reason || new Error('Lỗi kết nối khi xóa sản phẩm');
      }

      if (imageResult && imageResult.status === 'fulfilled' && imageResult.value) {
        const res = imageResult.value;
        if (!res.ok) {
          console.warn('Không thể xóa ảnh trên Cloudinary khi xóa sản phẩm');
        }
      } else if (imageResult && imageResult.status === 'rejected') {
        console.warn('Lỗi kết nối khi xóa ảnh trên Cloudinary:', imageResult.reason);
      }

      showToast('Đã xóa sản phẩm thành công!');
      setDeleteId(null);
      loadProducts();
      if (refreshProducts) refreshProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Toast toast={toast} />
      <ConfirmModal
        open={!!deleteId}
        title="Xác nhận xóa sản phẩm?"
        description={`Xóa sản phẩm "${deleteId}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
        confirmLabel="Xóa ngay"
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => setFormData(prev => ({ ...prev, image: url }))}
        fetchWithAuth={fetchWithAuth}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-serif text-2xl text-brand-forest font-light">Quản lý sản phẩm <span className="text-sm text-[#888] font-sans font-normal">({totalItems})</span></h2>
        <button onClick={handleOpenCreate} className="inline-flex items-center gap-2 bg-brand-forest hover:bg-brand-green text-brand-cream px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-sm">
          <Plus size={13} /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-brand-sand p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-[#888]" size={14} />
          <input type="text" placeholder="Tìm theo tên, tên khoa học..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full bg-brand-cream border border-brand-sand/70 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand-forest" />
          {searchInput && <button onClick={() => setSearchInput('')} className="absolute right-3 top-2.5 text-[#888] hover:text-brand-charcoal cursor-pointer"><X size={13} /></button>}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-brand-slate" />
          <div className="flex border border-brand-sand overflow-hidden">
            {[{ v: 'all', l: 'Tất cả' }, ...categories.map(c => ({ v: c.id, l: c.name }))].map(({ v, l }) => (
              <button key={v} onClick={() => { setCategoryFilter(v); setPage(1); }} className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${categoryFilter === v ? 'bg-brand-forest text-brand-cream' : 'text-brand-charcoal hover:bg-brand-sand/30'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-sand shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/80 border-b border-brand-sand text-[10px] uppercase tracking-widest text-[#555] font-bold">
                <th className="py-3 px-4">Ảnh</th>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4">Danh mục</th>
                <th className="py-3 px-4">Giá</th>
                <th className="py-3 px-4">Thông số</th>
                <th className="py-3 px-4">Vật nuôi</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sand text-xs text-brand-charcoal">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-brand-forest" size={24} /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-[#888] font-serif">Không tìm thấy sản phẩm nào.</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-brand-cream/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-11 h-11 bg-brand-cream border border-brand-sand overflow-hidden">
                      <img src={optimizeUnsplashImage(p.image, 100)} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-brand-forest">{p.name}</div>
                    <div className="text-[10px] text-[#888] font-serif italic">{p.botanicalName}</div>
                    <div className="text-[9px] font-mono text-[#999] mt-0.5">{p.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-brand-forest/5 border border-brand-forest/15 text-brand-forest text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold">
                      {categories.find(c => c.id === p.category)?.name || p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-brand-forest">{formatVND(p.price)}</td>
                  <td className="py-3 px-4 space-y-0.5">
                    <div className="text-[10px]"><span className="text-[#999]">Nắng: </span><span className="font-semibold capitalize">{p.light}</span></div>
                    <div className="text-[10px]"><span className="text-[#999]">Chăm: </span><span className="font-semibold capitalize">{p.difficulty}</span></div>
                  </td>
                  <td className="py-3 px-4">
                    {p.petFriendly ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 text-[9px] font-bold uppercase"><Check size={8} /> an toàn</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 text-[9px] font-bold uppercase"><X size={8} /> độc tính</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <button onClick={() => handleOpenEdit(p)} className="p-1.5 border border-brand-sand text-[#777] hover:text-brand-forest hover:bg-brand-cream/50 cursor-pointer transition-all" title="Sửa"><Edit size={12} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 border border-brand-sand text-[#777] hover:text-red-500 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-all" title="Xóa"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-sand px-4 py-3 bg-brand-cream/30">
            <span className="text-[10px] text-[#666] uppercase tracking-wider font-bold">Trang {page}/{totalPages} · {totalItems} sản phẩm</span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 cursor-pointer"><ChevronLeft size={13} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 cursor-pointer"><ChevronRight size={13} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0d231a]/60" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-brand-cream w-full max-w-4xl border border-brand-sand shadow-2xl animate-fade-in modal-panel z-10 flex flex-col max-h-[92vh] overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-brand-sand bg-white">
              <h3 className="font-serif text-lg text-brand-forest lowercase tracking-wide">
                {modalType === 'create' ? 'Thêm sản phẩm mới' : `Sửa: ${formData.name}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="text-brand-charcoal hover:text-brand-clay transition-colors cursor-pointer disabled:opacity-40"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-start gap-3 text-red-800 text-xs">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Tên sản phẩm *</label>
                  <input type="text" name="name" required disabled={isSubmitting} value={formData.name} onChange={handleInput} placeholder="Monstera Deliciosa" className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Tên khoa học</label>
                  <input type="text" name="botanicalName" disabled={isSubmitting} value={formData.botanicalName} onChange={handleInput} placeholder="Monstera deliciosa" className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest italic font-serif" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage" title="Nhập số thô. Ví dụ: 39 nghĩa là 39.000 đ">Giá (x1.000 đ) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[#999] text-[10px] font-bold">đ</span>
                    <input type="number" name="price" required min="0" step="any" disabled={isSubmitting} value={formData.price} onChange={handleInput} placeholder="45" title="Nhập số thô. Ví dụ: 39 nghĩa là 39.000 đ" className="w-full bg-white border border-brand-sand/80 pl-7 pr-3 py-2 text-xs focus:outline-none focus:border-brand-forest font-bold" />
                  </div>
                  <span className="text-[8px] text-brand-slate block mt-0.5">(39 = 39.000 đ)</span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Danh mục *</label>
                  <select name="category" disabled={isSubmitting} value={formData.category} onChange={handleInput} className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest cursor-pointer">
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Ánh sáng</label>
                  <select name="light" disabled={isSubmitting} value={formData.light} onChange={handleInput} className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest cursor-pointer">
                    <option value="low">Yếu (low)</option>
                    <option value="medium">Vừa (medium)</option>
                    <option value="bright">Mạnh (bright)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Độ khó</label>
                  <select name="difficulty" disabled={isSubmitting} value={formData.difficulty} onChange={handleInput} className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest cursor-pointer">
                    <option value="easy">Dễ (easy)</option>
                    <option value="moderate">Trung bình</option>
                    <option value="care">Cần kỹ (care)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Hình ảnh sản phẩm (chính) *</label>
                  
                  {/* Container upload ảnh chuẩn Enterprise */}
                  <div className="border border-brand-sand/80 bg-white p-3 flex flex-col items-center justify-center min-h-[90px] relative transition-all duration-300">
                    <input
                      type="file"
                      id="product-image-upload"
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
                          <div className="max-w-[180px] md:max-w-[240px]">
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
                          htmlFor="product-image-upload"
                          className="inline-flex items-center bg-brand-forest hover:bg-brand-green text-brand-cream px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm disabled:opacity-50"
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
                        <span className="text-[8px] text-[#888]">Chấp nhận JPEG, PNG, WEBP tối đa 5MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Mô tả sản phẩm</label>
                <textarea name="description" rows={3} disabled={isSubmitting} value={formData.description} onChange={handleInput} placeholder="Mô tả chi tiết về cây cảnh..." className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest resize-y" />
              </div>

              <div className="border-t border-brand-sand/50 pt-4 space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-forest flex items-center gap-1.5"><Sparkles size={10} className="text-brand-clay" /> Hướng dẫn chăm sóc</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#666]">Ánh sáng (mô tả)</label>
                    <input type="text" name="careDetails.light" disabled={isSubmitting} value={formData.careDetails.light} onChange={handleInput} placeholder="Ánh sáng gián tiếp trung bình..." className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#666]">Nước tưới</label>
                    <input type="text" name="careDetails.water" disabled={isSubmitting} value={formData.careDetails.water} onChange={handleInput} placeholder="Tưới 1-2 tuần/lần..." className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#666]">Độc tính</label>
                    <input type="text" name="careDetails.toxicity" disabled={isSubmitting} value={formData.careDetails.toxicity} onChange={handleInput} placeholder="An toàn với mèo và chó..." className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="petFriendly" name="petFriendly" disabled={isSubmitting} checked={formData.petFriendly} onChange={handleInput} className="accent-brand-forest w-4 h-4 cursor-pointer" />
                <label htmlFor="petFriendly" className="text-xs font-bold text-brand-sage cursor-pointer select-none">Thân thiện với vật nuôi (Pet Friendly)</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-sand/55 bg-white -mx-6 -mb-6 px-6 py-4">
                <button type="button" disabled={isSubmitting || isUploadingImage} onClick={() => setIsModalOpen(false)} className="border border-[#bbb] hover:bg-brand-sand/20 text-brand-charcoal text-xs font-bold uppercase tracking-widest px-5 py-2.5 cursor-pointer transition-colors disabled:opacity-40">Hủy bỏ</button>
                <button type="submit" disabled={isSubmitting || isUploadingImage} className="bg-brand-forest hover:bg-brand-green text-brand-cream text-xs font-bold uppercase tracking-widest px-6 py-2.5 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50">
                  {isSubmitting ? <><Loader2 size={12} className="animate-spin" /> Đang lưu...</> : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
