import { useState, useEffect, useCallback } from 'react';
import {
  Search, X, Loader2, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { Toast, ConfirmModal } from './shared';

const API = API_BASE_URL;

export default function UsersTab({ fetchWithAuth }) {
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetchWithAuth(`${API}/users?${params}`);
      const data = await res.json();
      setUsers(data.items || []);
      setTotalItems(data.meta?.totalItems ?? 0);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, searchQuery, fetchWithAuth]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await fetchWithAuth(`${API}/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      showToast(`Đã đổi role thành "${newRole}"`);
      loadUsers();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`${API}/users/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      showToast('Đã xóa người dùng!');
      setDeleteId(null);
      loadUsers();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setIsDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <Toast toast={toast} />
      <ConfirmModal
        open={!!deleteId}
        title="Xóa tài khoản người dùng?"
        description="Tài khoản và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
        confirmLabel="Xóa người dùng"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-serif text-2xl text-brand-forest font-light">Người dùng <span className="text-sm text-[#888] font-sans font-normal">({totalItems})</span></h2>
      </div>

      <div className="bg-white border border-brand-sand p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-[#888]" size={14} />
          <input type="text" placeholder="Tìm theo tên hoặc email..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full bg-brand-cream border border-brand-sand/70 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand-forest" />
          {searchInput && <button onClick={() => setSearchInput('')} className="absolute right-3 top-2.5 text-[#888] hover:text-brand-charcoal cursor-pointer"><X size={13} /></button>}
        </div>
      </div>

      <div className="bg-white border border-brand-sand shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/80 border-b border-brand-sand text-[10px] uppercase tracking-widest text-[#555] font-bold">
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Đơn hàng</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Ngày tham gia</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sand text-xs text-brand-charcoal">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-brand-forest" size={24} /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-[#888] font-serif">Không tìm thấy người dùng nào.</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-brand-cream/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-brand-sand" loading="lazy" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-moss border border-brand-sand flex items-center justify-center text-brand-forest font-bold text-xs">{user.name?.[0]?.toUpperCase()}</div>
                      )}
                      <span className="font-semibold">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#777]">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 bg-brand-forest/5 border border-brand-forest/15 text-brand-forest text-[9px] px-2 py-0.5 font-bold uppercase">{user._count?.orders ?? 0} đơn</span>
                  </td>
                  <td className="py-3 px-4">
                    {updatingId === user.id ? (
                      <Loader2 size={14} className="animate-spin text-brand-slate" />
                    ) : (
                      <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)} className="text-[10px] border border-brand-sand bg-brand-cream px-2 py-1 focus:outline-none focus:border-brand-forest cursor-pointer font-bold uppercase tracking-wider">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[10px] text-[#888]">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setDeleteId(user.id)} className="p-1.5 border border-brand-sand text-[#777] hover:text-red-500 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-all"><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-brand-sand px-4 py-3 bg-brand-cream/30">
            <span className="text-[10px] text-[#666] uppercase tracking-wider font-bold">Trang {page}/{totalPages} · {totalItems} người dùng</span>
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
