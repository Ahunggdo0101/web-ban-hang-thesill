import React, { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';

const ProfileTab = React.memo(function ProfileTab({ user, showToast }) {
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '0988888888',
        avatar: user.avatar || '',
        bio: user.bio || 'Người yêu cây cảnh, thích chăm sóc thiên nhiên 🌱'
      });
    }
  }, [user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveProfile = useCallback((e) => {
    e.preventDefault();
    if (showToast) {
      showToast('Cập nhật thông tin cá nhân thành công!', 'success');
    }
  }, [showToast]);

  return (
    <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl text-left animate-fade-in">
      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Ảnh đại diện (Avatar URL)
        </label>
        <div className="flex items-center gap-4">
          <img
            src={profileForm.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150'}
            alt="Avatar Preview"
            className="w-12 h-12 rounded-full object-cover border border-brand-sand"
            loading="lazy"
          />
          <input
            type="text"
            name="avatar"
            value={profileForm.avatar}
            onChange={handleInputChange}
            placeholder="https://example.com/avatar.jpg"
            className="flex-1 border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
            Họ và tên
          </label>
          <input
            type="text"
            name="name"
            required
            value={profileForm.name}
            onChange={handleInputChange}
            className="w-full border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
            Số điện thoại
          </label>
          <input
            type="text"
            name="phone"
            value={profileForm.phone}
            onChange={handleInputChange}
            className="w-full border border-brand-sand bg-white px-3 py-2 text-xs focus:outline-none focus:border-brand-forest font-medium"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Địa chỉ Email (Không được sửa)
        </label>
        <input
          type="email"
          disabled
          value={profileForm.email}
          className="w-full border border-brand-sand bg-gray-100/75 text-[#888] px-3 py-2 text-xs cursor-not-allowed"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Giới thiệu bản thân
        </label>
        <textarea
          rows={3}
          name="bio"
          value={profileForm.bio}
          onChange={handleInputChange}
          className="w-full border border-brand-sand bg-white p-3 text-xs focus:outline-none focus:border-brand-forest font-medium"
        />
      </div>

      <button
        type="submit"
        className="bg-brand-forest text-brand-cream hover:bg-brand-moss py-2.5 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2"
      >
        <Save size={12} /> Lưu thông tin
      </button>
    </form>
  );
});

export default ProfileTab;
