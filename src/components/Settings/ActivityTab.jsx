import React, { useState, useCallback } from 'react';

const ActivityTab = React.memo(function ActivityTab({ showToast }) {
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, time: '2026-06-07 22:45', action: 'Đăng nhập vào hệ thống', device: 'Chrome - macOS' },
    { id: 2, time: '2026-06-07 15:30', action: 'Thêm sản phẩm vào Giỏ hàng', device: 'Safari - iPhone' },
    { id: 3, time: '2026-06-06 09:12', action: 'Đặt hàng đơn hàng #TS-9A82D1', device: 'Chrome - macOS' }
  ]);

  const handleRefreshLogs = useCallback(() => {
    setActivityLogs(prev => [
      { id: Date.now(), time: new Date().toISOString().replace('T', ' ').slice(0, 16), action: 'Làm mới lịch sử nhật ký', device: 'Chrome - macOS' },
      ...prev
    ]);
    if (showToast) {
      showToast('Đã làm mới danh sách nhật ký hoạt động.', 'success');
    }
  }, [showToast]);

  return (
    <div className="space-y-4 text-left animate-fade-in font-sans">
      <div className="border border-brand-sand bg-brand-white divide-y divide-brand-sand shadow-xs">
        {activityLogs.map((log) => (
          <div key={log.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <div>
              <p className="font-semibold text-brand-forest">{log.action}</p>
              <p className="text-[10px] text-[#888] mt-0.5">Thiết bị: {log.device}</p>
            </div>
            <span className="text-[10px] text-brand-clay font-bold font-mono bg-brand-cream px-2 py-1 border border-brand-sand/50 rounded-sm">
              {log.time}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleRefreshLogs}
        className="border border-brand-sand hover:bg-gray-50 text-brand-charcoal text-[9px] font-bold uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer"
      >
        Làm mới nhật ký
      </button>
    </div>
  );
});

export default ActivityTab;
