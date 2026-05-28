import React from 'react';
import { Sparkles } from 'lucide-react';
import ProductSearchInput from './ProductSearchInput';

export default function TrendingSectionConfig({ trending, setTrending, showToast }) {
  return (
    <div className="bg-white border border-brand-sand/60 p-5 rounded space-y-4">
      <h3 className="font-serif text-sm text-brand-forest font-semibold flex items-center gap-1.5">
        <Sparkles size={14} className="text-brand-clay" /> Cấu hình Cây Đang Bán Chạy (Trending Section)
      </h3>
      <p className="text-[10px] text-[#888] -mt-2">Đây là mục hiển thị 4 sản phẩm bán chạy đề xuất ở phía dưới cùng trang bộ sưu tập của khách hàng.</p>
      
      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider font-bold text-brand-sage">Tiêu đề Section</label>
        <input
          type="text"
          value={trending.title}
          onChange={e => setTrending(prev => ({ ...prev, title: e.target.value }))}
          className="w-full max-w-xl bg-brand-cream/40 border border-brand-sand px-3 py-1.5 text-xs focus:outline-none focus:border-brand-forest font-bold rounded-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {trending.items.map((item, idx) => (
          <div key={idx} className="p-3 border border-brand-sand bg-brand-cream/10 rounded space-y-3 relative text-xs">
            <div className="text-[10px] font-bold text-brand-forest border-b border-brand-sand/50 pb-1.5">
              Vị trí sản phẩm #{idx + 1}
            </div>

            {/* Live Search sản phẩm từ DB */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-brand-slate font-semibold block">Gán sản phẩm từ database</label>
              <ProductSearchInput
                onSelect={(p) => {
                  setTrending(prev => {
                    const nextItems = [...prev.items];
                    nextItems[idx] = {
                      productId: p.id,
                      image: p.image || '',
                      title: p.name || '',
                      desc: p.description ? (p.description.length > 70 ? p.description.substring(0, 70) + '...' : p.description) : '',
                      price: p.price ? `Từ $${p.price}` : '',
                      badge: 'bestseller',
                      rating: p.rating ? Math.round(p.rating) : 5,
                      reviewsCount: p.reviewsCount || 0
                    };
                    return { ...prev, items: nextItems };
                  });
                  showToast(`Đã gán sản phẩm "${p.name}" vào Trending #${idx + 1}`);
                }}
              />
            </div>

            <div className="border-t border-brand-sand/40 pt-2.5 space-y-2">
              <div className="flex gap-2">
                <div className="w-12 h-14 bg-brand-cream border border-brand-sand shrink-0 overflow-hidden rounded-xs">
                  {item.image ? (
                    <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-[#aaa] italic">Ảnh</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <input
                    type="text"
                    placeholder="Tiêu đề hiển thị"
                    value={item.title}
                    onChange={e => {
                      const val = e.target.value;
                      setTrending(prev => {
                        const next = [...prev.items];
                        next[idx] = { ...next[idx], title: val };
                        return { ...prev, items: next };
                      });
                    }}
                    className="w-full bg-white border border-brand-sand px-1.5 py-0.5 text-[11px] focus:outline-none focus:border-brand-forest font-bold rounded-xs"
                  />
                  <input
                    type="text"
                    placeholder="Giá hiển thị (e.g. Từ $45)"
                    value={item.price}
                    onChange={e => {
                      const val = e.target.value;
                      setTrending(prev => {
                        const next = [...prev.items];
                        next[idx] = { ...next[idx], price: val };
                        return { ...prev, items: next };
                      });
                    }}
                    className="w-full bg-white border border-brand-sand px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-brand-forest rounded-xs"
                  />
                </div>
              </div>

              <textarea
                placeholder="Mô tả phụ ngắn"
                rows={2}
                value={item.desc}
                onChange={e => {
                  const val = e.target.value;
                  setTrending(prev => {
                    const next = [...prev.items];
                    next[idx] = { ...next[idx], desc: val };
                    return { ...prev, items: next };
                  });
                }}
                className="w-full bg-white border border-brand-sand px-1.5 py-1 text-[10px] focus:outline-none focus:border-brand-forest resize-none rounded-xs"
              />

              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Nhãn (e.g. sale)"
                  value={item.badge}
                  onChange={e => {
                    const val = e.target.value;
                    setTrending(prev => {
                      const next = [...prev.items];
                      next[idx] = { ...next[idx], badge: val };
                      return { ...prev, items: next };
                    });
                  }}
                  className="w-full bg-white border border-brand-sand px-1.5 py-0.5 text-[9px] focus:outline-none focus:border-brand-forest rounded-xs"
                />
                <input
                  type="number"
                  placeholder="Sao (1-5)"
                  min="0"
                  max="5"
                  value={item.rating}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 5;
                    setTrending(prev => {
                      const next = [...prev.items];
                      next[idx] = { ...next[idx], rating: val };
                      return { ...prev, items: next };
                    });
                  }}
                  className="w-full bg-white border border-brand-sand px-1.5 py-0.5 text-[9px] focus:outline-none focus:border-brand-forest rounded-xs font-bold"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
