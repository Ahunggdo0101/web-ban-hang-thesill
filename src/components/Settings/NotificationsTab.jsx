import React, { useState, useCallback } from 'react';
import { Save } from 'lucide-react';

const NotificationsTab = React.memo(function NotificationsTab({ showToast }) {
  const [notificationsForm, setNotificationsForm] = useState({
    orderUpdates: true,
    newsletter: false,
    smsAlerts: false,
    promoEmails: true
  });

  const handleInputChange = useCallback((e) => {
    const { name, checked } = e.target;
    setNotificationsForm(prev => ({ ...prev, [name]: checked }));
  }, []);

  const handleSaveNotifications = useCallback((e) => {
    e.preventDefault();
    if (showToast) {
      showToast('Cài đặt thông báo đã được lưu!', 'success');
    }
  }, [showToast]);

  return (
    <form onSubmit={handleSaveNotifications} className="space-y-6 max-w-xl text-left animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-brand-white border border-brand-sand">
          <input
            type="checkbox"
            name="orderUpdates"
            id="notify-orders"
            checked={notificationsForm.orderUpdates}
            onChange={handleInputChange}
            className="accent-brand-forest mt-1"
          />
          <div>
            <label htmlFor="notify-orders" className="text-xs font-bold text-brand-forest cursor-pointer block select-none">
              Cập nhật trạng thái đơn hàng
            </label>
            <p className="text-[10px] text-brand-slate mt-0.5 leading-relaxed font-semibold">
              Gửi email tự động thông báo khi đơn hàng đang được chuẩn bị, đang giao hoặc giao thành công.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-brand-white border border-brand-sand">
          <input
            type="checkbox"
            name="newsletter"
            id="notify-newsletter"
            checked={notificationsForm.newsletter}
            onChange={handleInputChange}
            className="accent-brand-forest mt-1"
          />
          <div>
            <label htmlFor="notify-newsletter" className="text-xs font-bold text-brand-forest cursor-pointer block select-none">
              Cẩm nang & Tin tức định kỳ (Newsletter)
            </label>
            <p className="text-[10px] text-brand-slate mt-0.5 leading-relaxed font-semibold">
              Nhận các bài viết hướng dẫn chăm sóc cây cảnh, mẹo thiết kế sân vườn từ chuyên gia hàng tuần.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-brand-white border border-brand-sand">
          <input
            type="checkbox"
            name="smsAlerts"
            id="notify-sms"
            checked={notificationsForm.smsAlerts}
            onChange={handleInputChange}
            className="accent-brand-forest mt-1"
          />
          <div>
            <label htmlFor="notify-sms" className="text-xs font-bold text-brand-forest cursor-pointer block select-none">
              Thông báo khẩn cấp qua SMS
            </label>
            <p className="text-[10px] text-brand-slate mt-0.5 leading-relaxed font-semibold">
              Chỉ gửi tin nhắn trong trường hợp có thay đổi khẩn cấp về việc giao đơn hàng.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-brand-white border border-brand-sand">
          <input
            type="checkbox"
            name="promoEmails"
            id="notify-promos"
            checked={notificationsForm.promoEmails}
            onChange={handleInputChange}
            className="accent-brand-forest mt-1"
          />
          <div>
            <label htmlFor="notify-promos" className="text-xs font-bold text-brand-forest cursor-pointer block select-none">
              Chương trình khuyến mãi & Tặng mã giảm giá
            </label>
            <p className="text-[10px] text-brand-slate mt-0.5 leading-relaxed font-semibold">
              Nhận các chương trình giảm giá kỷ niệm, các đợt flash sale đặc biệt toàn hệ thống.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="bg-brand-forest text-brand-cream hover:bg-brand-moss py-2.5 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2"
      >
        <Save size={12} /> Lưu tùy chọn
      </button>
    </form>
  );
});

export default NotificationsTab;
