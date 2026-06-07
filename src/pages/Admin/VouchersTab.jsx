import { useState, useEffect, useCallback } from 'react';
import {
  Search, X, Edit, Trash2, ChevronLeft, ChevronRight,
  Loader2, Plus, Calendar, Percent, Landmark, Target, Users
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { Toast, ConfirmModal } from './shared';

const API = API_BASE_URL;

export default function VouchersTab({ fetchWithAuth }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(initialForm());
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete states
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Live Search User states
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);
  
  // Dynamic categories state
  const [categories, setCategories] = useState([]);

  function initialForm() {
    return {
      code: '',
      type: 'product',
      discountType: 'percentage',
      discountValue: '',
      maxDiscount: '',
      minOrderValue: '0',
      categoryLimit: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      isPublic: true,
      userId: '',
    };
  }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Debounce search voucher
  useEffect(() => {
    const t = setTimeout(() => { setSearchQuery(searchInput); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load categories dynamic
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  const loadVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/vouchers`);
      if (res.ok) {
        const data = await res.json();
        setVouchers(data);
      } else {
        throw new Error('Không thể tải danh sách mã giảm giá');
      }
    } catch (e) {
      console.error('Lỗi tải danh sách voucher:', e);
      showToast('Không thể kết nối đến máy chủ để tải danh sách mã giảm giá', 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, showToast]);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  // Live Search User debounce
  useEffect(() => {
    if (!userSearchInput.trim() || formData.isPublic) {
      setUserResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setUserLoading(true);
      try {
        const res = await fetchWithAuth(`${API}/users?search=${encodeURIComponent(userSearchInput)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setUserResults(data.items || []);
        }
      } catch (err) {
        console.error('Lỗi tìm kiếm user:', err);
      } finally {
        setUserLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [userSearchInput, formData.isPublic, fetchWithAuth]);

  const handleOpenCreate = () => {
    setFormData(initialForm());
    setSelectedUser(null);
    setUserSearchInput('');
    setUserResults([]);
    setFormError('');
    setModalType('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setFormError('');
    setModalType('edit');
    setSelectedId(v.id);
    setSelectedUser(v.user || null);
    setUserSearchInput(v.user ? v.user.email : '');
    setUserResults([]);

    const formatDateForInput = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      // Convert to local ISO format for datetime-local input: YYYY-MM-DDTHH:MM
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().slice(0, 16);
    };

    setFormData({
      code: v.code,
      type: v.type,
      discountType: v.discountType,
      discountValue: v.discountValue.toString(),
      maxDiscount: v.maxDiscount ? v.maxDiscount.toString() : '',
      minOrderValue: v.minOrderValue.toString(),
      categoryLimit: v.categoryLimit || '',
      startDate: formatDateForInput(v.startDate),
      endDate: formatDateForInput(v.endDate),
      usageLimit: v.usageLimit ? v.usageLimit.toString() : '',
      isPublic: v.isPublic,
      userId: v.userId || '',
    });
    setIsModalOpen(true);
  };

  const handleInput = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFormData(prev => ({ ...prev, userId: user.id }));
    setUserSearchInput(user.name);
    setUserResults([]);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setFormData(prev => ({ ...prev, userId: '' }));
    setUserSearchInput('');
    setUserResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('Vui lòng nhập mã giảm giá.');
      return;
    }

    const discountVal = Number(formData.discountValue);
    if (isNaN(discountVal) || discountVal <= 0) {
      setFormError('Giá trị giảm giá phải là số dương lớn hơn 0.');
      return;
    }

    if (formData.discountType === 'percentage' && discountVal > 100) {
      setFormError('Giá trị giảm theo phần trăm không thể vượt quá 100%.');
      return;
    }

    if (!formData.isPublic && !formData.userId) {
      setFormError('Vui lòng chọn khách hàng nhận mã cho loại mã cá nhân.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      code: formData.code.toUpperCase().trim(),
      type: formData.type,
      discountType: formData.discountType,
      discountValue: discountVal,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      minOrderValue: Number(formData.minOrderValue) || 0,
      categoryLimit: formData.categoryLimit || null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      isPublic: formData.isPublic,
      userId: formData.isPublic ? null : formData.userId,
    };

    try {
      let url = `${API}/vouchers`;
      let method = 'POST';

      if (modalType === 'edit') {
        url = `${API}/vouchers/${selectedId}`;
        method = 'PUT';
      }

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(
          modalType === 'create' ? 'Đã thêm mã giảm giá mới thành công!' : 'Đã cập nhật mã giảm giá thành công!',
          'success'
        );
        setIsModalOpen(false);
        loadVouchers();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Lỗi hệ thống khi lưu mã giảm giá.');
      }
    } catch (err) {
      console.error('Lỗi khi lưu voucher:', err);
      setFormError(err.message || 'Lỗi hệ thống khi lưu mã giảm giá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`${API}/vouchers/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Đã xóa mã giảm giá thành công!', 'success');
        setDeleteId(null);
        loadVouchers();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Không thể xóa mã giảm giá.');
      }
    } catch (err) {
      console.error('Lỗi khi xóa voucher:', err);
      showToast(err.message || 'Lỗi khi xóa mã giảm giá', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter vouchers list client-side based on search and type
  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.user && v.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.user && v.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = typeFilter === 'all' || v.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-sand/40 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-light text-brand-forest">Quản Lý Mã Giảm Giá (Vouchers)</h1>
          <p className="text-xs text-brand-slate mt-1 font-medium">Tạo và phân bổ các chương trình khuyến mãi kép (sản phẩm & vận chuyển).</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-brand-forest hover:bg-brand-green text-brand-cream text-xs font-bold uppercase tracking-widest px-4.5 py-3 transition-colors cursor-pointer flex items-center gap-2"
        >
          <Plus size={14} /> Thêm Mã Giảm Giá
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-4 bg-brand-cream border border-brand-sand/50 p-4">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-slate">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Tìm theo CODE, tên hoặc email khách hàng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-brand-sand pl-9 pr-4 py-2 text-xs focus:border-brand-forest focus:outline-none placeholder-brand-sand font-medium"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-slate font-bold uppercase tracking-wider">Loại mã:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-brand-sand px-3 py-2 text-xs focus:border-brand-forest focus:outline-none font-medium"
          >
            <option value="all">Tất cả các loại</option>
            <option value="product">Giảm giá sản phẩm</option>
            <option value="shipping">Ưu đãi vận chuyển</option>
          </select>
        </div>
      </div>

      {/* VOUCHERS TABLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-brand-slate">
          <Loader2 className="animate-spin mb-3 text-brand-forest" size={32} />
          <span className="text-xs font-bold uppercase tracking-widest">Đang tải danh sách mã...</span>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-16 bg-brand-cream border border-brand-sand/40">
          <span className="text-3xl mb-2 block">🎟️</span>
          <p className="font-serif text-brand-forest font-light text-lg">Không tìm thấy mã giảm giá nào</p>
          <p className="text-xs text-brand-slate mt-1 font-medium">Hãy nhấn nút "Thêm Mã Giảm Giá" để tạo chương trình khuyến mãi đầu tiên.</p>
        </div>
      ) : (
        <div className="bg-white border border-brand-sand/50 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-brand-cream border-b border-brand-sand/50 text-[10px] font-bold text-brand-forest uppercase tracking-wider">
                <th className="px-6 py-4">Mã CODE</th>
                <th className="px-6 py-4">Phân Loại</th>
                <th className="px-6 py-4">Giá Trị Giảm</th>
                <th className="px-6 py-4">Điều Kiện</th>
                <th className="px-6 py-4">Đối Tượng</th>
                <th className="px-6 py-4">Lượt dùng</th>
                <th className="px-6 py-4">Hạn sử dụng</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sand/30 text-xs">
              {filteredVouchers.map((v) => {
                const isExpired = v.endDate && new Date(v.endDate) < new Date();
                const isFull = v.usageLimit !== null && v.usedCount >= v.usageLimit;
                const isInactive = (v.startDate && new Date(v.startDate) > new Date()) || isExpired || isFull;

                return (
                  <tr key={v.id} className={`hover:bg-brand-cream/10 transition-colors ${isInactive ? 'opacity-65' : ''}`}>
                    {/* Code */}
                    <td className="px-6 py-4 font-bold font-mono text-sm text-brand-forest">
                      {v.code}
                      {isExpired && <span className="ml-2 bg-red-100 text-red-800 text-[8px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide uppercase">Hết Hạn</span>}
                      {isFull && <span className="ml-2 bg-yellow-100 text-yellow-800 text-[8px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide uppercase">Hết Lượt</span>}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 font-bold">
                      {v.type === 'product' ? (
                        <span className="inline-flex items-center gap-1 text-[#007b5f] bg-[#007b5f]/5 px-2 py-1 rounded-sm">
                          <Percent size={11} /> Sản phẩm
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#003B75] bg-[#003B75]/5 px-2 py-1 rounded-sm">
                          <Landmark size={11} /> Vận chuyển
                        </span>
                      )}
                    </td>

                    {/* Value */}
                    <td className="px-6 py-4 font-bold">
                      {v.discountType === 'percentage' ? (
                        <span>
                          {v.discountValue}%
                          {v.maxDiscount && <span className="text-[10px] text-brand-slate font-medium block mt-0.5">(Tối đa {v.maxDiscount.toLocaleString('vi-VN')}đ)</span>}
                        </span>
                      ) : (
                        <span>{v.discountValue.toLocaleString('vi-VN')} đ</span>
                      )}
                    </td>

                    {/* Conditions */}
                    <td className="px-6 py-4 space-y-0.5 text-[11px] text-brand-slate font-medium">
                      <div>Đơn tối thiểu: <strong>{v.minOrderValue.toLocaleString('vi-VN')}đ</strong></div>
                      {v.categoryLimit && <div>Danh mục: <strong className="text-brand-clay font-semibold uppercase">{v.categoryLimit}</strong></div>}
                    </td>

                    {/* Target */}
                    <td className="px-6 py-4">
                      {v.isPublic ? (
                        <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wide">
                          <Users size={11} /> Công Khai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-brand-clay bg-brand-clay/5 px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wide" title={v.user?.email}>
                          <Target size={11} /> Cá nhân
                        </span>
                      )}
                      {v.user && <div className="text-[10px] text-brand-slate truncate max-w-[150px] font-medium mt-1">{v.user.name}</div>}
                    </td>

                    {/* Usage */}
                    <td className="px-6 py-4 font-semibold text-brand-charcoal">
                      {v.usedCount} / {v.usageLimit !== null ? v.usageLimit : '∞'}
                    </td>

                    {/* Expiry */}
                    <td className="px-6 py-4 text-[11px] text-brand-slate font-medium space-y-0.5">
                      {v.startDate && <div>Bắt đầu: {new Date(v.startDate).toLocaleDateString('vi-VN')}</div>}
                      {v.endDate ? (
                        <div className={isExpired ? 'text-red-600 font-bold' : ''}>
                          Hết hạn: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                        </div>
                      ) : (
                        <div className="text-green-700 font-semibold">Vô hạn</div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="text-brand-forest hover:text-brand-green p-1 transition-colors cursor-pointer"
                          title="Chỉnh sửa mã"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(v.id)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer"
                          title="Xóa mã"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE/EDIT VOUCHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40">
          <div className="bg-brand-cream border border-brand-sand max-w-lg w-full p-6 sm:p-8 relative shadow-2xl modal-panel">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-brand-charcoal hover:text-brand-green p-1 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="font-serif text-xl font-light text-brand-forest border-b border-brand-sand/50 pb-3 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-forest text-brand-cream flex items-center justify-center text-xs">🎟️</span>
              {modalType === 'create' ? 'Thêm Mã Giảm Giá Mới' : 'Cập Nhật Cấu Hình Voucher'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
                  ⚠️ {formError}
                </div>
              )}

              {/* Code & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">Mã CODE *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="MÃ GIẢM GIÁ"
                    disabled={modalType === 'edit'}
                    className="w-full bg-white border border-brand-sand px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none font-bold placeholder-brand-sand/40 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">Phân Loại Mã *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInput}
                    className="w-full bg-white border border-brand-sand px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none font-bold"
                  >
                    <option value="product">Giảm giá sản phẩm</option>
                    <option value="shipping">Ưu đãi phí vận chuyển</option>
                  </select>
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">Hình thức giảm *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInput}
                    className="w-full bg-white border border-brand-sand px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none font-semibold"
                  >
                    <option value="percentage">Theo phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">Trị giá giảm *</label>
                  <div className="flex border border-brand-sand bg-white focus-within:border-brand-forest transition-colors">
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInput}
                      placeholder={formData.discountType === 'percentage' ? 'Ví dụ: 10' : 'Ví dụ: 30000'}
                      className="flex-grow bg-transparent px-3 py-2.5 text-xs text-brand-charcoal focus:outline-none font-bold placeholder-brand-sand/40 border-none w-full"
                      required
                    />
                    <span className="flex items-center px-3 text-xs font-bold text-brand-forest bg-[#f9f8f7] border-l border-brand-sand select-none min-w-[32px] justify-center">
                      {formData.discountType === 'percentage' ? '%' : 'đ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Max Discount & Min Order Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">
                    Giảm tối đa
                    {formData.discountType !== 'percentage' && <span className="text-[9px] text-brand-slate font-medium normal-case ml-1">(Chỉ áp dụng với %)</span>}
                  </label>
                  <div className={`flex border border-brand-sand transition-colors ${formData.discountType !== 'percentage' ? 'bg-gray-100' : 'bg-white focus-within:border-brand-forest'}`}>
                    <input
                      type="number"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleInput}
                      placeholder="Không giới hạn"
                      disabled={formData.discountType !== 'percentage'}
                      className="flex-grow bg-transparent px-3 py-2.5 text-xs text-brand-charcoal focus:outline-none placeholder-brand-sand/40 border-none w-full disabled:cursor-not-allowed"
                    />
                    <span className={`flex items-center px-3 text-xs font-bold text-brand-forest border-l border-brand-sand select-none min-w-[32px] justify-center ${formData.discountType !== 'percentage' ? 'bg-gray-200 text-brand-slate/60' : 'bg-[#f9f8f7]'}`}>
                      đ
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">Đơn tối thiểu</label>
                  <div className="flex border border-brand-sand bg-white focus-within:border-brand-forest transition-colors">
                    <input
                      type="number"
                      name="minOrderValue"
                      value={formData.minOrderValue}
                      onChange={handleInput}
                      placeholder="Ví dụ: 150000"
                      className="flex-grow bg-transparent px-3 py-2.5 text-xs text-brand-charcoal focus:outline-none font-semibold border-none w-full"
                    />
                    <span className="flex items-center px-3 text-xs font-bold text-brand-forest bg-[#f9f8f7] border-l border-brand-sand select-none min-w-[32px] justify-center">
                      đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Category limit & Usage limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">Giới hạn danh mục</label>
                  <select
                    name="categoryLimit"
                    value={formData.categoryLimit}
                    onChange={handleInput}
                    className="w-full bg-white border border-brand-sand px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="">Áp dụng cho mọi danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">Số lần sử dụng tối đa</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInput}
                    placeholder="Không giới hạn"
                    className="w-full bg-white border border-brand-sand px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none placeholder-brand-sand/40"
                  />
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">Ngày bắt đầu</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInput}
                    className="w-full bg-white border border-brand-sand px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1.5">Ngày hết hạn</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInput}
                    className="w-full bg-white border border-brand-sand px-3 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Public vs Personal Target */}
              <div className="border-t border-brand-sand/50 pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInput}
                    className="w-4 h-4 text-brand-forest focus:ring-brand-forest accent-brand-forest cursor-pointer"
                  />
                  <label htmlFor="isPublic" className="text-xs font-bold uppercase tracking-wider text-brand-forest cursor-pointer select-none">
                    🌍 Phát hành toàn hệ thống (Công khai cho mọi khách hàng)
                  </label>
                </div>

                {/* PERSONAL TARGET USER FIELD */}
                {!formData.isPublic && (
                  <div className="bg-white border border-brand-sand/40 p-4 space-y-3 relative">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest mb-1 flex items-center gap-1.5">
                      <Target size={12} className="text-brand-clay" /> Gửi tặng cá nhân khách hàng *
                    </label>

                    {selectedUser ? (
                      <div className="flex justify-between items-center bg-brand-cream border border-brand-sand px-3 py-2 rounded-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-brand-forest truncate">{selectedUser.name}</p>
                          <p className="text-[10px] text-brand-slate truncate">{selectedUser.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearSelectedUser}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer transition-colors"
                          title="Chọn user khác"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-3 text-brand-slate" size={14} />
                        <input
                          type="text"
                          placeholder="Nhập tên hoặc email khách hàng để tìm..."
                          value={userSearchInput}
                          onChange={(e) => setUserSearchInput(e.target.value)}
                          className="w-full bg-brand-cream border border-brand-sand pl-9 pr-4 py-2.5 text-xs text-brand-charcoal focus:border-brand-forest focus:outline-none placeholder-brand-sand/65 font-medium"
                        />

                        {userLoading && (
                          <div className="absolute right-3 top-3.5">
                            <Loader2 className="animate-spin text-brand-forest" size={12} />
                          </div>
                        )}

                        {/* Search dropdown results */}
                        {userResults.length > 0 && (
                          <div className="absolute z-10 w-full left-0 mt-1.5 bg-white border border-brand-sand shadow-lg max-h-48 overflow-y-auto divide-y divide-brand-sand/20">
                            {userResults.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => handleSelectUser(u)}
                                className="w-full text-left px-4 py-2 hover:bg-brand-cream/40 transition-colors flex flex-col min-w-0"
                              >
                                <span className="font-semibold text-xs text-brand-forest truncate">{u.name}</span>
                                <span className="text-[10px] text-brand-slate truncate">{u.email}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {!userLoading && userSearchInput.trim() && userResults.length === 0 && (
                          <div className="absolute z-10 w-full left-0 mt-1.5 bg-white border border-brand-sand p-3 text-xs text-brand-slate text-center italic">
                            Không tìm thấy khách hàng nào khớp.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form submit button */}
              <div className="border-t border-brand-sand/50 pt-5 mt-2 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="border border-brand-sand text-brand-charcoal hover:bg-brand-cream text-xs font-bold uppercase tracking-widest px-5 py-3 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-forest hover:bg-brand-green text-brand-cream text-xs font-bold uppercase tracking-widest px-5 py-3 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={13} />}
                  {modalType === 'create' ? 'Tạo mới' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa Mã Giảm Giá"
        message="Bạn có chắc chắn muốn xóa mã giảm giá này không? Đơn hàng cũ đã dùng mã này vẫn giữ nguyên lịch sử, nhưng khách hàng mới sẽ không thể nhập mã này được nữa."
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        isLoading={isDeleting}
      />

      {/* TOAST SYSTEM */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
