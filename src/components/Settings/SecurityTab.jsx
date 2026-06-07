import React, { useState, useCallback } from 'react';
import { Save } from 'lucide-react';

const SecurityTab = React.memo(function SecurityTab({ showToast }) {
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveSecurity = useCallback((e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      if (showToast) showToast('Mật khẩu mới không trùng khớp.', 'error');
      return;
    }
    if (securityForm.newPassword.length < 6) {
      if (showToast) showToast('Mật khẩu mới phải có tối thiểu 6 ký tự.', 'warning');
      return;
    }
    if (showToast) showToast('Đổi mật khẩu bảo mật thành công!', 'success');
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }, [securityForm, showToast]);

  return (
    <form onSubmit={handleSaveSecurity} className="space-y-4 max-w-xl text-left animate-fade-in">
      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Mật khẩu hiện tại
        </label>
        <input
          type="password"
          name="currentPassword"
          required
          value={securityForm.currentPassword}
          onChange={handleInputChange}
          className="w-full border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Mật khẩu mới
        </label>
        <input
          type="password"
          name="newPassword"
          required
          value={securityForm.newPassword}
          onChange={handleInputChange}
          placeholder="Tối thiểu 6 ký tự"
          className="w-full border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Xác nhận mật khẩu mới
        </label>
        <input
          type="password"
          name="confirmPassword"
          required
          value={securityForm.confirmPassword}
          onChange={handleInputChange}
          className="w-full border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest"
        />
      </div>

      <div className="bg-[#1F3E35]/5 p-3.5 border border-[#1F3E35]/10 rounded-sm">
        <p className="text-[10px] text-[#666] leading-relaxed">
          Yêu cầu bảo mật: Nên đặt mật khẩu chứa cả chữ in hoa, chữ thường và chữ số để đảm bảo tính an toàn tối đa cho tài khoản của bạn.
        </p>
      </div>

      <button
        type="submit"
        className="bg-brand-forest text-brand-cream hover:bg-brand-moss py-2.5 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2"
      >
        <Save size={12} /> Cập nhật mật khẩu
      </button>
    </form>
  );
});

export default SecurityTab;
