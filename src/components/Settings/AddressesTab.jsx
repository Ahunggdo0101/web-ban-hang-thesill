import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AddressForm from './AddressForm';

const AddressesTab = React.memo(function AddressesTab({ user, showToast }) {
  // Hàm chuẩn hóa dữ liệu địa chỉ cũ sang cấu trúc mới
  const normalizeAddresses = useCallback((savedList) => {
    return savedList.map(addr => {
      if (addr.province && addr.district) return addr;
      return {
        id: addr.id || Date.now(),
        type: addr.name === 'Văn phòng' ? 'office' : (addr.name === 'Nhà riêng' ? 'home' : 'other'),
        name: addr.name || 'Nhà riêng',
        receiver: addr.receiver || '',
        phone: addr.phone || '',
        address: addr.address || '',
        district: addr.district || '',
        province: addr.city || addr.province || '',
        ward: addr.ward || '',
        isDefault: !!addr.isDefault
      };
    });
  }, []);

  const [addresses, setAddresses] = useState(() => {
    const key = `thesill_addresses_${user?.id || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return normalizeAddresses(JSON.parse(saved));
      } catch (e) {
        console.error('Lỗi parse địa chỉ từ localStorage:', e);
      }
    }
    
    // Dữ liệu mặc định chuẩn cấu trúc mới
    return [
      { 
        id: 1, 
        type: 'home', 
        name: 'Nhà riêng', 
        receiver: user?.name || 'Hùng Đỗ', 
        phone: '0988888888', 
        address: '123 Đường Nam Điền', 
        district: 'Huyện Nam Trực', 
        province: 'Tỉnh Nam Định', 
        ward: 'Xã Nam Điền',
        isDefault: true 
      },
      { 
        id: 2, 
        type: 'office', 
        name: 'Văn phòng', 
        receiver: user?.name || 'Đỗ Xuân Hùng', 
        phone: '0977777777', 
        address: '456 Lê Duẩn', 
        district: 'Quận Hoàn Kiếm', 
        province: 'Thành phố Hà Nội', 
        ward: 'Phường Cửa Nam',
        isDefault: false 
      }
    ];
  });

  useEffect(() => {
    const key = `thesill_addresses_${user?.id || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(addresses));
  }, [addresses, user]);

  // Form input states
  const [receiver, setReceiver] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [addressType, setAddressType] = useState('home');
  const [otherTypeName, setOtherTypeName] = useState('');

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Xử lý nạp dữ liệu lên form để Sửa
  const handleEditClick = useCallback((addr) => {
    setEditingAddressId(addr.id);
    setReceiver(addr.receiver);
    setPhone(addr.phone);
    setProvince(addr.province);
    setDistrict(addr.district);
    setWard(addr.ward || '');
    setAddress(addr.address);
    setIsDefault(addr.isDefault);
    setAddressType(addr.type || 'home');
    setOtherTypeName(addr.type === 'other' ? addr.name : '');
    
    setShowAddAddress(true);
  }, []);

  // Xử lý khi nhấn nút Thêm địa chỉ mới
  const handleAddNewClick = useCallback(() => {
    setEditingAddressId(null);
    setReceiver('');
    setPhone('');
    setProvince('');
    setDistrict('');
    setWard('');
    setAddress('');
    setIsDefault(false);
    setAddressType('home');
    setOtherTypeName('');
    
    setShowAddAddress(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowAddAddress(false);
    setEditingAddressId(null);
  }, []);

  // Xử lý Submit lưu/sửa địa chỉ
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!receiver.trim()) {
      if (showToast) showToast('Vui lòng nhập họ và tên người nhận.', 'warning');
      return;
    }
    if (!phone.trim()) {
      if (showToast) showToast('Vui lòng nhập số điện thoại nhận.', 'warning');
      return;
    }
    if (!/^\d{10,11}$/.test(phone.trim().replace(/[\s.-]/g, ''))) {
      if (showToast) showToast('Số điện thoại nhận không hợp lệ.', 'warning');
      return;
    }
    if (!province.trim() || !district.trim() || !ward.trim()) {
      if (showToast) showToast('Vui lòng chọn đầy đủ Tỉnh, Quận, Phường.', 'warning');
      return;
    }
    if (!address.trim()) {
      if (showToast) showToast('Vui lòng nhập số nhà, tên đường chi tiết.', 'warning');
      return;
    }

    let nameOfAddress = 'Nhà riêng';
    if (addressType === 'office') nameOfAddress = 'Văn phòng';
    else if (addressType === 'other') nameOfAddress = otherTypeName.trim() || 'Khác';

    const addressPayload = {
      type: addressType,
      name: nameOfAddress,
      receiver: receiver.trim(),
      phone: phone.trim(),
      province: province.trim(),
      district: district.trim(),
      ward: ward.trim(),
      address: address.trim(),
      isDefault: isDefault
    };

    if (editingAddressId) {
      setAddresses(prev => {
        let updated = prev.map(addr => addr.id === editingAddressId ? { ...addr, ...addressPayload } : addr);
        if (isDefault) {
          updated = updated.map(addr => addr.id === editingAddressId ? addr : { ...addr, isDefault: false });
        }
        return updated;
      });
      if (showToast) showToast('Đã cập nhật địa chỉ giao hàng thành công!', 'success');
    } else {
      const newId = Date.now();
      setAddresses(prev => {
        let updated = [...prev];
        if (isDefault) {
          updated = updated.map(addr => ({ ...addr, isDefault: false }));
        }
        if (updated.length === 0) {
          addressPayload.isDefault = true;
        }
        return [...updated, { id: newId, ...addressPayload }];
      });
      if (showToast) showToast('Đã lưu thêm địa chỉ giao hàng mới!', 'success');
    }

    setShowAddAddress(false);
    setEditingAddressId(null);
  }, [editingAddressId, receiver, phone, province, district, ward, address, isDefault, addressType, otherTypeName, showToast]);

  // Xóa địa chỉ
  const handleDeleteAddress = useCallback((id) => {
    setAddresses(prev => {
      const target = prev.find(addr => addr.id === id);
      if (target?.isDefault && prev.length > 1) {
        if (showToast) showToast('Không thể xóa địa chỉ mặc định. Hãy đổi mặc định sang địa chỉ khác trước.', 'warning');
        return prev;
      }
      if (showToast) showToast('Đã xóa địa chỉ thành công.', 'info');
      return prev.filter(addr => addr.id !== id);
    });
  }, [showToast]);

  // Đặt làm mặc định
  const handleSetDefaultAddress = useCallback((id) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    if (showToast) showToast('Đã thay đổi địa chỉ mặc định.', 'success');
  }, [showToast]);

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* List địa chỉ hiện tại */}
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-brand-white border border-brand-sand p-4 shadow-xs flex justify-between items-start">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-semibold text-brand-forest">{addr.name}</span>
                {addr.isDefault && (
                  <span className="bg-brand-forest/10 text-brand-forest border border-brand-forest/20 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                    Mặc định
                  </span>
                )}
              </div>
              <p className="text-xs text-[#555] font-semibold">{addr.receiver} — {addr.phone}</p>
              <p className="text-xs text-[#777] font-medium">
                {addr.address}, {addr.ward ? `${addr.ward}, ` : ''}{addr.district ? `${addr.district}, ` : ''}{addr.province}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditClick(addr)}
                className="border border-brand-sand hover:border-brand-forest text-[#555] hover:text-brand-forest text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 transition-colors cursor-pointer"
              >
                Sửa
              </button>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefaultAddress(addr.id)}
                  className="border border-brand-sand hover:border-brand-forest text-[#555] hover:text-brand-forest text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 transition-colors cursor-pointer"
                >
                  Đặt mặc định
                </button>
              )}
              <button
                onClick={() => handleDeleteAddress(addr.id)}
                className="text-red-600 hover:text-red-800 p-1.5 border border-transparent hover:border-red-100 hover:bg-red-50/50 transition-colors cursor-pointer"
                title="Xóa địa chỉ"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form thêm/sửa địa chỉ */}
      {!showAddAddress ? (
        <button
          onClick={handleAddNewClick}
          className="border border-dashed border-brand-forest text-brand-forest hover:bg-brand-forest hover:text-brand-cream text-[10px] font-bold uppercase tracking-widest py-3 px-6 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={12} /> Thêm địa chỉ mới
        </button>
      ) : (
        <AddressForm
          editingAddressId={editingAddressId}
          receiver={receiver}
          setReceiver={setReceiver}
          phone={phone}
          setPhone={setPhone}
          province={province}
          setProvince={setProvince}
          district={district}
          setDistrict={setDistrict}
          ward={ward}
          setWard={setWard}
          address={address}
          setAddress={setAddress}
          isDefault={isDefault}
          setIsDefault={setIsDefault}
          addressType={addressType}
          setAddressType={setAddressType}
          otherTypeName={otherTypeName}
          setOtherTypeName={setOtherTypeName}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          showToast={showToast}
        />
      )}
    </div>
  );
});

export default AddressesTab;
