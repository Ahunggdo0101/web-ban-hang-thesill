import React, { useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import AreaSelector from './AreaSelector';

const AddressForm = React.memo(function AddressForm({
  editingAddressId,
  receiver,
  setReceiver,
  phone,
  setPhone,
  province,
  setProvince,
  district,
  setDistrict,
  ward,
  setWard,
  address,
  setAddress,
  isDefault,
  setIsDefault,
  addressType,
  setAddressType,
  otherTypeName,
  setOtherTypeName,
  onSubmit,
  onCancel,
  showToast
}) {
  const [showAreaSelector, setShowAreaSelector] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);

  // Xử lý khi chọn xong khu vực hành chính từ bộ chọn inline
  const handleSelectArea = useCallback((prov, dist, wrd, forceManual) => {
    if (forceManual) {
      setIsManualInput(true);
      setShowAreaSelector(false);
    } else {
      setProvince(prov);
      setDistrict(dist);
      setWard(wrd);
      setIsManualInput(false);
      setShowAreaSelector(false);
    }
  }, [setProvince, setDistrict, setWard]);

  // Xử lý khi định vị GPS thành công
  const handleGPSLocateSuccess = useCallback((addressData) => {
    setProvince(addressData.province);
    setDistrict(addressData.district);
    setWard(addressData.ward);
    if (addressData.streetAddress) {
      setAddress(addressData.streetAddress);
    }
    setIsManualInput(false);
    setShowAreaSelector(false);
  }, [setProvince, setDistrict, setWard, setAddress]);

  const handleCloseAreaSelector = useCallback(() => {
    setShowAreaSelector(false);
  }, []);

  // Nếu đang mở bộ chọn khu vực, đè hoàn toàn toàn bộ giao diện form (render inline)
  if (showAreaSelector) {
    return (
      <div className="bg-brand-white border border-brand-sand p-6 max-w-xl animate-fade-in">
        <AreaSelector
          onSelectArea={handleSelectArea}
          onGPSLocateSuccess={handleGPSLocateSuccess}
          onCancel={handleCloseAreaSelector}
          showToast={showToast}
        />
      </div>
    );
  }

  // Giao diện Form nhập địa chỉ bình thường
  return (
    <form onSubmit={onSubmit} className="bg-brand-white border border-brand-sand p-6 space-y-4 max-w-xl animate-slide-up">
      <h4 className="font-serif text-base font-semibold text-brand-forest border-b border-brand-sand/40 pb-2">
        {editingAddressId ? 'Chỉnh sửa địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng mới'}
      </h4>
      
      {/* Ô 1: Họ tên người nhận */}
      <div className="space-y-1">
        <label htmlFor="receiverInput" className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Họ tên người nhận
        </label>
        <input
          id="receiverInput"
          type="text"
          required
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          placeholder="Nguyễn Văn A"
          className="w-full border border-brand-sand bg-white px-3 py-2.5 text-xs focus:outline-none focus:border-brand-forest transition-colors"
        />
      </div>

      {/* Ô 2: Số điện thoại nhận */}
      <div className="space-y-1">
        <label htmlFor="phoneInput" className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Số điện thoại nhận
        </label>
        <input
          id="phoneInput"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0988888888"
          className="w-full border border-brand-sand bg-white px-3 py-2.5 text-xs focus:outline-none focus:border-brand-forest transition-colors"
        />
      </div>

      {/* Ô 3: Khu vực hành chính */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
            Khu vực (Tỉnh / Thành phố, Quận / Huyện, Phường / Xã)
          </label>
          <button
            type="button"
            onClick={() => setIsManualInput(prev => !prev)}
            className="text-[9px] text-brand-forest hover:underline font-bold uppercase tracking-wider cursor-pointer"
          >
            {isManualInput ? 'Chọn trên danh sách' : 'Tự nhập tay'}
          </button>
        </div>
        
        {!isManualInput ? (
          /* Chọn trên danh sách - Click sẽ mở bộ chọn inline thay thế form */
          <div 
            onClick={() => setShowAreaSelector(true)}
            className="w-full border border-brand-sand bg-white px-3 py-2.5 text-xs text-brand-charcoal hover:border-brand-forest cursor-pointer flex justify-between items-center transition-colors min-h-[38px]"
          >
            {ward ? (
              <span className="font-medium">{`${ward}, ${district}, ${province}`}</span>
            ) : (
              <span className="text-gray-400">Click để chọn Tỉnh, Quận, Phường từ danh sách...</span>
            )}
            <MapPin size={14} className="text-brand-forest" />
          </div>
        ) : (
          /* Tự nhập tay */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 animate-fade-in">
            <input
              type="text"
              placeholder="Tỉnh / Thành phố"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest"
              required
            />
            <input
              type="text"
              placeholder="Quận / Huyện"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest"
              required
            />
            <input
              type="text"
              placeholder="Phường / Xã"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest"
              required
            />
          </div>
        )}
      </div>

      {/* Ô 4: Địa chỉ chi tiết */}
      <div className="space-y-1">
        <label htmlFor="addressDetailInput" className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Địa chỉ chi tiết (Tên đường, tòa nhà, số nhà)
        </label>
        <input
          id="addressDetailInput"
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Số 10, ngõ 4, đường Nam Điền"
          className="w-full border border-brand-sand bg-white px-3 py-2.5 text-xs focus:outline-none focus:border-brand-forest transition-colors"
        />
      </div>

      {/* Ô 5: Đặt làm mặc định (Thanh gạt Switch) */}
      <div className="flex items-center pt-2">
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-forest"></div>
          <span className="ml-3 text-xs text-brand-moss font-semibold">
            Đặt làm địa chỉ giao hàng mặc định
          </span>
        </label>
      </div>

      {/* Ô 6: Chọn loại địa chỉ */}
      <div className="space-y-2 pt-2">
        <span className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Loại địa chỉ
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAddressType('home')}
            className={`px-4 py-2 text-xs font-semibold border transition-all cursor-pointer rounded-sm ${
              addressType === 'home'
                ? 'bg-brand-forest text-brand-cream border-brand-forest shadow-xs'
                : 'bg-white text-brand-moss border-brand-sand hover:border-brand-forest'
            }`}
          >
            Nhà riêng
          </button>
          <button
            type="button"
            onClick={() => setAddressType('office')}
            className={`px-4 py-2 text-xs font-semibold border transition-all cursor-pointer rounded-sm ${
              addressType === 'office'
                ? 'bg-brand-forest text-brand-cream border-brand-forest shadow-xs'
                : 'bg-white text-brand-moss border-brand-sand hover:border-brand-forest'
            }`}
          >
            Văn phòng
          </button>
          <button
            type="button"
            onClick={() => setAddressType('other')}
            className={`px-4 py-2 text-xs font-semibold border transition-all cursor-pointer rounded-sm ${
              addressType === 'other'
                ? 'bg-brand-forest text-brand-cream border-brand-forest shadow-xs'
                : 'bg-white text-brand-moss border-brand-sand hover:border-brand-forest'
            }`}
          >
            Khác
          </button>
        </div>
        
        {addressType === 'other' && (
          <input
            type="text"
            required
            value={otherTypeName}
            onChange={(e) => setOtherTypeName(e.target.value)}
            placeholder="Ví dụ: Nhà bạn gái, Kho hàng..."
            className="w-full mt-2 border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest transition-colors animate-fade-in"
          />
        )}
      </div>

      {/* Nút bấm Submit và Hủy */}
      <div className="flex gap-2 pt-4 border-t border-brand-sand/40">
        <button
          type="submit"
          className="bg-brand-forest text-brand-cream hover:bg-brand-moss py-2.5 px-6 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
        >
          {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-brand-sand hover:bg-gray-50 py-2.5 px-6 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  );
});

export default AddressForm;
