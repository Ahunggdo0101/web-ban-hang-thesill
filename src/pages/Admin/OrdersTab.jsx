import { useState, useEffect, useCallback } from 'react';
import {
  Search, X, Loader2, ChevronDown, Trash2, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { Toast, ConfirmModal, StatusBadge } from './shared';

const API = API_BASE_URL;

export default function OrdersTab({ fetchWithAuth }) {
  const [orders, setOrders] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearchQuery(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetchWithAuth(`${API}/orders/admin/all?${params}`);
      const data = await res.json();
      setOrders(data.items || []);
      setTotalItems(data.meta?.totalItems ?? 0);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, searchQuery, statusFilter, fetchWithAuth]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetchWithAuth(`${API}/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      showToast(`Đã cập nhật trạng thái thành "${newStatus}"`);
      loadOrders();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`${API}/orders/admin/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      showToast('Đã xóa đơn hàng thành công!');
      setDeleteId(null);
      loadOrders();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setIsDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <Toast toast={toast} />
      <ConfirmModal
        open={!!deleteId}
        title="Xóa đơn hàng này?"
        description={`Đơn hàng "${deleteId?.substring(0, 16)}..." sẽ bị xóa vĩnh viễn.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
        confirmLabel="Xóa đơn hàng"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-serif text-2xl text-brand-forest font-light">Quản lý đơn hàng <span className="text-sm text-[#888] font-sans font-normal">({totalItems})</span></h2>
        <button onClick={loadOrders} className="inline-flex items-center gap-1.5 text-xs text-brand-slate hover:text-brand-forest uppercase tracking-wider font-bold cursor-pointer">
          <RefreshCw size={12} /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-brand-sand p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-[#888]" size={14} />
          <input type="text" placeholder="Tìm theo tên, email, mã đơn hàng..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full bg-brand-cream border border-brand-sand/70 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand-forest" />
          {searchInput && <button onClick={() => setSearchInput('')} className="absolute right-3 top-2.5 text-[#888] hover:text-brand-charcoal cursor-pointer"><X size={13} /></button>}
        </div>
        <div className="flex border border-brand-sand overflow-hidden">
          {[{ v: 'all', l: 'Tất cả' }, { v: 'pending', l: 'Chờ' }, { v: 'processing', l: 'Đang xử lý' }, { v: 'completed', l: 'Hoàn thành' }, { v: 'cancelled', l: 'Đã hủy' }].map(({ v, l }) => (
            <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }} className={`px-3 py-1.5 text-[10px] font-semibold cursor-pointer transition-colors ${statusFilter === v ? 'bg-brand-forest text-brand-cream' : 'text-brand-charcoal hover:bg-brand-sand/30'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-sand shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/80 border-b border-brand-sand text-[10px] uppercase tracking-widest text-[#555] font-bold">
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày đặt</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sand text-xs text-brand-charcoal">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-brand-forest" size={24} /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-[#888] font-serif">Không tìm thấy đơn hàng nào.</td></tr>
              ) : orders.map(order => (
                <>
                  <tr key={order.id} className="hover:bg-brand-cream/30 transition-colors">
                    <td className="py-3 px-4">
                      <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="text-[10px] font-mono text-brand-clay hover:text-brand-forest cursor-pointer flex items-center gap-1">
                        <ChevronDown size={10} className={`transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                        {order.id.substring(0, 12)}...
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-brand-charcoal">{order.customerName}</div>
                      <div className="text-[10px] text-[#888]">{order.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-forest">${order.totalAmount?.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {updatingId === order.id ? (
                        <Loader2 size={14} className="animate-spin text-brand-slate" />
                      ) : (
                        <select value={order.status} onChange={e => handleStatusUpdate(order.id, e.target.value)} className="text-[10px] border border-brand-sand bg-brand-cream px-2 py-1 focus:outline-none focus:border-brand-forest cursor-pointer font-bold uppercase tracking-wider">
                          <option value="pending">Chờ xử lý</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-[#888]">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => setDeleteId(order.id)} className="p-1.5 border border-brand-sand text-[#777] hover:text-red-500 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-all"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-expanded`} className="bg-brand-cream/20">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-sage">Chi tiết đơn hàng</p>
                          {/* Thông tin giao hàng COD */}
                          <div className="bg-white border border-brand-sand p-3 space-y-1 text-brand-charcoal">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-clay mb-1">Thông Tin Giao Hàng</p>
                            <p>Số điện thoại: <span className="font-bold text-brand-forest">{order.phone || 'N/A'}</span></p>
                            <p>Địa chỉ nhận: <span className="font-semibold">{order.address || 'N/A'}, {order.district || 'N/A'}, {order.city || 'N/A'}</span></p>
                          </div>
                          <div className="space-y-2">
                            {(order.items || []).map(item => (
                              <div key={item.id} className="flex items-center gap-3 bg-white border border-brand-sand p-3">
                                <img src={item.product?.image} alt={item.product?.name} className="w-10 h-10 object-cover border border-brand-sand" loading="lazy" />
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-brand-forest">{item.product?.name}</p>
                                  <p className="text-[10px] text-[#888]">Chậu: {item.potStyle} · Màu: {item.potColor} · SL: {item.quantity}</p>
                                </div>
                                <span className="text-xs font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          {order.discount > 0 && <div className="text-xs text-brand-clay font-semibold">Giảm giá: -${order.discount?.toFixed(2)}</div>}
                          {order.shippingCost > 0 && <div className="text-xs text-[#666]">Phí vận chuyển: ${order.shippingCost?.toFixed(2)}</div>}
                          <div className="text-xs font-bold text-brand-forest">Tổng cộng: ${order.totalAmount?.toFixed(2)}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-sand px-4 py-3 bg-brand-cream/30">
            <span className="text-[10px] text-[#666] uppercase tracking-wider font-bold">Trang {page}/{totalPages} · {totalItems} đơn hàng</span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 cursor-pointer"><ChevronLeft size={13} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-brand-sand bg-white hover:bg-brand-cream/50 disabled:opacity-40 cursor-pointer"><ChevronRight size={13} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
