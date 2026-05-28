import React, { useState, useCallback, useEffect } from 'react';
import { X, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import MediaPickerModal from '../../../pages/Admin/MediaPickerModal';
import { API_BASE_URL } from '../../../config';
import { optimizeUnsplashImage } from '../../../utils/image';

const API = API_BASE_URL;

function initialProductForm(category, defaultSize) {
  return {
    id: '',
    name: '',
    botanicalName: '',
    price: '',
    description: '',
    category: category,
    image: '',
    images: '',
    light: 'medium',
    petFriendly: false,
    difficulty: 'easy',
    size: defaultSize,
    careDetails: {
      light: '',
      water: '',
      toxicity: ''
    }
  };
}

export default function ProductCreateModal({ category, defaultSize, fetchWithAuth, onSuccess, onClose, showToast }) {
  const [formData, setFormData] = useState(() => initialProductForm(category, defaultSize));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleInput = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('careDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        careDetails: { ...prev.careDetails, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
    setError('');
    if (!formData.name.trim()) return setError('Tên sản phẩm không được để trống.');
    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      return setError('Giá bán phải là số hợp lệ.');
    }
    if (!formData.image || !formData.image.trim()) {
      return setError('Vui lòng tải lên ảnh sản phẩm chính.');
    }

    setIsSubmitting(true);
    const finalId = generateSlug(formData.name);
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

    try {
      const res = await fetchWithAuth(`${API}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi server khi thêm sản phẩm');
      }
      showToast('Đã thêm sản phẩm mới thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = () => {
    const found = categories.find(c => c.id === category);
    if (found) return found.name;
    if (category === 'large-plants') return 'Cây cỡ lớn';
    if (category === 'indoor-plants') return 'Cây trong nhà';
    if (category === 'outdoor-plants') return 'Cây ngoài trời';
    return category;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0d231a]/60" onClick={() => !isSubmitting && onClose()} />
      <div className="relative bg-brand-cream w-full max-w-4xl border border-brand-sand shadow-2xl animate-fade-in modal-panel z-10 flex flex-col max-h-[92vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-brand-sand bg-white">
          <h3 className="font-serif text-lg text-brand-forest lowercase tracking-wide">
            Thêm nhanh sản phẩm {getCategoryLabel()}
          </h3>
          <button onClick={onClose} disabled={isSubmitting} className="text-brand-charcoal hover:text-brand-clay transition-colors cursor-pointer disabled:opacity-40"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-start gap-3 text-red-800">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
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
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Giá ($) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#999] text-xs">$</span>
                <input type="number" name="price" required min="0" step="any" disabled={isSubmitting} value={formData.price} onChange={handleInput} placeholder="45" className="w-full bg-white border border-brand-sand/80 pl-7 pr-3 py-2 text-xs focus:outline-none focus:border-brand-forest font-bold" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Danh mục (Khóa cứng)</label>
              <input type="text" disabled value={`${getCategoryLabel()} (${category})`} className="w-full bg-gray-100 border border-brand-sand/80 px-3 py-2 text-xs text-[#666] font-bold" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Hình ảnh sản phẩm chính *</label>
              <div className="border border-brand-sand/80 bg-white p-3 flex flex-col items-center justify-center min-h-[90px] relative transition-all duration-300">
                <input
                  type="file"
                  id="modal-product-image-upload"
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
                      htmlFor="modal-product-image-upload"
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

            <div className="space-y-1.5 flex flex-col justify-between">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Kích thước cây</label>
                <select name="size" disabled={isSubmitting} value={formData.size} onChange={handleInput} className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest cursor-pointer">
                  <option value="small">Nhỏ (small)</option>
                  <option value="medium">Vừa (medium)</option>
                  <option value="large">Lớn (large)</option>
                </select>
              </div>
              <div className="text-[9px] text-[#999] italic mt-1.5 hidden md:block">
                * Cây được tạo ở đây sẽ tự động thuộc danh mục: {getCategoryLabel()}.
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-brand-sage">Mô tả sản phẩm</label>
            <textarea name="description" rows={3} disabled={isSubmitting} value={formData.description} onChange={handleInput} placeholder="Mô tả chi tiết về cây trồng..." className="w-full bg-white border border-brand-sand/80 px-3 py-2 text-xs focus:outline-none focus:border-brand-forest resize-y" />
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
            <input type="checkbox" id="modalPetFriendly" name="petFriendly" disabled={isSubmitting} checked={formData.petFriendly} onChange={handleInput} className="accent-brand-forest w-4 h-4 cursor-pointer" />
            <label htmlFor="modalPetFriendly" className="text-xs font-bold text-brand-sage cursor-pointer select-none">Thân thiện với vật nuôi (Pet Friendly)</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-sand/55 bg-white -mx-6 -mb-6 px-6 py-4">
            <button type="button" disabled={isSubmitting || isUploadingImage} onClick={onClose} className="border border-[#bbb] hover:bg-brand-sand/20 text-brand-charcoal text-xs font-bold uppercase tracking-widest px-5 py-2.5 cursor-pointer transition-colors disabled:opacity-40">Hủy bỏ</button>
            <button type="submit" disabled={isSubmitting || isUploadingImage} className="bg-brand-forest hover:bg-brand-green text-brand-cream text-xs font-bold uppercase tracking-widest px-6 py-2.5 flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50">
              Thêm sản phẩm
            </button>
          </div>
        </form>
      </div>

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
