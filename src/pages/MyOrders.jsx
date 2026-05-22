import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Clock, Loader2, CheckCircle2, XCircle, AlertCircle, ShoppingBag, AlertTriangle, ArrowRight } from 'lucide-react';

// Thành phần hiển thị trạng thái đơn hàng (tương tự trang Admin)
const StatusBadge = ({ status }) => {
  const map = {
    pending:    { label: 'Chờ xử lý',   cls: 'bg-amber-50 text-amber-700 border-amber-200',   icon: Clock },
    processing: { label: 'Đang xử lý',  cls: 'bg-blue-50 text-blue-700 border-blue-200',       icon: Loader2 },
    completed:  { label: 'Hoàn thành',  cls: 'bg-green-50 text-green-700 border-green-200',    icon: CheckCircle2 },
    cancelled:  { label: 'Đã hủy',      cls: 'bg-red-50 text-red-700 border-red-200',          icon: XCircle },
  };
  const cfg = map[status] || { label: status, cls: 'bg-gray-50 text-gray-600 border-gray-200', icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${cfg.cls}`}>
      {Icon === Loader2 ? <Icon size={9} className="animate-spin" /> : <Icon size={9} />}
      {cfg.label}
    </span>
  );
};

export default function MyOrders() {
  const navigate = useNavigate();
  const { fetchWithAuth, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm gọi API lấy danh sách đơn hàng của tôi
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/orders/my-orders`);
      if (!response.ok) {
        throw new Error('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      }
      const data = await response.json();
      // Sắp xếp đơn hàng mới nhất lên đầu dựa theo ngày tạo
      const sortedOrders = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Đã xảy ra lỗi khi kết nối đến hệ thống.');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  // Định dạng ngày hiển thị theo chuẩn Việt Nam
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Định dạng giá tiền bằng đô la ($)
  const formatPrice = (price) => {
    return typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`;
  };

  // Trạng thái đang tải dữ liệu
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-brand-forest mb-4" size={36} />
        <p className="text-xs uppercase tracking-widest text-[#666] font-bold">Đang tải lịch sử đơn hàng...</p>
      </div>
    );
  }

  // Trạng thái xảy ra lỗi khi tải dữ liệu
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[50vh]">
        <div className="bg-red-50 border border-red-200 p-6 max-w-lg mx-auto text-center space-y-4">
          <AlertTriangle className="text-red-500 mx-auto" size={32} />
          <h3 className="font-serif text-lg text-brand-forest">Đã xảy ra lỗi</h3>
          <p className="text-xs text-brand-slate leading-relaxed font-medium">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-brand-forest text-brand-cream text-[10px] font-bold uppercase tracking-widest px-6 py-3 hover:bg-brand-green transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in bg-brand-cream">
      {/* Tiêu đề trang theo style premium */}
      <div className="text-left border-b border-brand-sand pb-10 mb-14">
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
          Tài khoản của bạn
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-brand-forest font-light mt-2">
          Đơn hàng của tôi
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate max-w-xl mt-3 leading-relaxed font-medium">
          Xem thông tin chi tiết và theo dõi trạng thái các đơn hàng bạn đã đặt tại The Sill.
        </p>
      </div>

      {orders.length === 0 ? (
        /* Trạng thái trống (chưa có đơn hàng nào) */
        <div className="text-center py-16 bg-brand-white border border-brand-sand p-8 max-w-md mx-auto space-y-6">
          <ShoppingBag className="text-brand-clay mx-auto opacity-60" size={40} />
          <div className="space-y-2">
            <h3 className="font-serif text-lg text-brand-forest">Chưa có đơn hàng nào</h3>
            <p className="text-xs text-brand-slate leading-relaxed">
              Bạn chưa thực hiện bất kỳ giao dịch nào. Hãy bắt đầu chọn những chậu cây xinh xắn cho không gian của bạn!
            </p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="w-full bg-brand-forest text-brand-cream text-[10px] font-bold uppercase tracking-widest py-3.5 hover:bg-brand-green transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            Mua sắm ngay <ArrowRight size={12} />
          </button>
        </div>
      ) : (
        /* Danh sách đơn hàng */
        <div className="space-y-8 max-w-4xl mx-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-brand-white border border-brand-sand p-6 sm:p-8 shadow-sm space-y-6 transition-all hover:shadow-md"
            >
              {/* Phần đầu card đơn hàng */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-sand/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#777] font-bold">Mã đơn hàng</span>
                    <span className="font-mono text-xs font-semibold text-brand-charcoal select-all">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-brand-slate font-medium">
                    Đặt ngày {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center">
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Danh sách sản phẩm của đơn hàng */}
              <div className="divide-y divide-brand-sand/40">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    <div className="w-20 h-20 bg-brand-cream border border-brand-sand shrink-0 overflow-hidden">
                      <img
                        src={item.product?.image}
                        alt={item.product?.name || 'Sản phẩm'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=150&auto=format&fit=crop&q=60';
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm text-brand-forest font-normal">
                          {item.product?.name || 'Sản phẩm không tên'}
                        </h4>
                        <div className="flex flex-wrap gap-x-3 text-[10px] text-[#777] font-semibold uppercase tracking-wider">
                          {item.potStyle && <span>Kiểu: {item.potStyle}</span>}
                          {item.potColor && <span>Màu: {item.potColor}</span>}
                        </div>
                      </div>
                      <div className="flex justify-between items-end text-xs">
                        <span className="text-[#777]">
                          Số lượng: <strong>{item.quantity}</strong>
                        </span>
                        <span className="font-bold text-brand-charcoal">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phần chân card đơn hàng (Thông tin người nhận, Tổng cộng) */}
              <div className="pt-4 border-t border-brand-sand/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-cream/30 -mx-6 sm:-mx-8 px-6 sm:px-8 -mb-6 sm:-mb-8 py-5">
                <div className="text-[10px] text-brand-slate uppercase tracking-wider font-semibold space-y-1">
                  <div>
                    Người nhận: <strong className="text-brand-charcoal">{order.customerName}</strong>
                  </div>
                  <div>
                    Email: <strong className="text-brand-charcoal">{order.customerEmail}</strong>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto text-right space-y-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-brand-sand">
                  {order.discount > 0 && (
                    <div className="flex justify-between sm:justify-end gap-6 text-xs text-[#777]">
                      <span>Khuyến mãi:</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between sm:justify-end gap-6 text-xs text-[#777]">
                      <span>Phí vận chuyển:</span>
                      <span>{formatPrice(order.shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between sm:justify-end gap-6 items-baseline">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#555]">
                      Tổng thanh toán:
                    </span>
                    <span className="font-serif text-lg sm:text-xl font-light text-brand-forest">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
