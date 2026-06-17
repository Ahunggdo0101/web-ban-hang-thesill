import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';
import { CreditCard, Lock, CheckCircle2, ArrowLeft, ShoppingBag, AlertCircle } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { optimizeUnsplashImage } from '../utils/image';
import { translatePotColor, translatePotStyleShort, formatVND } from '../utils/translation';

export default function CheckoutPage() {
  useDocumentTitle('Thanh Toán');
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchWithAuth, isSettingsModalOpen, setIsSettingsModalOpen, setSettingsActiveTab } = useAuth();
  const { showToast } = useToast();
  const guestState = location.state || {};

  // Form states
  const [email, setEmail] = useState(user?.email || guestState.guestEmail || '');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [createdOrder, setCreatedOrder] = useState(null);
  
  // VAT states
  const [vatRequested, setVatRequested] = useState(false);
  const [vatCompanyName, setVatCompanyName] = useState('');
  const [vatTaxCode, setVatTaxCode] = useState('');
  const [vatCompanyAddr, setVatCompanyAddr] = useState('');
  const [vatEmail, setVatEmail] = useState('');

  // Tải địa chỉ đã lưu của User hoặc Guest từ localStorage
  useEffect(() => {
    const userId = user?.id || 'guest';
    const key = `thesill_addresses_${userId}`;
    const saved = localStorage.getItem(key);
    let parsedAddresses = [];
    
    if (saved) {
      try {
        parsedAddresses = JSON.parse(saved);
      } catch (e) {
        console.error('Lỗi parse địa chỉ ở Checkout:', e);
      }
    }
    
    setSavedAddresses(parsedAddresses);

    if (user) {
      if (!email) setEmail(user.email || '');
    } else {
      if (guestState.guestEmail) {
        if (!email) setEmail(guestState.guestEmail || '');
      }
    }

    // Tự động chọn địa chỉ mặc định hoặc địa chỉ đầu tiên
    if (parsedAddresses.length > 0) {
      const defaultAddr = parsedAddresses.find(addr => addr.isDefault) || parsedAddresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } else {
      setSelectedAddressId(null);
    }
  }, [user, guestState.guestEmail, isSettingsModalOpen]);

  // Đồng bộ hóa thông tin địa chỉ tĩnh lên form để submit API
  useEffect(() => {
    const selected = savedAddresses.find(a => String(a.id) === String(selectedAddressId));
    if (selected) {
      setFullName(selected.receiver || '');
      setPhone(selected.phone || '');
      setAddress(selected.address || '');
      setCity(selected.province || selected.city || '');
      setDistrict(selected.ward ? `${selected.ward}, ${selected.district}` : (selected.district || ''));
    } else {
      setFullName('');
      setPhone('');
      setAddress('');
      setCity('');
      setDistrict('');
    }
  }, [selectedAddressId, savedAddresses]);

  // Error state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [appliedProductVoucher, setAppliedProductVoucher] = useState(null);
  const [appliedShippingVoucher, setAppliedShippingVoucher] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Phí vận chuyển gốc
  const shippingFee = cartTotal >= 150000 ? 0 : 15000;

  // Tính toán discount thực tế
  const productDiscount = appliedProductVoucher ? appliedProductVoucher.discountAmount : 0;
  const shippingDiscount = appliedShippingVoucher ? Math.min(appliedShippingVoucher.discountAmount, shippingFee) : 0;
  const totalDiscount = productDiscount + shippingDiscount;

  const grandTotal = Math.max(0, cartTotal - productDiscount + Math.max(0, shippingFee - shippingDiscount));

  // Tải danh sách voucher của tôi khi mở modal
  const loadMyVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const url = `${API_BASE_URL}/vouchers/my-vouchers`;
      let data;
      if (user) {
        const res = await fetchWithAuth(url);
        if (res.ok) {
          data = await res.json();
        } else {
          data = [];
        }
      } else {
        const response = await fetch(url);
        if (response.ok) {
          data = await response.json();
        } else {
          data = [];
        }
      }
      if (Array.isArray(data)) {
        setMyVouchers(data);
      }
    } catch (err) {
      console.error('Lỗi tải vouchers:', err);
    } finally {
      setLoadingVouchers(false);
    }
  };

  useEffect(() => {
    if (isVoucherModalOpen) {
      loadMyVouchers();
    }
  }, [isVoucherModalOpen]);

  const handleApplyPromo = async (codeToApply) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) return;

    try {
      const payload = {
        code,
        items: cartItems.map(item => ({
          productId: item.product.id,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size || 'medium'
        }))
      };

      const headers = { 'Content-Type': 'application/json' };
      let data;
      let response;

      if (user) {
        response = await fetchWithAuth(`${API_BASE_URL}/vouchers/apply`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/vouchers/apply`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Mã giảm giá không hợp lệ.');
      }
      data = await response.json();

      if (data.type === 'product') {
        setAppliedProductVoucher(data);
        showToast(`Đã áp dụng mã giảm giá sản phẩm: Giảm ${data.discountAmount.toLocaleString('vi-VN')} đ!`, 'success');
      } else if (data.type === 'shipping') {
        setAppliedShippingVoucher(data);
        showToast(`Đã áp dụng mã ưu đãi vận chuyển: Giảm ${data.discountAmount.toLocaleString('vi-VN')} đ!`, 'success');
      }
      setPromoInput('');
      setIsVoucherModalOpen(false);
    } catch (error) {
      showToast(error.message || 'Mã giảm giá không hợp lệ.', 'error');
    }
  };

  const handleRemoveProductVoucher = () => {
    setAppliedProductVoucher(null);
    showToast('Đã gỡ mã giảm giá sản phẩm.', 'info');
  };

  const handleRemoveShippingVoucher = () => {
    setAppliedShippingVoucher(null);
    showToast('Đã gỡ mã ưu đãi vận chuyển.', 'info');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // 1. Email validation
    if (!email) {
      newErrors.email = 'Vui lòng nhập email liên lạc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }

    // 2. Shipping Info validation
    if (!selectedAddressId) {
      newErrors.address = 'Vui lòng chọn hoặc cấu hình địa chỉ giao hàng trong Cài đặt';
      showToast('Vui lòng thiết lập địa chỉ nhận hàng để tiếp tục.', 'error');
    }

    // 3. VAT Invoice validation
    if (vatRequested) {
      if (!vatCompanyName.trim()) newErrors.vatCompanyName = 'Vui lòng nhập tên công ty';
      if (!vatTaxCode.trim()) {
        newErrors.vatTaxCode = 'Vui lòng nhập mã số thuế';
      } else if (!/^\d{10}(\d{3})?$/.test(vatTaxCode.trim().replace(/[\s-]/g, ''))) {
        newErrors.vatTaxCode = 'Mã số thuế phải gồm 10 hoặc 13 chữ số';
      }
      if (!vatCompanyAddr.trim()) newErrors.vatCompanyAddr = 'Vui lòng nhập địa chỉ đăng ký thuế';
      if (!vatEmail.trim()) {
        newErrors.vatEmail = 'Vui lòng nhập email nhận hóa đơn';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vatEmail.trim())) {
        newErrors.vatEmail = 'Email nhận hóa đơn không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementsByName(firstError)[0]?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: fullName,
        customerEmail: email,
        phone: phone,
        address: address,
        district: district,
        city: city,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          potStyle: item.potStyle,
          potColor: item.potColor,
          size: item.size || 'medium',
          quantity: item.quantity,
        })),
        productVoucherCode: appliedProductVoucher ? appliedProductVoucher.code : null,
        shippingVoucherCode: appliedShippingVoucher ? appliedShippingVoucher.code : null,
        discount: totalDiscount,
        shippingCost: shippingFee,
        paymentMethod: paymentMethod,
        vatRequested: vatRequested,
        vatCompanyName: vatRequested ? vatCompanyName.trim() : null,
        vatTaxCode: vatRequested ? vatTaxCode.trim().replace(/[\s-]/g, '') : null,
        vatCompanyAddr: vatRequested ? vatCompanyAddr.trim() : null,
        vatEmail: vatRequested ? vatEmail.trim() : null,
      };

      let res;
      const headers = {
        'Content-Type': 'application/json',
      };

      if (user) {
        res = await fetchWithAuth(`${API_BASE_URL}/orders/checkout`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/orders/checkout`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.';
        throw new Error(errorMessage);
      }
      const orderData = await res.json();

      setCreatedOrder(orderData);
      showToast('Đặt hàng thành công!', 'success');
      clearCart();
      setIsSuccess(true);

      if (paymentMethod === 'COD') {
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Giỏ hàng trống
  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto border border-brand-sand">
          <ShoppingBag className="text-brand-forest" size={32} />
        </div>
        <h2 className="font-serif text-3xl text-brand-forest font-light">Giỏ hàng của bạn đang trống</h2>
        <p className="text-sm text-brand-slate max-w-md mx-auto leading-relaxed">
          Hiện chưa có sản phẩm nào trong giỏ hàng để thực hiện thanh toán. Vui lòng quay lại cửa hàng chọn mua sản phẩm.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-brand-forest hover:bg-brand-green text-brand-white text-xs font-bold uppercase tracking-widest px-8 py-4 transition-all duration-300 shadow-sm"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
      {/* Nút quay lại giỏ hàng */}
      <div className="mb-8">
        <Link to="/shop" className="inline-flex items-center text-xs font-bold text-brand-forest hover:text-brand-clay uppercase tracking-wider gap-2 transition-colors">
          <ArrowLeft size={14} /> Quay lại cửa hàng
        </Link>
      </div>

      <h1 className="font-serif text-4xl text-brand-forest font-light mb-10 text-left border-b border-brand-sand pb-4">
        Thanh Toán
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        {/* CỘT TRÁI (60%): Form nhập liệu */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* KHỐI 1: Thông tin liên lạc */}
          <div className="bg-brand-cream border border-brand-sand p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-xl font-light text-brand-forest border-b border-brand-sand pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-forest text-brand-white flex items-center justify-center text-xs font-serif font-bold">1</span>
              Thông Tin Liên Lạc
            </h2>
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                Địa chỉ Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={`w-full bg-brand-white border px-4 py-3 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand ${
                  errors.email ? 'border-red-500' : 'border-brand-sand'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] mt-1.5 font-bold tracking-wide flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* KHỐI 2: Địa chỉ giao hàng */}
          <div className="bg-brand-cream border border-brand-sand p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl font-light text-brand-forest border-b border-brand-sand pb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-forest text-brand-white flex items-center justify-center text-xs font-serif font-bold">2</span>
              Địa Chỉ Nhận Hàng
            </h2>

            {savedAddresses.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-brand-white border border-brand-sand p-4">
                  <label htmlFor="savedAddressSelect" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                    Chọn Địa Chỉ Giao Hàng *
                  </label>
                  <select
                    id="savedAddressSelect"
                    value={selectedAddressId || ''}
                    onChange={(e) => {
                      setSelectedAddressId(e.target.value);
                    }}
                    className="w-full bg-brand-cream border border-brand-sand/80 text-brand-charcoal text-xs py-2.5 px-3 focus:outline-none focus:border-brand-forest focus:ring-1 focus:ring-brand-forest rounded-none font-medium"
                  >
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name} ({addr.receiver} - {addr.phone}) {addr.isDefault ? '[Mặc định]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hiển thị thông tin địa chỉ tĩnh dạng nhãn vận chuyển cao cấp */}
                {selectedAddressId && (
                  <div className="bg-brand-white border border-brand-sand p-5 space-y-4 relative overflow-hidden text-left shadow-xs">
                    <div className="absolute top-0 right-0 bg-brand-forest text-brand-cream text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1.5 rounded-bl-xs">
                      Thông tin vận chuyển
                    </div>
                    
                    <div className="space-y-2 text-xs text-brand-charcoal">
                      <div className="flex items-center gap-2 border-b border-brand-sand/35 pb-2">
                        <span className="font-serif text-sm font-semibold text-brand-forest">
                          📍 {savedAddresses.find(a => String(a.id) === String(selectedAddressId))?.name || 'Nhà riêng'}
                        </span>
                        {savedAddresses.find(a => String(a.id) === String(selectedAddressId))?.isDefault && (
                          <span className="bg-brand-forest/10 text-brand-forest border border-brand-forest/20 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                            Mặc định
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-4 pt-1 gap-y-2">
                        <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">Người nhận</span>
                        <span className="col-span-3 font-semibold text-brand-forest">{fullName || 'Chưa cập nhật'}</span>
                        
                        <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">Điện thoại</span>
                        <span className="col-span-3 font-semibold font-sans">{phone || 'Chưa cập nhật'}</span>
                        
                        <span className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">Địa chỉ giao</span>
                        <span className="col-span-3 leading-relaxed font-medium">
                          {address ? `${address}, ` : ''}
                          {district ? `${district}, ` : ''}
                          {city || 'Chưa cập nhật'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-brand-sand/30 flex justify-between items-center text-[10px]">
                      <span className="text-brand-slate italic font-medium">
                        * Cần thay đổi địa chỉ? Vui lòng cấu hình trong phần cài đặt.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsActiveTab('addresses');
                          setIsSettingsModalOpen(true);
                        }}
                        className="text-brand-forest hover:text-brand-clay font-bold uppercase tracking-wider underline cursor-pointer"
                      >
                        ⚙️ Chỉnh sửa địa chỉ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Giao diện khi chưa có địa chỉ nào */
              <div className="bg-brand-white border border-brand-sand p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-[#1F3E35]/5 rounded-full flex items-center justify-center mx-auto text-brand-forest">
                  <AlertCircle size={22} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-brand-forest uppercase tracking-wider">
                    Chưa có địa chỉ giao hàng
                  </p>
                  <p className="text-[11px] text-brand-slate leading-relaxed max-w-sm mx-auto">
                    Hệ thống không tìm thấy thông tin địa chỉ giao hàng nào của bạn. Vui lòng thêm ít nhất một địa chỉ trong Cài đặt của bạn để tiếp tục đặt hàng.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsActiveTab('addresses');
                    setIsSettingsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 bg-brand-forest hover:bg-brand-green text-brand-white text-[10px] font-bold uppercase tracking-widest px-5 py-3 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  ⚙️ Thêm địa chỉ giao hàng trong Cài đặt
                </button>
              </div>
            )}
          </div>

          {/* YÊU CẦU XUẤT HÓA ĐƠN VAT */}
          <div className="bg-brand-cream border border-brand-sand p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="vatRequested"
                checked={vatRequested}
                onChange={(e) => setVatRequested(e.target.checked)}
                className="w-4 h-4 text-brand-forest focus:ring-brand-forest accent-brand-forest cursor-pointer"
              />
              <label htmlFor="vatRequested" className="text-xs font-bold uppercase tracking-wider text-brand-forest cursor-pointer select-none">
                🌱 Yêu cầu xuất hóa đơn điện tử (VAT)
              </label>
            </div>
            
            {/* Hiệu ứng trượt mở nhẹ nhàng bằng CSS transition */}
            <div className={`overflow-hidden transition-all duration-300 ${vatRequested ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <div className="border-t border-brand-sand/40 pt-4 space-y-4 text-left">
                <p className="text-[10px] text-brand-slate italic font-medium leading-relaxed mb-2">
                  (Hóa đơn điện tử VAT sẽ được tự động gửi qua Email của bạn sau khi đơn hàng được đối soát thanh toán thành công).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vatCompanyName" className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1.5">
                      Tên Công ty / Đơn vị *
                    </label>
                    <input
                      id="vatCompanyName"
                      name="vatCompanyName"
                      type="text"
                      value={vatCompanyName}
                      onChange={(e) => setVatCompanyName(e.target.value)}
                      placeholder="Công ty TNHH Nghệ Nhân Cây Cảnh..."
                      disabled={!vatRequested}
                      className={`w-full bg-brand-white border px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors placeholder-brand-sand/40 ${
                        errors.vatCompanyName ? 'border-red-500' : 'border-brand-sand'
                      }`}
                    />
                    {errors.vatCompanyName && (
                      <p className="text-red-500 text-[9px] mt-1 font-bold tracking-wide flex items-center gap-1">
                        <AlertCircle size={9} /> {errors.vatCompanyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vatTaxCode" className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1.5">
                      Mã số thuế *
                    </label>
                    <input
                      id="vatTaxCode"
                      name="vatTaxCode"
                      type="text"
                      value={vatTaxCode}
                      onChange={(e) => setVatTaxCode(e.target.value)}
                      placeholder="0102030405"
                      disabled={!vatRequested}
                      className={`w-full bg-brand-white border px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors placeholder-brand-sand/40 ${
                        errors.vatTaxCode ? 'border-red-500' : 'border-brand-sand'
                      }`}
                    />
                    {errors.vatTaxCode && (
                      <p className="text-red-500 text-[9px] mt-1 font-bold tracking-wide flex items-center gap-1">
                        <AlertCircle size={9} /> {errors.vatTaxCode}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="vatCompanyAddr" className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1.5">
                    Địa chỉ đăng ký thuế *
                  </label>
                  <input
                    id="vatCompanyAddr"
                    name="vatCompanyAddr"
                    type="text"
                    value={vatCompanyAddr}
                    onChange={(e) => setVatCompanyAddr(e.target.value)}
                    placeholder="Số 123, đường Láng, quận Đống Đa, Hà Nội..."
                    disabled={!vatRequested}
                    className={`w-full bg-brand-white border px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors placeholder-brand-sand/40 ${
                      errors.vatCompanyAddr ? 'border-red-500' : 'border-brand-sand'
                    }`}
                  />
                  {errors.vatCompanyAddr && (
                    <p className="text-red-500 text-[9px] mt-1 font-bold tracking-wide flex items-center gap-1">
                      <AlertCircle size={9} /> {errors.vatCompanyAddr}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="vatEmail" className="block text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1.5">
                    Email nhận hóa đơn *
                  </label>
                  <input
                    id="vatEmail"
                    name="vatEmail"
                    type="email"
                    value={vatEmail}
                    onChange={(e) => setVatEmail(e.target.value)}
                    placeholder="invoice@company.com"
                    disabled={!vatRequested}
                    className={`w-full bg-brand-white border px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors placeholder-brand-sand/40 ${
                      errors.vatEmail ? 'border-red-500' : 'border-brand-sand'
                    }`}
                  />
                  {errors.vatEmail && (
                    <p className="text-red-500 text-[9px] mt-1 font-bold tracking-wide flex items-center gap-1">
                      <AlertCircle size={9} /> {errors.vatEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KHỐI 3: Phương thức thanh toán */}
          <div className="bg-brand-cream border border-brand-sand p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl font-light text-brand-forest border-b border-brand-sand pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-forest text-brand-white flex items-center justify-center text-xs font-serif font-bold">3</span>
                Phương Thức Thanh Toán
              </div>
              <div className="flex gap-1.5 text-brand-slate">
                <CheckCircle2 size={18} className="text-brand-forest" />
              </div>
            </h2>

            <div className="bg-brand-white border border-brand-sand p-6 space-y-4">
              {/* Lựa chọn 1: COD */}
              <div 
                className={`flex items-start gap-3 p-4 border transition-all cursor-pointer ${
                  paymentMethod === 'COD' 
                    ? 'border-brand-forest bg-[#1F3E35]/5' 
                    : 'border-brand-sand bg-brand-white'
                }`}
                onClick={() => setPaymentMethod('COD')}
              >
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-brand-forest focus:ring-brand-forest"
                />
                <div className="cursor-pointer">
                  <label htmlFor="cod" className="block text-xs font-bold uppercase tracking-wider text-brand-forest cursor-pointer">
                    Thanh toán khi giao hàng (COD)
                  </label>
                  <p className="text-[11px] text-brand-slate mt-1.5 leading-relaxed">
                    Bạn sẽ thanh toán tiền mặt trực tiếp cho nhân viên giao hàng sau khi nhận và kiểm tra sản phẩm.
                    Nhân viên Admin sẽ liên hệ qua Số điện thoại bạn đã cung cấp để xác nhận đơn hàng trước khi chuyển đi.
                  </p>
                </div>
              </div>

              {/* Lựa chọn 2: VIETQR */}
              <div 
                className={`flex items-start gap-3 p-4 border transition-all cursor-pointer ${
                  paymentMethod === 'VIETQR' 
                    ? 'border-brand-forest bg-[#1F3E35]/5' 
                    : 'border-brand-sand bg-brand-white'
                }`}
                onClick={() => setPaymentMethod('VIETQR')}
              >
                <input
                  type="radio"
                  id="vietqr"
                  name="paymentMethod"
                  checked={paymentMethod === 'VIETQR'}
                  onChange={() => setPaymentMethod('VIETQR')}
                  className="mt-1 text-brand-forest focus:ring-brand-forest"
                />
                <div className="cursor-pointer flex-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="vietqr" className="block text-xs font-bold uppercase tracking-wider text-brand-forest cursor-pointer">
                      Chuyển khoản qua Mã VietQR (MB Bank)
                    </label>
                    <span className="bg-[#003B75] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-xs tracking-wider uppercase font-sans">
                      MB Bank
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-slate mt-1.5 leading-relaxed">
                    Hệ thống sẽ tạo **mã VietQR tự động điền sẵn số tiền & nội dung chuyển khoản**.
                    Bạn chỉ cần dùng app ngân hàng quét mã và bấm xác nhận cực kỳ tiện lợi và an toàn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (40% - Sticky): Order Summary */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 bg-brand-cream border border-brand-sand p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl font-light text-brand-forest border-b border-brand-sand pb-3">
            Tóm Tắt Đơn Hàng
          </h2>

          {/* Danh sách items */}
          <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start border-b border-brand-sand/40 pb-4">
                <div className="w-16 h-16 border border-brand-sand bg-brand-white overflow-hidden flex-shrink-0">
                  <img
                    src={optimizeUnsplashImage(item.product.colorImages?.[item.potColor] || item.product.image, 100)}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow space-y-1">
                  <h4 className="font-serif text-xs font-semibold text-brand-forest line-clamp-1">{item.product.name}</h4>
                  <p className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">
                    {item.size && `${
                      item.size === 'small' ? 'Bé nhỏ' :
                      item.size === 'medium' ? 'Trung bình' :
                      item.size === 'large' ? 'Lớn' : 'Cỡ cực lớn'
                    } • `}
                    {translatePotStyleShort(item.potStyle)} • {translatePotColor(item.potColor)}
                  </p>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-brand-slate">Số lượng: {item.quantity}</span>
                    <span className="font-bold text-brand-charcoal">{formatVND(item.product.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mã giảm giá (Promo Code) */}
          <div className="border-b border-brand-sand pb-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-forest">Mã giảm giá</span>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(true)}
                className="text-[10px] text-brand-forest hover:text-brand-clay font-bold uppercase tracking-wider underline cursor-pointer"
              >
                🎟️ Chọn mã giảm giá
              </button>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Nhập mã (ví dụ: CAYCANH10, FREESHIP...)"
                disabled={isSubmitting}
                className="flex-grow bg-brand-white border border-brand-sand px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50"
              />
              <button
                type="button"
                onClick={() => handleApplyPromo()}
                disabled={isSubmitting || !promoInput.trim()}
                className="bg-brand-forest hover:bg-brand-green text-brand-white font-bold px-4 py-2.5 text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Áp dụng
              </button>
            </div>

            {(appliedProductVoucher || appliedShippingVoucher) && (
              <div className="space-y-2 pt-1">
                {appliedProductVoucher && (
                  <div className="flex justify-between items-center bg-[#1F3E35]/5 border border-[#1F3E35]/15 p-2 text-xs">
                    <span className="text-[10px] text-brand-forest font-bold uppercase tracking-wider flex items-center gap-1.5">
                      🏷️ Sản phẩm: <span className="text-brand-clay">{appliedProductVoucher.code}</span>
                      <span className="text-[9px] text-brand-slate normal-case font-normal">
                        (-{appliedProductVoucher.discountType === 'fixed' 
                          ? formatVND(appliedProductVoucher.discountValue) 
                          : `${appliedProductVoucher.discountValue}%`})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveProductVoucher}
                      className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                    >
                      Gỡ
                    </button>
                  </div>
                )}
                {appliedShippingVoucher && (
                  <div className="flex justify-between items-center bg-[#1F3E35]/5 border border-[#1F3E35]/15 p-2 text-xs">
                    <span className="text-[10px] text-brand-forest font-bold uppercase tracking-wider flex items-center gap-1.5">
                      🚚 Vận chuyển: <span className="text-brand-clay">{appliedShippingVoucher.code}</span>
                      <span className="text-[9px] text-brand-slate normal-case font-normal">
                        (-{appliedShippingVoucher.discountType === 'fixed' 
                          ? formatVND(appliedShippingVoucher.discountValue) 
                          : `${appliedShippingVoucher.discountValue}%`})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveShippingVoucher}
                      className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                    >
                      Gỡ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chi phí tạm tính, giảm giá, ship, tổng cộng */}
          <div className="space-y-3 text-xs border-b border-brand-sand pb-4">
            <div className="flex justify-between text-brand-slate">
              <span>Tạm tính</span>
              <span className="font-bold">{formatVND(cartTotal)}</span>
            </div>
            {productDiscount > 0 && (
              <div className="flex justify-between text-brand-clay font-bold">
                <span>Giảm giá sản phẩm ({appliedProductVoucher?.code})</span>
                <span>-{formatVND(productDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-slate items-center">
              <span className="flex items-center gap-1.5">
                Phí vận chuyển
                {shippingFee === 0 && (
                  <span className="text-[8px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 bg-brand-forest text-brand-cream">Miễn phí</span>
                )}
              </span>
              <span className="font-bold">
                {shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}
              </span>
            </div>
            {shippingDiscount > 0 && (
              <div className="flex justify-between text-brand-clay font-bold">
                <span>Giảm phí vận chuyển ({appliedShippingVoucher?.code})</span>
                <span>-{formatVND(shippingDiscount)}</span>
              </div>
            )}
            {shippingFee > 0 && !appliedShippingVoucher && (
              <p className="text-[9px] text-brand-slate italic font-medium">
                (Miễn phí vận chuyển cho đơn hàng từ 150.000 đ trở lên hoặc dùng mã FREESHIP)
              </p>
            )}
          </div>

          <div className="flex justify-between items-center text-brand-forest">
            <span className="text-sm font-bold uppercase tracking-wider">Tổng cộng</span>
            <span className="text-2xl font-serif text-red-600 font-bold font-sans">{formatVND(grandTotal)}</span>
          </div>

          {/* Nút đặt hàng */}
          <button
            type="submit"
            disabled={isSubmitting || savedAddresses.length === 0 || !selectedAddressId}
            className={`w-full bg-brand-forest hover:bg-brand-green text-brand-white font-bold py-4 text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitting || savedAddresses.length === 0 || !selectedAddressId
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isSubmitting ? (
              <>Đang xử lý đơn hàng...</>
            ) : (
              <>ĐẶT HÀNG • {formatVND(grandTotal)}</>
            )}
          </button>

          <div className="text-[10px] text-brand-slate font-medium text-center flex items-center justify-center gap-1.5">
            <Lock size={12} className="text-brand-forest" />
            Kết nối bảo mật mã hóa SSL 256-bit
          </div>
        </div>
      </form>
      
      {/* MODAL CHỌN MÃ GIẢM GIÁ KHẢ DỤNG */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-[#0d231a]/60 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-cream border border-brand-sand p-6 sm:p-8 max-w-lg w-full text-center space-y-6 shadow-2xl animate-scale-up modal-panel my-8 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-brand-sand pb-4">
              <h3 className="font-serif text-lg text-brand-forest font-light flex items-center gap-2">
                🎟️ Mã giảm giá khả dụng
              </h3>
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="text-brand-slate hover:text-brand-forest font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1">
              {loadingVouchers ? (
                <div className="py-8 text-xs text-brand-slate">Đang tải danh sách mã giảm giá...</div>
              ) : myVouchers.length === 0 ? (
                <div className="py-8 text-xs text-brand-slate">Không có mã giảm giá nào khả dụng cho bạn lúc này.</div>
              ) : (
                myVouchers.map((voucher) => {
                  const isApplied = 
                    (voucher.type === 'product' && appliedProductVoucher?.code === voucher.code) ||
                    (voucher.type === 'shipping' && appliedShippingVoucher?.code === voucher.code);
                  
                  const isMinOrderSatisfied = cartTotal >= voucher.minOrderValue;

                  return (
                    <div 
                      key={voucher.id}
                      className={`border p-4 text-left relative flex flex-col justify-between gap-3 bg-brand-white transition-all ${
                        isApplied 
                          ? 'border-brand-forest bg-[#1F3E35]/5' 
                          : !isMinOrderSatisfied 
                            ? 'border-brand-sand opacity-60' 
                            : 'border-brand-sand hover:border-brand-forest/65'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="inline-block bg-brand-cream border border-brand-sand px-2 py-1 text-xs font-bold text-brand-forest tracking-wider font-sans">
                            {voucher.code}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-brand-clay">
                            {voucher.type === 'product' ? '📦 Giảm sản phẩm' : '🚚 Ưu đãi ship'}
                          </span>
                        </div>
                        
                        <p className="text-xs font-bold text-brand-charcoal pt-1">
                          Giảm {voucher.discountType === 'fixed' 
                            ? formatVND(voucher.discountValue) 
                            : `${voucher.discountValue}%`}
                          {voucher.maxDiscount && ` (Tối đa ${formatVND(voucher.maxDiscount)})`}
                        </p>

                        {voucher.minOrderValue > 0 && (
                          <p className="text-[10px] text-brand-slate">
                            Đơn hàng tối thiểu: <span className="font-semibold">{formatVND(voucher.minOrderValue)}</span>
                          </p>
                        )}
                        
                        {voucher.categoryLimit && (
                          <p className="text-[10px] text-brand-slate">
                            Áp dụng cho danh mục: <span className="font-semibold text-brand-forest">{voucher.categoryLimit === 'plants' ? 'Cây cảnh' : voucher.categoryLimit}</span>
                          </p>
                        )}

                        {voucher.endDate && (
                          <p className="text-[9px] text-brand-slate/80 italic pt-1">
                            Hạn dùng: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-brand-sand/30">
                        {!isMinOrderSatisfied ? (
                          <span className="text-[9px] text-red-500 font-medium">
                            Chưa đủ giá trị đơn tối thiểu (Cần thêm {formatVND(voucher.minOrderValue - cartTotal)})
                          </span>
                        ) : (
                          <span className="text-[9px] text-brand-forest font-medium">
                            Đủ điều kiện áp dụng
                          </span>
                        )}
                        
                        <button
                          type="button"
                          disabled={!isMinOrderSatisfied}
                          onClick={() => {
                            if (isApplied) {
                              if (voucher.type === 'product') handleRemoveProductVoucher();
                              else handleRemoveShippingVoucher();
                            } else {
                              handleApplyPromo(voucher.code);
                            }
                          }}
                          className={`font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                            isApplied 
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : !isMinOrderSatisfied 
                                ? 'bg-brand-sand text-brand-slate cursor-not-allowed opacity-50'
                                : 'bg-brand-forest hover:bg-brand-green text-brand-white'
                          }`}
                        >
                          {isApplied ? 'Hủy áp dụng' : 'Áp dụng'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="border-t border-brand-sand pt-4 text-center">
              <button
                type="button"
                onClick={() => setIsVoucherModalOpen(false)}
                className="bg-brand-sand hover:bg-[#d0c9bd] text-brand-forest font-bold px-6 py-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY chúc mừng đặt hàng thành công */}
      {isSuccess && (
        <div className="fixed inset-0 bg-[#0d231a]/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-brand-cream border border-brand-sand p-6 sm:p-10 max-w-lg w-full text-center space-y-6 shadow-2xl animate-scale-up modal-panel my-8">
            <div className="w-16 h-16 bg-brand-white border border-brand-sand rounded-full flex items-center justify-center mx-auto text-brand-forest animate-pulse-slow">
              <CheckCircle2 size={36} className="text-brand-forest" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">Đặt hàng thành công!</span>
              <h2 className="font-serif text-2xl sm:text-3xl text-brand-forest font-light">Cảm ơn bạn đã mua hàng</h2>
              <p className="text-xs text-brand-slate max-w-sm mx-auto leading-relaxed">
                Đơn hàng của bạn đã được nhận và đang chuẩn bị xử lý.
              </p>
            </div>

            {createdOrder && paymentMethod === 'VIETQR' ? (
              /* GIAO DIỆN THANH TOÁN VIETQR */
              <div className="bg-white border border-brand-sand/50 p-4 sm:p-6 text-left space-y-5 rounded-2xl shadow-xs">
                <div className="text-center pb-2 border-b border-brand-sand/20">
                  <span className="inline-block bg-[#003B75] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-sm tracking-wider uppercase font-sans mb-1.5">
                    Quét Mã VietQR MB Bank
                  </span>
                  <p className="text-[10px] text-brand-slate font-medium">Bạn hãy mở ứng dụng ngân hàng quét mã QR dưới đây để thanh toán tự động</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center py-2">
                  {/* Cột trái: QR Code */}
                  <div className="bg-white p-3 border border-brand-sand/40 rounded-xl shadow-xs flex-shrink-0 flex items-center justify-center">
                    <img
                      src={`https://img.vietqr.io/image/MB-0966337492-compact2.png?amount=${Math.round(createdOrder.totalAmount)}&addInfo=TS-${createdOrder.id.substring(0, 8).toUpperCase()}&accountName=CAY%20CANH%20NAM%20DIEN`}
                      alt="VietQR MB Bank"
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                    />
                  </div>

                  {/* Cột phải: Thông tin dạng chữ */}
                  <div className="flex-1 space-y-3.5 text-xs text-brand-charcoal w-full">
                    <div className="grid grid-cols-3 border-b border-brand-sand/20 pb-2">
                      <span className="text-brand-slate text-[10px] uppercase font-bold tracking-wider">Ngân hàng</span>
                      <span className="col-span-2 font-bold font-sans">MB Bank (Quân Đội)</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-brand-sand/20 pb-2">
                      <span className="text-brand-slate text-[10px] uppercase font-bold tracking-wider">Số tài khoản</span>
                      <span className="col-span-2 font-bold text-brand-forest text-sm font-sans flex items-center gap-1.5">
                        0966337492
                        <button 
                          type="button" 
                          onClick={() => {
                            navigator.clipboard.writeText('0966337492');
                            showToast('Đã sao chép số tài khoản!', 'success');
                          }}
                          className="text-[8px] bg-brand-sand/30 hover:bg-brand-sand text-brand-forest px-1.5 py-0.5 font-bold uppercase tracking-widest transition-colors active:scale-95"
                        >
                          Sao chép
                        </button>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-brand-sand/20 pb-2">
                      <span className="text-brand-slate text-[10px] uppercase font-bold tracking-wider">Chủ tài khoản</span>
                      <span className="col-span-2 font-bold uppercase">CAY CANH NAM DIEN</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-brand-sand/20 pb-2">
                      <span className="text-brand-slate text-[10px] uppercase font-bold tracking-wider">Số tiền</span>
                      <span className="col-span-2 font-bold text-red-600 text-sm font-sans">
                        {formatVND(createdOrder.totalAmount)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 pb-1">
                      <span className="text-brand-slate text-[10px] uppercase font-bold tracking-wider">Nội dung CK</span>
                      <span className="col-span-2 font-bold text-brand-clay font-sans flex items-center gap-1.5">
                        TS-{createdOrder.id.substring(0, 8).toUpperCase()}
                        <button 
                          type="button" 
                          onClick={() => {
                            navigator.clipboard.writeText(`TS-${createdOrder.id.substring(0, 8).toUpperCase()}`);
                            showToast('Đã sao chép nội dung chuyển khoản!', 'success');
                          }}
                          className="text-[8px] bg-brand-sand/30 hover:bg-brand-sand text-brand-forest px-1.5 py-0.5 font-bold uppercase tracking-widest transition-colors active:scale-95"
                        >
                          Sao chép
                        </button>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-brand-slate leading-relaxed bg-[#f9f8f7] p-3 border border-brand-sand/20 text-center font-medium">
                  ⚠️ **Lưu ý**: Hãy giữ nguyên nội dung chuyển khoản `TS-{createdOrder.id.substring(0, 8).toUpperCase()}` để hệ thống Admin đối soát tiền về tự động nhanh nhất cho bạn.
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 border border-brand-forest hover:bg-brand-beige text-brand-forest font-bold py-3 text-[10px] uppercase tracking-widest transition-all cursor-pointer text-center"
                  >
                    Về Trang Chủ
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch(`${API_BASE_URL}/orders/${createdOrder.id}/confirm-payment`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                        });
                      } catch (err) {
                        console.error('Lỗi khi cập nhật trạng thái xác thực thanh toán:', err);
                      }
                      showToast('Cảm ơn bạn! Đơn hàng sẽ được kiểm tra và xử lý.', 'success');
                      navigate('/orders');
                    }}
                    className="flex-1 bg-brand-forest hover:bg-brand-green text-brand-white font-bold py-3 text-[10px] uppercase tracking-widest transition-all cursor-pointer text-center shadow-xs"
                  >
                    Tôi Đã Chuyển Khoản Thành Công
                  </button>
                </div>
              </div>
            ) : (
              /* GIAO DIỆN COD */
              <div className="bg-[#1F3E35]/5 border border-brand-sand/50 p-6 text-center space-y-4 rounded-xl">
                <span className="text-2xl">📦</span>
                <h4 className="font-serif text-sm font-semibold text-brand-forest">Thanh toán khi nhận hàng (COD)</h4>
                <p className="text-[11px] text-brand-slate leading-relaxed max-w-xs mx-auto">
                  Bạn sẽ thanh toán tiền mặt trực tiếp cho người giao hàng sau khi kiểm tra đầy đủ sản phẩm.
                  Nhân viên chăm sóc của Cây cảnh Nam Điền sẽ sớm gọi điện thoại để xác nhận đơn hàng với bạn.
                </p>
                <div className="pt-2 text-[10px] text-brand-slate font-medium animate-pulse">
                  Đang chuyển hướng về trang chủ sau 3 giây...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
