import { useState, useCallback, useMemo } from 'react';
import { X, User, MapPin, Bell, Shield, Palette, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

// Import các subcomponents đã được tách biệt để tối ưu hóa re-render của React
import ProfileTab from './Settings/ProfileTab';
import AddressesTab from './Settings/AddressesTab';
import NotificationsTab from './Settings/NotificationsTab';
import SecurityTab from './Settings/SecurityTab';
import AppearanceTab from './Settings/AppearanceTab';
import ActivityTab from './Settings/ActivityTab';

// Di chuyển mảng tĩnh ra bên ngoài component để tránh khởi tạo lại trong các lượt render
const MENU_ITEMS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User, requiresUser: true },
  { id: 'addresses', label: 'Địa chỉ của tôi', icon: MapPin, requiresUser: true },
  { id: 'notifications', label: 'Cài đặt thông báo', icon: Bell, requiresUser: true },
  { id: 'security', label: 'Bảo mật & Mật khẩu', icon: Shield, requiresUser: true },
  { id: 'appearance', label: 'Cấu hình giao diện', icon: Palette, requiresUser: false },
  { id: 'activity', label: 'Lịch sử hoạt động', icon: Activity, requiresUser: true },
];

export default function SettingsModal() {
  const { isSettingsModalOpen, setIsSettingsModalOpen, user, settingsActiveTab, setSettingsActiveTab } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Đảm bảo tab được chọn là hợp lệ. Nếu không có user đăng nhập, tab mặc định sẽ rơi vào 'appearance'
  const currentTab = useMemo(() => {
    if (!user && MENU_ITEMS.find(i => i.id === settingsActiveTab)?.requiresUser) {
      return 'appearance';
    }
    return settingsActiveTab || 'profile';
  }, [user, settingsActiveTab]);

  const handleTabChange = useCallback((id) => {
    setSettingsActiveTab(id);
  }, [setSettingsActiveTab]);

  const handleClose = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, [setIsSettingsModalOpen]);

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-4 transition-opacity duration-300">
      {/* Backdrop (Backdrop tối giản, loại bỏ blur nặng gây lag GPU di động) */}
      <div
        className="absolute inset-0 bg-[#0D231A]/45 will-change-opacity transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Box */}
      <div className="relative bg-brand-cream w-full max-w-4xl border border-brand-sand shadow-2xl z-10 flex flex-col md:flex-row h-[85vh] max-h-[700px] overflow-hidden animate-fade-in will-change-transform">
        
        {/* Close Button Mobile */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-brand-charcoal hover:text-brand-moss p-1 transition-colors cursor-pointer z-20 md:hidden"
        >
          <X size={20} />
        </button>

        {/* Sidebar Menu (Trái) */}
        <div className="w-full md:w-64 bg-brand-white border-b md:border-b-0 md:border-r border-brand-sand flex flex-col shrink-0">
          <div className="p-5 border-b border-brand-sand hidden md:flex justify-between items-center">
            <span className="font-serif text-lg text-brand-forest lowercase tracking-wider">
              cài đặt tài khoản
            </span>
          </div>

          {/* List tabs */}
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar p-3 md:p-4 gap-1 flex-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isLocked = item.requiresUser && !user;
              const isSelected = currentTab === item.id;
              
              return (
                <button
                  key={item.id}
                  disabled={isLocked}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer select-none shrink-0 ${
                    isLocked 
                      ? 'opacity-30 cursor-not-allowed'
                      : isSelected
                      ? 'bg-brand-cream text-brand-forest border-l-2 md:border-l-4 border-brand-forest pl-3 md:pl-4'
                      : 'text-[#666] hover:text-brand-forest hover:bg-brand-cream/30'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-brand-forest' : 'text-brand-sage'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Preview Footer inside Sidebar */}
          {user && (
            <div className="p-4 border-t border-brand-sand bg-brand-cream/20 hidden md:flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-brand-sand"
                loading="lazy"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-brand-forest truncate">{user.name}</p>
                <p className="text-[10px] text-[#888] truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Form Content Area (Phải) */}
        <div className="flex-1 flex flex-col bg-brand-cream overflow-hidden">
          
          {/* Header Desktop */}
          <div className="px-6 py-5 border-b border-brand-sand hidden md:flex justify-between items-center bg-brand-white">
            <h3 className="font-serif text-xl text-brand-forest font-light capitalize">
              {MENU_ITEMS.find(i => i.id === currentTab)?.label}
            </h3>
            <button
              onClick={handleClose}
              className="text-brand-charcoal hover:text-brand-moss p-1 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Cảnh báo nếu chưa đăng nhập và chọn tab khóa */}
            {!user && MENU_ITEMS.find(i => i.id === currentTab)?.requiresUser && (
              <div className="bg-brand-white border border-brand-sand p-6 text-center space-y-4 max-w-md mx-auto my-8">
                <p className="text-xs text-brand-slate font-medium leading-relaxed">
                  Vui lòng đăng nhập tài khoản của bạn để cấu hình chức năng này.
                </p>
              </div>
            )}

            {/* Render Tab Components động */}
            {currentTab === 'profile' && user && (
              <ProfileTab user={user} showToast={showToast} />
            )}

            {currentTab === 'addresses' && user && (
              <AddressesTab user={user} showToast={showToast} />
            )}

            {currentTab === 'notifications' && user && (
              <NotificationsTab showToast={showToast} />
            )}

            {currentTab === 'security' && user && (
              <SecurityTab showToast={showToast} />
            )}

            {currentTab === 'appearance' && (
              <AppearanceTab theme={theme} toggleTheme={toggleTheme} showToast={showToast} />
            )}

            {currentTab === 'activity' && user && (
              <ActivityTab showToast={showToast} />
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
