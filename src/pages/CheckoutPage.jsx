import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';
import { CreditCard, Lock, CheckCircle2, ArrowLeft, ShoppingBag, AlertCircle } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

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
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');

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
      showToast('Đã áp dụng mã giảm giá $10.00!', 'success');
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

    // 3. Payment Card validation (mockup)
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'Vui lòng nhập số thẻ thanh toán';
    } else if (!/^\d{16}$/.test(cleanCard)) {
      newErrors.cardNumber = 'Số thẻ thanh toán phải chứa 16 chữ số';
    }

    if (!expDate) {
      newErrors.expDate = 'Vui lòng nhập hạn dùng (MM/YY)';
    } else if (!/^\d{2}\/\d{2}$/.test(expDate)) {
      newErrors.expDate = 'Hạn dùng phải đúng định dạng MM/YY';
    }

    if (!cvv) {
      newErrors.cvv = 'Vui lòng nhập mã CVV';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'Mã CVV phải chứa 3-4 chữ số';
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
        items: cartItems.map((item) => ({
          productId: item.product.id,
          potStyle: item.potStyle,
          potColor: item.potColor,
          quantity: item.quantity,
        })),
        discount: discount,
        shippingCost: shippingFee,
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

      showToast('Đặt hàng thành công!', 'success');
      clearCart();
      setIsSuccess(true);

      // Sau 2 giây điều hướng về trang chủ
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format số thẻ tự động thêm khoảng trắng mỗi 4 số
  const handleCardNumberChange = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    const matches = clean.match(/\d{1,4}/g);
    setCardNumber(matches ? matches.join(' ') : clean);
  };

  // Format hạn dùng thẻ tự động thêm dấu /
  const handleExpDateChange = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setExpDate(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setExpDate(clean);
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

          {/* KHỐI 3: Phương thức thanh toán */}
          <div className="bg-brand-cream border border-brand-sand p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-xl font-light text-brand-forest border-b border-brand-sand pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-forest text-brand-white flex items-center justify-center text-xs font-serif font-bold">3</span>
                Thanh Toán Bằng Thẻ Tín Dụng
              </div>
              <div className="flex gap-1.5 text-brand-slate">
                <CreditCard size={18} />
                <Lock size={15} className="mt-0.5" />
              </div>
            </h2>

            <div className="bg-brand-white border border-brand-sand p-4 text-[10px] text-brand-slate font-medium leading-relaxed italic mb-2">
              Lưu ý: Đây là cổng thanh toán mô phỏng thử nghiệm. Hãy nhập 16 chữ số bất kỳ làm số thẻ để hoàn tất.
            </div>

            <div>
              <label htmlFor="cardNumber" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                Số Thẻ (16 chữ số)
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                maxLength="19" // bao gồm khoảng trắng
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="4000 1234 5678 9010"
                className={`w-full bg-brand-white border px-4 py-3 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50 ${
                  errors.cardNumber ? 'border-red-500' : 'border-brand-sand'
                }`}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-[10px] mt-1.5 font-bold tracking-wide flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.cardNumber}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expDate" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                  Ngày Hết Hạn (MM/YY)
                </label>
                <input
                  id="expDate"
                  name="expDate"
                  type="text"
                  maxLength="5"
                  value={expDate}
                  onChange={(e) => handleExpDateChange(e.target.value)}
                  placeholder="12/28"
                  className={`w-full bg-brand-white border px-4 py-3 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50 ${
                    errors.expDate ? 'border-red-500' : 'border-brand-sand'
                  }`}
                />
                {errors.expDate && (
                  <p className="text-red-500 text-[10px] mt-1.5 font-bold tracking-wide flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.expDate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="cvv" className="block text-[10px] font-bold uppercase tracking-widest text-brand-forest mb-2">
                  Mã CVV (3-4 số)
                </label>
                <input
                  id="cvv"
                  name="cvv"
                  type="password"
                  maxLength="4"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="•••"
                  className={`w-full bg-brand-white border px-4 py-3 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none transition-colors rounded-none placeholder-brand-sand/50 ${
                    errors.cvv ? 'border-red-500' : 'border-brand-sand'
                  }`}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-[10px] mt-1.5 font-bold tracking-wide flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.cvv}
                  </p>
                )}
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
                    src={item.product.colorImages?.[item.potColor] || item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow space-y-1">
                  <h4 className="font-serif text-xs font-semibold text-brand-forest line-clamp-1">{item.product.name}</h4>
                  <p className="text-[10px] text-brand-slate uppercase font-bold tracking-wider">
                    {item.potStyle.split(' ')[0]} • {item.potColor}
                  </p>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-brand-slate">Số lượng: {item.quantity}</span>
                    <span className="font-bold text-brand-charcoal">${(item.product.price * item.quantity).toFixed(2)}</span>
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
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-clay font-bold">
                <span>Giảm giá ({appliedPromo})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-slate items-center">
              <span className="flex items-center gap-1.5">
                Phí vận chuyển
                {shippingFee === 0 && (
                  <span className="text-[8px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 bg-brand-forest text-brand-cream">Free</span>
                )}
              </span>
              <span className="font-bold">
                {shippingFee === 0 ? 'Miễn phí' : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="text-[9px] text-brand-slate italic font-medium">
                (Miễn phí vận chuyển cho đơn hàng từ $150 trở lên hoặc dùng mã FREESHIP)
              </p>
            )}
          </div>

          <div className="flex justify-between items-center text-brand-forest">
            <span className="text-sm font-bold uppercase tracking-wider">Tổng cộng</span>
            <span className="text-2xl font-serif font-light">${grandTotal.toFixed(2)}</span>
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
              <>ĐẶT HÀNG • ${grandTotal.toFixed(2)}</>
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
        <div className="fixed inset-0 bg-[#0d231a]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-brand-cream border border-brand-sand p-8 sm:p-12 max-w-md w-full text-center space-y-6 shadow-2xl animate-scale-up">
            <div className="w-20 h-20 bg-brand-white border border-brand-sand rounded-full flex items-center justify-center mx-auto text-brand-forest animate-pulse-slow">
              <CheckCircle2 size={48} className="text-brand-forest" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">Thành công!</span>
              <h2 className="font-serif text-3xl text-brand-forest font-light">Cảm ơn bạn đã mua hàng</h2>
              <p className="text-xs text-brand-slate leading-relaxed">
                Đơn hàng của bạn đã được nhận và đang chuẩn bị xử lý. Đang chuyển hướng về trang chủ...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
