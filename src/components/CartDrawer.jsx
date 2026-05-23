import { X, Trash2, Plus, Minus, Gift, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { API_BASE_URL } from '../config';
import { optimizeUnsplashImage } from '../utils/image';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    clearCart
  } = useCart();

  const { user, setIsAuthModalOpen, fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const shippingThreshold = 150;
  const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 15;
  const progressToFreeShipping = Math.min((cartTotal / shippingThreshold) * 100, 100);
  const amountNeededForFreeShipping = Math.max(shippingThreshold - cartTotal, 0);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setDiscount(cartTotal * 0.1);
      setPromoError('');
    } else {
      setPromoError('Mã giảm giá không hợp lệ.');
      setDiscount(0);
    }
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    
    // Validate guest inputs
    let customerName = 'Khách hàng';
    let customerEmail = '';
    
    if (user) {
      customerName = user.name;
      customerEmail = user.email;
    } else {
      if (!guestEmail.trim()) {
        setCheckoutError('Vui lòng nhập Email để nhận thông tin đơn hàng.');
        return;
      }
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        setCheckoutError('Email không hợp lệ.');
        return;
      }
      customerName = guestName.trim() || 'Khách hàng';
      customerEmail = guestEmail.trim();
    }
    
    setIsCheckingOut(true);
    
    // Map items matching Backend CheckoutDto format
    const items = cartItems.map(item => ({
      productId: item.product.id,
      potStyle: item.potStyle,
      potColor: item.potColor,
      quantity: item.quantity
    }));
    
    const bodyPayload = {
      customerName,
      customerEmail,
      items,
      discount,
      shippingCost
    };
    
    try {
      let response;
      const checkoutUrl = `${API_BASE_URL}/orders/checkout`;
      
      if (user) {
        // Dùng fetchWithAuth từ useAuth
        response = await fetchWithAuth(checkoutUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });
      } else {
        // Dùng fetch thường cho guest (không có token)
        response = await fetch(checkoutUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Thanh toán thất bại. Vui lòng thử lại.');
      }
      
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
      
      // Wait for success screen
      setTimeout(() => {
        clearCart();
        setCheckoutSuccess(false);
        setIsCartOpen(false);
        setDiscount(0);
        setPromoCode('');
        setGuestEmail('');
        setGuestName('');
      }, 3500);
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message);
      setIsCheckingOut(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Background Overlay with simple opacity, avoiding heavy backdrop-filter blur for performance */}
      <div
        className={`absolute inset-0 bg-[#0D231A]/40 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => {
          if (!isCheckingOut && !checkoutSuccess) setIsCartOpen(false);
        }}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen max-w-md cart-drawer-panel transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col bg-brand-cream border-l border-brand-sand shadow-2xl">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-brand-sand flex justify-between items-center bg-brand-white">
              <span className="font-serif text-lg font-light tracking-wider lowercase">nghệ nhân đỗ xuân hùng cart</span>
              <button
                onClick={() => setIsCartOpen(false)}
                disabled={isCheckingOut || checkoutSuccess}
                className="text-brand-charcoal hover:text-brand-green p-1 transition-colors cursor-pointer disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            {/* Loading/Success Screens */}
            {isCheckingOut ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-brand-cream">
                <div className="w-10 h-10 border-2 border-brand-forest border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="font-serif text-lg text-brand-forest font-medium">Đang xử lý giao dịch...</h3>
                <p className="text-xs text-brand-slate mt-2 max-w-xs leading-relaxed font-medium">
                  Hệ thống đang kết nối cổng thanh toán bảo mật. Vui lòng không đóng trình duyệt.
                </p>
              </div>
            ) : checkoutSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-brand-cream animate-fade-in">
                <div className="p-6 border border-brand-sand bg-brand-white mb-6 relative">
                  <div className="absolute -top-2 -right-2 text-brand-clay animate-bounce">
                    <Sparkles size={16} />
                  </div>
                  <svg className="h-8 w-8 text-brand-forest animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-brand-forest font-light mb-2">Đặt hàng thành công!</h3>
                <p className="text-xs text-brand-slate mb-6 max-w-xs leading-relaxed font-medium">
                  Cảm ơn {user ? user.name : 'bạn'} đã mua sắm tại **Nghệ Nhân Cây Cảnh Đỗ Xuân Hùng**. Đơn hàng giả lập của bạn đã được ghi nhận và thông báo chi tiết đã được gửi tới {user ? user.email : 'email của bạn'}.
                </p>
                <div className="w-16 h-0.5 bg-brand-clay" />
              </div>
            ) : cartItems.length === 0 ? (
              /* Empty State */
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                <span className="text-4xl mb-4 block">🌱</span>
                <p className="font-serif text-lg text-brand-forest font-medium mb-1">Giỏ hàng của bạn đang trống</p>
                <p className="text-[11px] text-brand-slate mb-8 max-w-xs leading-relaxed font-medium">
                  Hãy lấp đầy không gian sống bằng những chậu cây xinh đẹp. Khám phá cửa hàng ngay hôm nay!
                </p>
                <button
                  onClick={() => {
                    navigate('/shop');
                    setIsCartOpen(false);
                  }}
                  className="bg-brand-forest hover:bg-brand-green text-brand-white text-[10px] font-bold uppercase tracking-widest px-8 py-4 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  DUYỆT SẢN PHẨM
                </button>
              </div>
            ) : (
              /* Cart Contents */
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                  {/* Free Shipping Progress bar */}
                  <div className="bg-brand-white border border-brand-sand p-4 shadow-xs">
                    <div className="flex items-center space-x-2 text-[9px] font-bold text-brand-forest uppercase tracking-widest mb-2.5">
                      <Gift size={12} className="text-brand-clay" />
                      {amountNeededForFreeShipping > 0 ? (
                        <span>Mua thêm <strong className="text-brand-clay font-extrabold">${amountNeededForFreeShipping}</strong> để được FREESHIP</span>
                      ) : (
                        <span className="text-[#1F3E35] font-extrabold">Đơn hàng của bạn đã được FREESHIP!</span>
                      )}
                    </div>
                    <div className="w-full bg-brand-cream h-1.5 border border-brand-sand relative overflow-hidden">
                      <div
                        className="bg-brand-forest h-full transition-all duration-700 ease-out"
                        style={{ width: `${progressToFreeShipping}%` }}
                      />
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="divide-y divide-brand-sand">
                    {cartItems.map((item, idx) => (
                      <div key={`${item.product.id}-${item.potStyle}-${item.potColor}-${idx}`} className="py-5 flex space-x-4">
                        <img
                          src={optimizeUnsplashImage(item.product.colorImages && item.product.colorImages[item.potColor] ? item.product.colorImages[item.potColor] : item.product.image, 100)}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover border border-brand-sand flex-shrink-0 bg-brand-white"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-serif text-sm font-medium text-brand-forest leading-snug">
                                {item.product.name}
                              </h4>
                              <span className="text-xs font-bold text-brand-charcoal ml-2">
                                ${item.product.price * item.quantity}
                              </span>
                            </div>
                            
                            {/* Selected Options Badges */}
                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2">
                              <span className="text-[9px] border border-brand-sand bg-brand-white text-brand-slate px-2 py-0.5 font-bold uppercase tracking-wider">
                                {item.potStyle.split(' ')[0]}
                              </span>
                              <span className="text-[9px] border border-brand-sand bg-brand-white text-brand-slate px-2 py-0.5 font-bold uppercase tracking-wider flex items-center">
                                <span
                                  className="w-1.5 h-1.5 rounded-full inline-block mr-1.5 border border-brand-charcoal/20"
                                  style={{
                                    backgroundColor:
                                      item.potColor === 'Terracotta' ? '#D77A61' :
                                      item.potColor === 'Cream' ? '#F5F2EB' :
                                      item.potColor === 'Mint' ? '#C1D5C0' :
                                      item.potColor === 'Charcoal' ? '#3E3E3E' : '#222'
                                  }}
                                />
                                {item.potColor}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3.5">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-brand-sand bg-brand-white overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.potStyle,
                                    item.potColor,
                                    item.quantity - 1
                                  )
                                }
                                className="px-2 py-1 text-brand-slate hover:text-brand-forest hover:bg-brand-beige transition-colors"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="px-2 text-[10px] font-bold text-brand-charcoal">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.potStyle,
                                    item.potColor,
                                    item.quantity + 1
                                  )
                                }
                                className="px-2 py-1 text-brand-slate hover:text-brand-forest hover:bg-brand-beige transition-colors"
                              >
                                <Plus size={10} />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                removeFromCart(item.product.id, item.potStyle, item.potColor)
                              }
                              className="text-brand-slate hover:text-brand-charcoal p-1 transition-colors cursor-pointer"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Section with Pricing and Checkout */}
                <div className="border-t border-brand-sand px-6 py-6 bg-brand-white space-y-4 shadow-sm">
                  
                  {/* Coupon input */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Mã giảm giá (WELCOME10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-brand-cream border border-brand-sand text-brand-charcoal text-xs px-3 py-2.5 focus:outline-none focus:border-brand-forest flex-1 font-semibold tracking-wider"
                    />
                    <button
                      type="submit"
                      className="bg-brand-forest text-brand-white text-[10px] font-bold px-4 py-2.5 hover:bg-brand-green transition-colors cursor-pointer uppercase tracking-widest"
                    >
                      ÁP DỤNG
                    </button>
                  </form>
                  {promoError && <p className="text-[9px] text-red-600 font-bold tracking-widest uppercase">{promoError}</p>}
                  {discount > 0 && (
                    <p className="text-[9px] text-[#1F3E35] font-extrabold tracking-widest uppercase animate-pulse">
                      Mã WELCOME10 đã giảm 10% (-${discount.toFixed(2)})
                    </p>
                  )}

                  {/* Summary Pricing */}
                  <div className="space-y-2 text-xs text-brand-slate font-medium">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span className="font-bold text-brand-charcoal">${cartTotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[#1F3E35]">
                        <span>Khuyến mãi (10%):</span>
                        <span className="font-bold">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Phí giao hàng:</span>
                      <span className="font-bold text-brand-charcoal">
                        {shippingCost === 0 ? (
                          <span className="text-[#1F3E35] font-bold uppercase tracking-wider">Freeship</span>
                        ) : (
                          `$${shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-brand-forest border-t border-brand-sand pt-3.5 mt-2.5">
                      <span className="uppercase tracking-widest text-xs">Tổng cộng:</span>
                      <span>${(cartTotal - discount + shippingCost).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Account check for checkout */}
                  {user ? (
                    <div className="bg-[#1F3E35]/5 border border-brand-sand p-3 flex items-center space-x-3 text-xs mb-2 text-left">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-brand-sand shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-forest">Thanh toán với tư cách thành viên</p>
                        <p className="text-[10px] text-[#666] truncate">{user.name} ({user.email})</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#C59680]/10 border border-[#C59680]/20 p-3 text-xs mb-2 space-y-2 text-left">
                      <p className="text-brand-charcoal font-medium">Bạn đang mua hàng với tư cách khách.</p>
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Họ và tên của bạn"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-brand-cream border border-brand-sand text-brand-charcoal text-xs px-2.5 py-2 focus:outline-none focus:border-brand-forest"
                        />
                        <input
                          type="email"
                          placeholder="Email nhận thông tin đơn hàng *"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-brand-cream border border-brand-sand text-brand-charcoal text-xs px-2.5 py-2 focus:outline-none focus:border-brand-forest"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-[9px] font-bold text-brand-clay hover:text-brand-forest uppercase tracking-widest hover:underline transition-colors block text-left cursor-pointer"
                      >
                        Đăng nhập bằng Google để mua nhanh hơn →
                      </button>
                    </div>
                  )}

                  {checkoutError && (
                    <p className="text-[10px] text-red-600 font-bold tracking-wider uppercase text-center bg-red-50 border border-red-200 py-2 px-3 animate-fade-in">
                      {checkoutError}
                    </p>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout', {
                        state: {
                          guestName,
                          guestEmail
                        }
                      });
                    }}
                    className="w-full bg-brand-forest hover:bg-brand-green text-brand-white font-bold py-4.5 text-xs uppercase tracking-widest transition-all shadow-sm cursor-pointer mt-1 text-center hover:-translate-y-0.5"
                  >
                    THANH TOÁN
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
