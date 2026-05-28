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
  const { user, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const guestState = location.state || {};

  // Form states
  const [email, setEmail] = useState(user?.email || guestState.guestEmail || '');
  const [fullName, setFullName] = useState(user?.name || guestState.guestName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [createdOrder, setCreatedOrder] = useState(null);
  
  // VAT states
  const [vatRequested, setVatRequested] = useState(false);
  const [vatCompanyName, setVatCompanyName] = useState('');
  const [vatTaxCode, setVatTaxCode] = useState('');
  const [vatCompanyAddr, setVatCompanyAddr] = useState('');
  const [vatEmail, setVatEmail] = useState('');

  // Tự động điền thông tin nếu đã đăng nhập hoặc đã nhập ở giỏ hàng
  useEffect(() => {
    if (user) {
      if (!email) setEmail(user.email || '');
      if (!fullName) setFullName(user.name || '');
    } else if (guestState.guestEmail || guestState.guestName) {
      if (!email) setEmail(guestState.guestEmail || '');
      if (!fullName) setFullName(guestState.guestName || '');
    }
  }, [user, guestState.guestEmail, guestState.guestName]);

  // Error state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  // Tính toán discount & phí vận chuyển dựa trên Coupon
  let discount = 0;
  if (appliedPromo === 'SPRING20') {
    discount = cartTotal * 0.2;
  } else if (appliedPromo === 'THESILLNEW') {
    discount = Math.min(10, cartTotal);
  }

  let shippingFee = cartTotal > 150 ? 0 : 8;
  if (appliedPromo === 'FREESHIP') {
    shippingFee = 0;
  }

  const grandTotal = Math.max(0, cartTotal - discount + shippingFee);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'SPRING20') {
      setAppliedPromo('SPRING20');
      showToast('Đã áp dụng mã giảm giá 20%!', 'success');
    } else if (code === 'THESILLNEW') {
      setAppliedPromo('THESILLNEW');
      showToast('Đã áp dụng mã giảm giá 10.000 đ!', 'success');
    } else if (code === 'FREESHIP') {
      setAppliedPromo('FREESHIP');
      showToast('Đã áp dụng mã miễn phí vận chuyển!', 'success');
    } else {
      showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn!', 'error');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setPromoInput('');
    showToast('Đã gỡ bỏ mã giảm giá.', 'info');
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
    if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10,11}$/.test(phone.trim().replace(/[\s.-]/g, ''))) {
      newErrors.phone = 'Số điện thoại phải chứa từ 10-11 chữ số';
    }
    if (!address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    if (!city.trim()) newErrors.city = 'Vui lòng chọn hoặc nhập Tỉnh/Thành phố';
    if (!district.trim()) newErrors.district = 'Vui lòng nhập Quận/Huyện/Xã';

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
      // Cuộn lên đầu trang hoặc tìm trường lỗi đầu tiên
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
          quantity: item.quantity,
        })),
        discount: discount,
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

      // Nếu là COD, tự động chuyển hướng về trang chủ sau 3 giây
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                  Họ và Tên
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={`w-full bg-brand-white border px-4 py-3 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50 ${
                    errors.fullName ? 'border-red-500' : 'border-brand-sand'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-[10px] mt-1.5 font-bold tracking-wide flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                  Số Điện Thoại
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className={`w-full bg-brand-white border px-4 py-3 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50 ${
                    errors.phone ? 'border-red-500' : 'border-brand-sand'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-[10px] mt-1.5 font-bold tracking-wide flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                Địa chỉ chi tiết (Số nhà, tên đường)
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Đường ABC"
                className={`w-full bg-brand-white border px-4 py-3 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50 ${
                  errors.address ? 'border-red-500' : 'border-brand-sand'
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-[10px] mt-1.5 font-bold tracking-wide flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="district" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                  Quận / Huyện / Xã
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Quận 1"
                  className={`w-full bg-brand-white border px-4 py-3 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50 ${
                    errors.district ? 'border-red-500' : 'border-brand-sand'
                  }`}
                />
                {errors.district && (
                  <p className="text-red-500 text-[10px] mt-1.5 font-bold tracking-wide flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.district}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                  Tỉnh / Thành phố
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="TP. Hồ Chí Minh"
                  className={`w-full bg-brand-white border px-4 py-3 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50 ${
                    errors.city ? 'border-red-500' : 'border-brand-sand'
                  }`}
                />
                {errors.city && (
                  <p className="text-red-500 text-[10px] mt-1.5 font-bold tracking-wide flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.city}
                  </p>
                )}
              </div>
            </div>
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
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Mã giảm giá (SPRING20, THESILLNEW...)"
                disabled={isSubmitting}
                className="flex-grow bg-brand-white border border-brand-sand px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={isSubmitting || !promoInput.trim()}
                className="bg-brand-forest hover:bg-brand-green text-brand-white font-bold px-4 py-2.5 text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
            {appliedPromo && (
              <div className="flex justify-between items-center mt-2 bg-brand-white border border-brand-sand p-2 text-xs">
                <span className="text-[10px] text-brand-forest font-bold uppercase tracking-wider">
                  Đã áp dụng: <span className="text-brand-clay">{appliedPromo}</span>
                </span>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                >
                  Gỡ bỏ
                </button>
              </div>
            )}
          </div>

          {/* Chi phí tạm tính, giảm giá, ship, tổng cộng */}
          <div className="space-y-3 text-xs border-b border-brand-sand pb-4">
            <div className="flex justify-between text-brand-slate">
              <span>Tạm tính</span>
              <span className="font-bold">{formatVND(cartTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-clay font-bold">
                <span>Giảm giá ({appliedPromo})</span>
                <span>-{formatVND(discount)}</span>
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
            {shippingFee > 0 && (
              <p className="text-[9px] text-brand-slate italic font-medium">
                (Miễn phí vận chuyển cho đơn hàng từ 150.000 đ trở lên hoặc dùng mã FREESHIP)
              </p>
            )}
          </div>

          <div className="flex justify-between items-center text-brand-forest">
            <span className="text-sm font-bold uppercase tracking-wider">Tổng cộng</span>
            <span className="text-2xl font-serif font-light text-red-600 font-bold font-sans">{formatVND(grandTotal)}</span>
          </div>

          {/* Nút đặt hàng */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-brand-forest hover:bg-brand-green text-brand-white font-bold py-4 text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'
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
                      src={`https://img.vietqr.io/image/MB-0966337492-compact2.png?amount=${Math.round(createdOrder.totalAmount * 1000)}&addInfo=TS-${createdOrder.id.substring(0, 8).toUpperCase()}&accountName=DO%20XUAN%20HUNG`}
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
                      <span className="col-span-2 font-bold uppercase">DO XUAN HUNG</span>
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
                  Nhân viên chăm sóc của Nghệ Nhân Đỗ Xuân Hùng sẽ sớm gọi điện thoại để xác nhận đơn hàng với bạn.
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
