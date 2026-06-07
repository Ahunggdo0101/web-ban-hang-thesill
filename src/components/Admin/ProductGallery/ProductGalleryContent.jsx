import { memo } from 'react';
import {
  Image as ImageIcon, Sparkles, Link as LinkIcon, Trash2, ArrowLeft, ArrowRight,
  Check, RotateCcw, Save, Loader2, Crown, Camera
} from 'lucide-react';
import { optimizeUnsplashImage } from '../../../utils/image';

export const ProductGalleryContent = memo(({
  selectedProduct,
  tempMainImage,
  tempImages,
  tempColorImages,
  manualUrl,
  setManualUrl,
  isChanged,
  saving,
  onOpenPicker,
  onAddImageManual,
  onRemoveImage,
  onMoveImage,
  onSetAsMain,
  onUpdateColorImage,
  onResetChanges,
  onSaveGallery
}) => {
  if (!selectedProduct) {
    return (
      <div className="lg:col-span-8 bg-white border border-brand-sand shadow-sm rounded-sm p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
        <div className="w-16 h-16 bg-brand-cream flex items-center justify-center rounded-full border border-brand-sand/50 mb-4 animate-pulse">
          <ImageIcon className="text-brand-sage" size={28} />
        </div>
        <h3 className="font-serif text-base text-brand-forest font-light mb-1">Chưa có sản phẩm nào được chọn</h3>
        <p className="text-xs text-[#888] max-w-sm leading-relaxed">
          Vui lòng nhập tên và click chọn một sản phẩm ở danh sách bên trái để bắt đầu quản lý và kiểm soát kho ảnh phụ (gallery) của sản phẩm đó.
        </p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-8 bg-white border border-brand-sand shadow-sm flex flex-col min-h-[500px]">
      
      {/* Header chi tiết sản phẩm */}
      <div className="p-5 border-b border-brand-sand bg-brand-cream/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 border border-brand-sand bg-brand-cream overflow-hidden shrink-0 shadow-sm rounded-sm group/main">
            <img
              src={optimizeUnsplashImage(tempMainImage, 100)}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
            {/* Nút thay đổi ảnh đại diện chính trực tiếp bằng cách click */}
            <button
              type="button"
              onClick={() => onOpenPicker('main')}
              disabled={saving}
              className="absolute inset-0 bg-brand-charcoal/65 opacity-0 group-hover/main:opacity-100 transition-opacity flex items-center justify-center text-brand-cream cursor-pointer disabled:opacity-0"
              title="Thay đổi ảnh đại diện chính"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h3 className="font-serif text-base text-brand-forest font-medium leading-snug">
              {selectedProduct.name}
            </h3>
            <p className="text-[10px] font-serif italic text-brand-slate">{selectedProduct.botanicalName}</p>
            <p className="text-[9px] font-mono text-brand-sage mt-0.5 truncate max-w-[280px] sm:max-w-[400px]" title={tempMainImage}>
              Ảnh chính: <span className="underline select-all">{tempMainImage}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[9px] uppercase tracking-wider font-bold bg-[#eae6dc] text-brand-forest px-2.5 py-1 flex items-center gap-1 select-none">
            <Crown size={10} className="text-brand-clay" /> Đại diện chính: 1
          </span>
          <span className="text-[9px] uppercase tracking-wider font-bold bg-brand-forest/10 text-brand-forest px-2.5 py-1 select-none">
            Ảnh phụ (gallery): {tempImages.length}
          </span>
        </div>
      </div>

      {/* Vùng chỉnh sửa chính */}
      <div className="p-6 space-y-6 flex-grow">
        
        {/* Cách thức thêm ảnh mới */}
        <div className="border border-brand-sand/70 p-4 bg-brand-cream/10 space-y-4">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-forest flex items-center gap-1.5 select-none">
            <Sparkles size={11} className="text-brand-clay animate-pulse" /> Thêm hình ảnh phụ mới
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            
            {/* Cách 1: Chọn từ thư viện có sẵn */}
            <div className="space-y-1.5">
              <label className="block text-[9px] uppercase tracking-wider font-bold text-brand-sage">Cách 1: Lấy từ thư viện ảnh</label>
              <button
                type="button"
                onClick={() => onOpenPicker('gallery')}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-forest hover:bg-brand-green text-brand-cream border border-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                🖼️ Mở thư viện ảnh Website
              </button>
            </div>

            {/* Cách 2: Dán URL trực tiếp */}
            <form onSubmit={onAddImageManual} className="space-y-1.5">
              <label className="block text-[9px] uppercase tracking-wider font-bold text-brand-sage">Cách 2: Dán đường dẫn URL ảnh</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-2.5 top-2.5 text-[#aaa]" size={12} />
                  <input
                    type="text"
                    placeholder="Dán link Unsplash/Cloudinary..."
                    value={manualUrl}
                    onChange={e => setManualUrl(e.target.value)}
                    disabled={saving}
                    className="w-full bg-white border border-brand-sand pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-brand-forest disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualUrl || saving}
                  className="bg-brand-cream border border-brand-sand hover:bg-brand-sand/30 hover:border-brand-forest px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-forest transition-colors disabled:opacity-40 disabled:hover:bg-brand-cream disabled:hover:border-brand-sand cursor-pointer"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Grid hiển thị hình ảnh phụ (Gallery) */}
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-sage select-none">
            Bộ sưu tập ảnh phụ của sản phẩm ({tempImages.length})
          </h4>

          {tempImages.length === 0 ? (
            /* Khi mảng rỗng */
            <div className="border border-dashed border-brand-sand/80 py-16 flex flex-col items-center justify-center text-center text-[#999] bg-brand-cream/5 rounded-sm">
              <ImageIcon className="opacity-30 mb-2" size={24} />
              <p className="text-xs font-serif italic">Sản phẩm này chưa cấu hình hình ảnh phụ nào.</p>
              <p className="text-[9px] text-[#aaa] mt-1">Hãy thêm ảnh từ thư viện hoặc dán link URL ở khung phía trên.</p>
            </div>
          ) : (
            /* Danh sách lưới các ảnh */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tempImages.map((imgUrl, idx) => (
                <div
                  key={`${imgUrl}-${idx}`}
                  className="group relative aspect-square bg-brand-cream border border-brand-sand overflow-hidden shadow-sm hover:shadow transition-all flex flex-col justify-between rounded-sm"
                >
                  {/* Ảnh preview */}
                  <img
                    src={optimizeUnsplashImage(imgUrl, 200)}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Index Badge */}
                  <div className="absolute top-2 left-2 bg-[#0d231a]/80 text-brand-cream text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white/20 select-none">
                    {idx + 1}
                  </div>

                  {/* Hoạt động hover để điều chỉnh */}
                  <div className="absolute inset-0 bg-brand-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
                    
                    {/* Nút Xóa ảnh phụ & Đặt làm ảnh chính */}
                    <div className="flex justify-between items-center w-full">
                      <button
                        type="button"
                        onClick={() => onSetAsMain(idx)}
                        disabled={saving}
                        className="p-1.5 bg-brand-forest hover:bg-brand-green text-brand-cream rounded shadow cursor-pointer transition-colors disabled:opacity-50"
                        title="Đặt làm ảnh đại diện chính (hoán đổi với ảnh chính hiện tại)"
                      >
                        <Crown size={12} className="text-brand-clay" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveImage(idx)}
                        disabled={saving}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded shadow cursor-pointer transition-colors disabled:opacity-50"
                        title="Xóa ảnh này khỏi sản phẩm"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Điều hướng thay đổi thứ tự ảnh (Lên trước / Xuống sau) */}
                    <div className="flex items-center justify-between gap-1.5 bg-[#0d231a]/95 p-1 border border-white/10 shadow-lg rounded">
                      <button
                        type="button"
                        onClick={() => onMoveImage(idx, 'up')}
                        disabled={idx === 0 || saving}
                        className="flex-1 py-1 flex justify-center text-white/70 hover:text-white disabled:opacity-30 cursor-pointer hover:bg-white/10 rounded transition-colors"
                        title="Đưa ảnh lên trước"
                      >
                        <ArrowLeft size={12} />
                      </button>
                      <span className="text-[8px] font-bold text-brand-clay uppercase tracking-widest px-1 select-none">
                        Vị trí
                      </span>
                      <button
                        type="button"
                        onClick={() => onMoveImage(idx, 'down')}
                        disabled={idx === tempImages.length - 1 || saving}
                        className="flex-1 py-1 flex justify-center text-white/70 hover:text-white disabled:opacity-30 cursor-pointer hover:bg-white/10 rounded transition-colors"
                        title="Đưa ảnh xuống sau"
                      >
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Nhãn URL nhỏ dưới cùng của card ảnh */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0d231a]/85 px-1.5 py-0.5 text-[7px] text-[#ccc] truncate group-hover:hidden select-all font-mono" title={imgUrl}>
                    {imgUrl}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Hình ảnh theo màu sắc chậu */}
        <div className="space-y-3 border-t border-brand-sand pt-6">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-forest flex items-center gap-1.5 select-none">
            🍶 Hình ảnh hiển thị theo màu sắc chậu (Color Images)
          </h4>
          <p className="text-[10px] text-brand-slate leading-relaxed">
            Cấu hình hình ảnh sản phẩm tương ứng khi khách hàng chọn màu chậu. Để trống nếu muốn dùng ảnh chính mặc định.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'Charcoal', label: 'Chậu Charcoal (Đá granit)', color: '#4A4A4A' },
              { name: 'Cream', label: 'Chậu Cream (Kem mịn)', color: '#FDFBF7' },
              { name: 'Mint', label: 'Chậu Mint (Bạc hà)', color: '#E2ECE9' },
              { name: 'Terracotta', label: 'Chậu Terracotta (Đất nung)', color: '#C87D65' }
            ].map((col) => {
              const url = (tempColorImages && tempColorImages[col.name]) || '';
              return (
                <div key={col.name} className="border border-brand-sand/70 p-3 bg-brand-cream/10 rounded-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-5 h-5 rounded-full border border-brand-sand shadow-xs" style={{ backgroundColor: col.color }} title={col.label} />
                    <span className="text-[10px] font-bold text-brand-charcoal block">{col.name}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 flex gap-1.5">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => onUpdateColorImage(col.name, e.target.value)}
                      placeholder="Dán URL ảnh hoặc chọn..."
                      disabled={saving}
                      className="w-full bg-white border border-brand-sand px-2 py-1 text-[9px] focus:outline-none focus:border-brand-forest font-mono disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => onOpenPicker(`color:${col.name}`)}
                      disabled={saving}
                      className="p-1 bg-white border border-brand-sand text-[#666] hover:text-brand-forest hover:bg-brand-cream/50 cursor-pointer disabled:opacity-50"
                      title="Chọn từ thư viện ảnh"
                    >
                      <ImageIcon size={10} />
                    </button>
                    {url && (
                      <button
                        type="button"
                        onClick={() => onUpdateColorImage(col.name, '')}
                        disabled={saving}
                        className="p-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                        title="Xóa ảnh màu chậu này"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                  
                  <div className="w-8 h-8 border border-brand-sand bg-brand-cream overflow-hidden shrink-0 rounded-xs">
                    {url ? (
                      <img src={optimizeUnsplashImage(url, 100)} alt={col.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-[#bbb] italic select-none">Trống</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Action Bar: Thanh lưu trữ/Hủy bỏ */}
      <div className="p-5 border-t border-brand-sand bg-brand-cream/35 flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <div>
          {isChanged ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-brand-clay font-bold uppercase tracking-wider animate-pulse">
              ⚠️ Bạn có thay đổi chưa lưu
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-green-700 font-bold uppercase tracking-wider">
              <Check size={10} /> Đã đồng bộ với Database
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Nút Hủy bỏ */}
          <button
            type="button"
            disabled={!isChanged || saving}
            onClick={onResetChanges}
            className="inline-flex items-center gap-1.5 border border-[#bbb] bg-white hover:bg-brand-sand/15 text-brand-charcoal px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-white"
          >
            <RotateCcw size={12} /> Hủy bỏ
          </button>

          {/* Nút Lưu cấu hình */}
          <button
            type="button"
            disabled={!isChanged || saving}
            onClick={onSaveGallery}
            className="inline-flex items-center gap-1.5 bg-brand-forest hover:bg-brand-green text-brand-cream border border-transparent px-5 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow disabled:opacity-40 disabled:hover:bg-brand-forest"
          >
            {saving ? (
              <><Loader2 size={12} className="animate-spin" /> Đang lưu...</>
            ) : (
              <><Save size={12} /> Lưu thay đổi</>
            )}
          </button>
        </div>
      </div>

    </div>
  );
});

ProductGalleryContent.displayName = 'ProductGalleryContent';
