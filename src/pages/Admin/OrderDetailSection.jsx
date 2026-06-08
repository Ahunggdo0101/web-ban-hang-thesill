import { optimizeUnsplashImage } from '../../utils/image';
import { formatVND } from '../../utils/translation';

export default function OrderDetailSection({ order, showToast }) {
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}!`, 'success');
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Đã nhận tiền';
      case 'pending_verification': return 'Đang đối soát';
      case 'failed': return 'Lỗi thanh toán';
      default: return 'Chưa nhận tiền';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50 border border-green-200';
      case 'pending_verification': return 'text-blue-500 bg-blue-50 border border-blue-200 animate-pulse';
      case 'failed': return 'text-red-500 bg-red-50 border border-red-200';
      default: return 'text-gray-500 bg-gray-50 border border-brand-sand/50';
    }
  };

  const getFormattedSizeText = (size) => {
    switch (size?.toLowerCase()) {
      case 'small': return 'Bé nhỏ';
      case 'medium': return 'Trung bình';
      case 'large': return 'Lớn';
      case 'xlarge': return 'Cực lớn';
      default: return size || 'Trung bình';
    }
  };

  const subtotal = (order.items || []).reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
      {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG, GIAO HÀNG & THANH TOÁN (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Box 1: Khách hàng & Giao hàng */}
        <div className="bg-white border border-brand-sand p-4 shadow-xs">
          <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-brand-forest mb-3 border-b border-brand-sand/50 pb-2 flex items-center gap-1.5">
            <span>👤</span> THÔNG TIN GIAO HÀNG
          </h4>
          <div className="space-y-2.5 text-xs text-brand-charcoal">
            <div className="flex justify-between items-start">
              <span className="text-brand-slate/80">Khách hàng:</span>
              <span className="font-semibold text-right">{order.customerName}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-brand-slate/80">Số điện thoại:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-brand-forest">{order.phone || 'N/A'}</span>
                {order.phone && (
                  <button
                    type="button"
                    onClick={() => handleCopy(order.phone, 'số điện thoại')}
                    className="text-[9px] text-brand-clay hover:underline cursor-pointer"
                  >
                    (Sao chép)
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-brand-slate/80">Email liên hệ:</span>
              <span className="font-medium">{order.customerEmail}</span>
            </div>
            <div className="flex flex-col gap-1.5 pt-2.5 border-t border-brand-sand/30">
              <div className="flex justify-between items-center">
                <span className="text-brand-slate/80 font-bold uppercase text-[9px] tracking-wider">Địa chỉ giao hàng chi tiết:</span>
                <button
                  type="button"
                  onClick={() => {
                    const fullAddr = `${order.address || ''}, ${order.district || ''}, ${order.city || ''}`;
                    handleCopy(fullAddr, 'địa chỉ đầy đủ');
                  }}
                  className="text-[9px] text-brand-clay hover:underline cursor-pointer"
                >
                  (Sao chép địa chỉ)
                </button>
              </div>
              <div className="bg-brand-cream/40 border border-brand-sand/50 p-2.5 rounded-sm space-y-1 mt-0.5">
                <p className="font-bold text-brand-forest text-xs">{order.customerName}</p>
                <p className="font-mono text-[11px] text-[#666]">{order.phone || 'N/A'}</p>
                <p className="font-medium text-brand-charcoal text-xs leading-relaxed">
                  {order.address || 'N/A'}
                </p>
                <p className="text-[11px] text-brand-slate font-medium">
                  {order.district || 'N/A'}, {order.city || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Đối soát thanh toán */}
        <div className="bg-white border border-brand-sand p-4 shadow-xs">
          <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-brand-forest mb-3 border-b border-brand-sand/50 pb-2 flex items-center gap-1.5">
            <span>💳</span> THANH TOÁN & ĐỐI SOÁT
          </h4>
          <div className="space-y-2.5 text-xs text-brand-charcoal">
            <div className="flex justify-between">
              <span className="text-brand-slate/80">Mã đơn hàng gốc:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-brand-charcoal select-all">{order.id}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(order.id, 'mã đơn hàng đầy đủ')}
                  className="text-[9px] text-brand-clay hover:underline cursor-pointer"
                >
                  (Copy)
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-slate/80">Hình thức thanh toán:</span>
              <span className="font-bold text-brand-forest uppercase tracking-wider">
                {order.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR' : 'Thanh toán COD'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-slate/80">Trạng thái thanh toán:</span>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getPaymentStatusClass(order.paymentStatus)}`}>
                {getPaymentStatusText(order.paymentStatus)}
              </span>
            </div>
            
            <div className="flex flex-col gap-1 pt-2 border-t border-brand-sand/30">
              <div className="flex justify-between items-center">
                <span className="text-brand-slate/80">Mã đối soát CK (VietQR):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(`TS-${order.id.substring(0, 8).toUpperCase()}`, 'mã đối soát chuyển khoản')}
                  className="text-[9px] text-brand-clay hover:underline cursor-pointer"
                >
                  (Sao chép)
                </button>
              </div>
              <div className="font-mono font-bold text-brand-clay text-sm select-all">
                TS-{order.id.substring(0, 8).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Box 3: Hóa đơn VAT nếu có */}
        {order.vatRequested && (
          <div className="bg-red-50/40 border border-red-200/70 p-4 shadow-xs">
            <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-red-700 mb-3 border-b border-red-200/50 pb-2 flex items-center gap-1.5">
              <span>📋</span> YÊU CẦU XUẤT HÓA ĐƠN VAT (GTGT)
            </h4>
            <div className="space-y-2 text-xs text-brand-charcoal">
              <div>
                <span className="text-brand-slate/80 block mb-0.5">Tên công ty / Đơn vị:</span>
                <span className="font-bold text-brand-forest select-all">{order.vatCompanyName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-brand-slate/80 block mb-0.5">Mã số thuế (MST):</span>
                <span className="font-mono font-bold text-brand-clay text-sm select-all">{order.vatTaxCode || 'N/A'}</span>
              </div>
              <div>
                <span className="text-brand-slate/80 block mb-0.5">Địa chỉ công ty:</span>
                <span className="font-semibold select-all">{order.vatCompanyAddr || 'N/A'}</span>
              </div>
              <div>
                <span className="text-brand-slate/80 block mb-0.5">Email nhận hóa đơn:</span>
                <span className="font-bold text-brand-forest select-all">{order.vatEmail || 'N/A'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const info = `Công ty: ${order.vatCompanyName}\nMST: ${order.vatTaxCode}\nĐịa chỉ: ${order.vatCompanyAddr}\nEmail: ${order.vatEmail}`;
                  handleCopy(info, 'toàn bộ thông tin hóa đơn VAT');
                }}
                className="w-full mt-2 py-1.5 bg-red-100/70 hover:bg-red-100 text-red-800 border border-red-200 font-bold uppercase tracking-wider text-[9px] text-center transition-colors cursor-pointer"
              >
                📋 Sao chép thông tin VAT đầy đủ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: CHI TIẾT SẢN PHẨM & TÍNH TOÁN CHI PHÍ (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Box 4: Danh sách sản phẩm */}
        <div className="bg-white border border-brand-sand p-4 shadow-xs">
          <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-brand-forest mb-3 border-b border-brand-sand/50 pb-2 flex items-center justify-between">
            <span>🛒 SẢN PHẨM TRONG ĐƠN</span>
            <span className="text-[10px] text-[#666] font-normal font-sans">({order.items?.length || 0} sản phẩm)</span>
          </h4>
          <div className="divide-y divide-brand-sand/50 max-h-[280px] overflow-y-auto pr-1">
            {(order.items || []).map(item => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                <img
                  src={optimizeUnsplashImage(item.product?.image, 120)}
                  alt={item.product?.name}
                  className="w-12 h-12 object-cover border border-brand-sand"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-brand-forest truncate">{item.product?.name}</p>
                  <p className="text-[10px] text-[#888] mt-0.5 leading-relaxed">
                    Kiểu chậu: <span className="font-semibold text-brand-charcoal">{item.potStyle}</span> · 
                    Màu sắc: <span className="font-semibold text-brand-charcoal">{item.potColor}</span>
                  </p>
                  <p className="text-[10px] text-[#888] mt-0.5">
                    Kích cỡ: <span className="font-extrabold text-brand-clay uppercase tracking-wider text-[9px]">
                      {getFormattedSizeText(item.size)}
                    </span>
                  </p>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <span className="text-[10px] text-[#888]">{formatVND(item.price)} x {item.quantity}</span>
                  <span className="text-xs font-bold text-brand-charcoal mt-0.5">{formatVND(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box 5: Vouchers đã áp dụng */}
        {(order.productVoucherCode || order.shippingVoucherCode) && (
          <div className="bg-white border border-brand-sand p-4 shadow-xs">
            <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-brand-forest mb-3 border-b border-brand-sand/50 pb-2 flex items-center gap-1.5">
              <span>🏷️</span> KHUYẾN MÃI ĐÃ DÙNG
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.productVoucherCode && (
                <div className="border border-brand-forest/20 bg-brand-cream/30 p-2.5 flex items-start gap-2">
                  <span className="text-lg">🌿</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-brand-forest font-bold mb-0.5">Voucher sản phẩm</p>
                    <p className="font-mono text-xs font-black text-brand-forest select-all">{order.productVoucherCode}</p>
                  </div>
                </div>
              )}
              {order.shippingVoucherCode && (
                <div className="border border-brand-forest/20 bg-brand-cream/30 p-2.5 flex items-start gap-2">
                  <span className="text-lg">🚚</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-brand-forest font-bold mb-0.5">Voucher vận chuyển</p>
                    <p className="font-mono text-xs font-black text-brand-forest select-all">{order.shippingVoucherCode}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Box 6: Bảng đối soát chi tiết chi phí */}
        <div className="bg-white border border-brand-sand p-4 shadow-xs space-y-3">
          <h4 className="text-[11px] uppercase tracking-widest font-extrabold text-brand-forest border-b border-brand-sand/50 pb-2 flex items-center gap-1.5">
            <span>📊</span> TÍNH TOÁN CHI PHÍ & ĐỐI SOÁT
          </h4>
          
          <div className="space-y-2 text-xs text-brand-charcoal">
            <div className="flex justify-between">
              <span className="text-brand-slate/80">Tạm tính (Tiền hàng):</span>
              <span className="font-semibold">{formatVND(subtotal)}</span>
            </div>
            
            {order.discount > 0 && (
              <div className="flex justify-between text-brand-clay font-medium">
                <span className="flex items-center gap-1">
                  <span>Tổng giảm giá:</span>
                  {order.productVoucherCode && (
                    <span className="text-[9px] bg-brand-clay/10 text-brand-clay px-1 py-0.5 font-bold font-mono">
                      {order.productVoucherCode}
                    </span>
                  )}
                </span>
                <span>-{formatVND(order.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-brand-slate/80 flex items-center gap-1">
                <span>Phí vận chuyển:</span>
                {order.shippingVoucherCode && (
                  <span className="text-[9px] bg-brand-forest/10 text-brand-forest px-1 py-0.5 font-bold font-mono">
                    {order.shippingVoucherCode}
                  </span>
                )}
              </span>
              <span>{order.shippingCost > 0 ? formatVND(order.shippingCost) : 'Miễn phí'}</span>
            </div>

            <div className="flex justify-between border-t border-brand-sand pt-3 text-sm font-extrabold text-brand-forest">
              <span className="tracking-wide text-xs">TỔNG CỘNG THỰC THU (TRẢ KHÁCH):</span>
              <span className="text-base font-serif font-black">{formatVND(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
