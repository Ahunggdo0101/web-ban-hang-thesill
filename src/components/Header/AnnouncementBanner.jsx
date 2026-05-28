import React from 'react';
import { Leaf } from 'lucide-react';

const AnnouncementBanner = React.memo(function AnnouncementBanner() {
  return (
    <div className="w-full bg-brand-forest text-brand-cream text-[10px] py-2.5 px-4 text-center font-semibold tracking-[0.15em] uppercase flex items-center justify-center space-x-2">
      <Leaf size={10} className="text-brand-clay animate-pulse flex-shrink-0" />
      <span>Freeship cho đơn từ 150.000đ • Bảo hành cây khỏe mạnh 30 ngày</span>
    </div>
  );
});

export default AnnouncementBanner;
