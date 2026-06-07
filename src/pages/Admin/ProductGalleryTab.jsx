import { useState, useEffect, useCallback, useMemo } from 'react';
import { Toast, ConfirmModal } from './shared';
import MediaPickerModal from './MediaPickerModal';
import { ProductGalleryList } from '../../components/Admin/ProductGallery/ProductGalleryList';
import { ProductGalleryContent } from '../../components/Admin/ProductGallery/ProductGalleryContent';
import { API_BASE_URL } from '../../config';

const API = API_BASE_URL;

export default function ProductGalleryTab({ fetchWithAuth }) {
  // States cho danh sách sản phẩm (cột trái)
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // States cho sản phẩm được chọn & gallery (cột phải)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempMainImage, setTempMainImage] = useState(''); // Ảnh đại diện chính tạm thời
  const [tempImages, setTempImages] = useState([]); // Mảng ảnh phụ đang chỉnh sửa tạm thời
  const [tempColorImages, setTempColorImages] = useState({}); // Object ảnh theo màu chậu tạm thời
  const [manualUrl, setManualUrl] = useState(''); 
  const [pickerOpen, setPickerOpen] = useState(false); 
  const [pickerType, setPickerType] = useState('gallery'); // 'main' | 'gallery' | 'color:ColorName'
  const [saving, setSaving] = useState(false); 
  
  // Toast & Modal xác nhận
  const [toast, setToast] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Debounce tìm kiếm sản phẩm
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Tải danh sách sản phẩm ở cột trái
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 }); 
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`${API}/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.items || []);
        setTotalItems(data.meta?.totalItems ?? 0);
        setTotalPages(data.meta?.totalPages ?? 1);
      }
    } catch (e) {
      console.error('Lỗi tải sản phẩm:', e);
      showToast('Không thể kết nối đến máy chủ để tải sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Xử lý khi chọn 1 sản phẩm
  const handleSelectProduct = useCallback((product) => {
    if (saving) return; 
    setSelectedProduct(product);
    setTempMainImage(product.image || '');
    const currentImages = Array.isArray(product.images) ? [...product.images] : [];
    setTempImages(currentImages);
    
    // Khởi tạo colorImages tạm thời
    const origColorImages = product.colorImages
      ? (typeof product.colorImages === 'string' ? JSON.parse(product.colorImages) : product.colorImages)
      : {};
    setTempColorImages(origColorImages);
    setManualUrl('');
  }, [saving]);

  // Mở popup thư viện ảnh
  const handleOpenPicker = useCallback((type) => {
    setPickerType(type);
    setPickerOpen(true);
  }, []);

  // Chọn ảnh từ Media Picker Modal
  const handleSelectImageFromPicker = useCallback((url) => {
    if (!url) return;
    if (pickerType === 'main') {
      setTempMainImage(url);
      showToast('Đã thay đổi ảnh đại diện chính!');
    } else if (pickerType.startsWith('color:')) {
      const colorName = pickerType.substring(6);
      setTempColorImages(prev => ({ ...prev, [colorName]: url }));
      showToast(`Đã chọn ảnh cho chậu màu ${colorName}!`);
    } else {
      if (tempImages.includes(url)) {
        showToast('Ảnh này đã có trong bộ sưu tập sản phẩm.', 'warning');
        return;
      }
      setTempImages(prev => [...prev, url]);
      showToast('Đã thêm ảnh vào danh sách ảnh phụ tạm thời!');
    }
  }, [pickerType, tempImages, showToast]);

  // Thêm ảnh mới bằng cách dán URL thủ công
  const handleAddImageManual = useCallback((e) => {
    e.preventDefault();
    const url = manualUrl.trim();
    if (!url) return;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showToast('Đường dẫn URL ảnh không hợp lệ. Phải bắt đầu bằng http:// hoặc https://', 'error');
      return;
    }

    if (tempImages.includes(url)) {
      showToast('Ảnh này đã có trong bộ sưu tập sản phẩm.', 'warning');
      return;
    }

    setTempImages(prev => [...prev, url]);
    setManualUrl('');
    showToast('Đã thêm ảnh thủ công vào danh sách!');
  }, [manualUrl, tempImages, showToast]);

  // Xóa ảnh phụ khỏi danh sách tạm thời
  const handleRemoveImage = useCallback((indexToRemove) => {
    setTempImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  }, []);

  // Di chuyển thứ tự ảnh phụ (lên trước/xuống sau)
  const handleMoveImage = useCallback((index, direction) => {
    if (direction === 'up' && index === 0) return; 
    if (direction === 'down' && index === tempImages.length - 1) return; 

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...tempImages];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    setTempImages(updated);
  }, [tempImages]);

  // Đặt làm ảnh đại diện chính (hoán đổi với ảnh đại diện chính hiện tại)
  const handleSetAsMain = useCallback((index) => {
    const oldMain = tempMainImage;
    const newMain = tempImages[index];

    setTempMainImage(newMain);
    setTempImages(prev => prev.map((img, i) => i === index ? oldMain : img));
    showToast('Đã hoán đổi ảnh đại diện chính thành công!');
  }, [tempMainImage, tempImages, showToast]);

  // Cập nhật giá trị ảnh của một màu chậu cụ thể
  const handleUpdateColorImage = useCallback((color, url) => {
    setTempColorImages(prev => {
      const updated = { ...prev };
      if (!url) {
        delete updated[color];
      } else {
        updated[color] = url;
      }
      return updated;
    });
  }, []);

  // Đặt lại (Reset) các thay đổi chưa lưu
  const handleResetChanges = useCallback(() => {
    if (!selectedProduct) return;
    setTempMainImage(selectedProduct.image || '');
    const currentImages = Array.isArray(selectedProduct.images) ? [...selectedProduct.images] : [];
    setTempImages(currentImages);
    const origColorImages = selectedProduct.colorImages
      ? (typeof selectedProduct.colorImages === 'string' ? JSON.parse(selectedProduct.colorImages) : selectedProduct.colorImages)
      : {};
    setTempColorImages(origColorImages);
    setConfirmReset(false);
    showToast('Đã khôi phục về trạng thái ban đầu.');
  }, [selectedProduct, showToast]);

  // So sánh xem mảng tempImages, tempMainImage hoặc tempColorImages có khác bản gốc không
  const isChanged = useMemo(() => {
    if (!selectedProduct) return false;
    if (selectedProduct.image !== tempMainImage) return true;

    const original = Array.isArray(selectedProduct.images) ? selectedProduct.images : [];
    if (original.length !== tempImages.length) return true;
    if (original.some((img, idx) => img !== tempImages[idx])) return true;

    const origColorImages = selectedProduct.colorImages
      ? (typeof selectedProduct.colorImages === 'string' ? JSON.parse(selectedProduct.colorImages) : selectedProduct.colorImages)
      : {};
    const origKeys = Object.keys(origColorImages);
    const tempKeys = Object.keys(tempColorImages);
    if (origKeys.length !== tempKeys.length) return true;
    return origKeys.some(k => origColorImages[k] !== tempColorImages[k]);
  }, [selectedProduct, tempMainImage, tempImages, tempColorImages]);

  // Lưu cấu hình mảng images mới lên server
  const handleSaveGallery = useCallback(async () => {
    if (!selectedProduct || !isChanged) return;
    setSaving(true);

    try {
      const res = await fetchWithAuth(`${API}/products/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: tempMainImage,
          images: tempImages,
          colorImages: tempColorImages
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Lỗi lưu cấu hình ảnh sản phẩm');
      }

      const updatedProduct = await res.json();
      
      setSelectedProduct(updatedProduct);
      setTempMainImage(updatedProduct.image || '');
      setTempImages(Array.isArray(updatedProduct.images) ? [...updatedProduct.images] : []);
      const updatedColorImages = updatedProduct.colorImages
        ? (typeof updatedProduct.colorImages === 'string' ? JSON.parse(updatedProduct.colorImages) : updatedProduct.colorImages)
        : {};
      setTempColorImages(updatedColorImages);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      
      showToast('Đã lưu cấu hình hình ảnh sản phẩm thành công!');
    } catch (err) {
      showToast(err.message || 'Không thể lưu thay đổi', 'error');
    } finally {
      setSaving(false);
    }
  }, [selectedProduct, isChanged, tempMainImage, tempImages, tempColorImages, fetchWithAuth, showToast]);

  return (
    <div className="space-y-6">
      <Toast toast={toast} />
      
      <ConfirmModal
        open={confirmReset}
        title="Xác nhận hủy các thay đổi?"
        description="Toàn bộ hình ảnh bạn vừa thêm, sửa, xóa hoặc sắp xếp chưa được lưu sẽ bị khôi phục về trạng thái ban đầu."
        onConfirm={handleResetChanges}
        onCancel={() => setConfirmReset(false)}
        confirmLabel="Hủy thay đổi"
        cancelLabel="Tiếp tục chỉnh sửa"
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectImageFromPicker}
        fetchWithAuth={fetchWithAuth}
      />

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-brand-sand/50 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-brand-forest font-light">Kiểm soát hình ảnh sản phẩm</h2>
          <p className="text-[11px] text-brand-slate mt-1 font-sans">
            Quản lý số lượng hình ảnh thư viện phụ (Gallery) tùy ý cho từng sản phẩm của bạn.
          </p>
        </div>
      </div>

      {/* Bố cục 2 Cột chính */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CỘT TRÁI: Tìm kiếm và Danh sách sản phẩm */}
        <ProductGalleryList
          products={products}
          selectedProduct={selectedProduct}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          loading={loading}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          onSelectProduct={handleSelectProduct}
          saving={saving}
        />

        {/* CỘT PHẢI: Form kiểm soát bộ ảnh của sản phẩm */}
        <ProductGalleryContent
          selectedProduct={selectedProduct}
          tempMainImage={tempMainImage}
          tempImages={tempImages}
          tempColorImages={tempColorImages}
          manualUrl={manualUrl}
          setManualUrl={setManualUrl}
          isChanged={isChanged}
          saving={saving}
          onOpenPicker={handleOpenPicker}
          onAddImageManual={handleAddImageManual}
          onRemoveImage={handleRemoveImage}
          onMoveImage={handleMoveImage}
          onSetAsMain={handleSetAsMain}
          onUpdateColorImage={handleUpdateColorImage}
          onResetChanges={() => setConfirmReset(true)}
          onSaveGallery={handleSaveGallery}
        />

      </div>
    </div>
  );
}
