import { useState, useEffect, useCallback } from 'react';
import {
  Save, Loader2, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon,
  ExternalLink, Edit, Check, X, FileText, ChevronRight, Menu as MenuIcon, HelpCircle
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { Toast } from './shared';
import MediaPickerModal from './MediaPickerModal';

const API = API_BASE_URL;

// Danh sách các tùy chọn đường dẫn thân thiện (không cần biết lập trình)
const LINK_TEMPLATES = [
  { label: 'Cửa hàng (Tất cả cây)', value: '/shop' },
  { label: 'Bộ sưu tập Cây Cỡ Lớn', value: '/collections/large-plants' },
  { label: 'Trang chủ', value: '/' },
  { label: 'Cây dễ chăm sóc (Lọc)', value: '/shop?difficulty=easy' },
  { label: 'Cây cần ít ánh sáng (Lọc)', value: '/shop?light=low' },
  { label: 'Cây an toàn cho thú cưng (Lọc)', value: '/shop?pet=true' },
  { label: 'Cây bán chạy (Lọc)', value: '/shop?sort=rating' },
  { label: 'Trắc nghiệm chọn cây', value: '/quiz' },
  { label: 'Trang Blog / Tin tức', value: '/journal' },
  { label: 'Trang Liên hệ', value: '/contact' },
  { label: 'Tùy chọn (Nhập URL thủ công)', value: 'custom' }
];

// Danh sách các style màu sắc định nghĩa sẵn
const STYLE_TEMPLATES = [
  { label: 'Mặc định (Chữ xám thanh lịch)', value: 'text-[#666] hover:text-brand-forest' },
  { label: 'Khuyến mãi / Giảm giá (Chữ đỏ nổi bật)', value: 'text-red-600 hover:text-red-800' },
  { label: 'Đặc biệt (Chữ xanh lá thương hiệu)', value: 'text-brand-forest hover:text-brand-clay' }
];

function ImagePreview({ url, alt, size = 'sm' }) {
  const cls = size === 'sm' ? 'w-10 h-10' : 'w-16 h-20';
  if (!url) {
    return (
      <div className={`${cls} bg-brand-cream border border-dashed border-brand-sand flex items-center justify-center shrink-0 rounded`}>
        <ImageIcon size={12} className="text-[#bbb]" />
      </div>
    );
  }
  return (
    <div className={`${cls} border border-brand-sand overflow-hidden shrink-0 bg-brand-cream rounded`}>
      <img src={url} alt={alt} className="w-full h-full object-cover" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
    </div>
  );
}

// Bộ chọn liên kết thân thiện
function LinkSelector({ value, onChange }) {
  // Tìm xem giá trị hiện tại có khớp với mẫu nào không
  const matchedTemplate = LINK_TEMPLATES.find(t => t.value === value);
  const selectValue = matchedTemplate ? value : 'custom';
  const customValue = selectValue === 'custom' ? value : '';

  return (
    <div className="space-y-1.5">
      <label className="text-[9px] uppercase tracking-wider text-brand-slate block font-bold">Liên kết đến trang</label>
      <select
        value={selectValue}
        onChange={e => {
          const val = e.target.value;
          if (val !== 'custom') {
            onChange(val);
          } else {
            onChange('');
          }
        }}
        className="w-full bg-white border border-brand-sand text-[11px] py-1.5 px-2 focus:outline-none focus:border-brand-forest cursor-pointer rounded"
      >
        {LINK_TEMPLATES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      
      {selectValue === 'custom' && (
        <input
          type="text"
          value={customValue}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white border border-brand-sand text-[10px] py-1 px-2 focus:outline-none focus:border-brand-forest font-mono text-[#666] rounded"
          placeholder="Nhập đường dẫn thủ công (e.g. /my-custom-page)"
        />
      )}
    </div>
  );
}

export default function MenuTab({ fetchWithAuth }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Tab hiện tại đang được chọn để cấu hình MegaMenu con
  const [activeTabIdx, setActiveTabIdx] = useState(null);

  // Media picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCallback, setPickerCallback] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Mở Media Picker
  const openPicker = useCallback((onSelectFn) => {
    setPickerCallback(() => onSelectFn);
    setPickerOpen(true);
  }, []);

  // Fetch cấu hình menu từ API
  const loadMenuConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/menu-config`);
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data || []);
        // Chọn tab đầu tiên có menu con làm active mặc định
        if (data && data.length > 0) {
          const firstMenuIdx = data.findIndex(item => item.hasMenu);
          if (firstMenuIdx !== -1) {
            setActiveTabIdx(firstMenuIdx);
          }
        }
      }
    } catch (e) {
      console.error('Lỗi tải cấu hình menu:', e);
      showToast('Không thể tải cấu hình menu', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMenuConfig();
  }, [loadMenuConfig]);

  // Lưu cấu hình menu lên server
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`${API}/menu-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItems),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi lưu cấu hình menu');
      }
      showToast('Đã lưu cấu hình MegaMenu thành công!');
    } catch (err) {
      showToast(err.message || 'Không thể lưu cấu hình', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── CRUD Tab chính ─────────────────────────────────────────────────────────
  const addTab = () => {
    const newTab = {
      title: 'Danh mục mới',
      color: 'text-[#666] hover:text-brand-forest',
      hasMenu: false,
      view: '/shop'
    };
    setMenuItems([...menuItems, newTab]);
  };

  const removeTab = (idx) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các liên kết con đi kèm sẽ bị xóa.')) {
      const updated = menuItems.filter((_, i) => i !== idx);
      setMenuItems(updated);
      if (activeTabIdx === idx) {
        setActiveTabIdx(null);
      } else if (activeTabIdx > idx) {
        setActiveTabIdx(activeTabIdx - 1);
      }
    }
  };

  const moveTab = (idx, direction) => {
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= menuItems.length) return;
    const updated = [...menuItems];
    const temp = updated[idx];
    updated[idx] = updated[nextIdx];
    updated[nextIdx] = temp;
    setMenuItems(updated);

    if (activeTabIdx === idx) {
      setActiveTabIdx(nextIdx);
    } else if (activeTabIdx === nextIdx) {
      setActiveTabIdx(idx);
    }
  };

  const updateTabField = (idx, field, val) => {
    setMenuItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: val };
      // Nếu bật hasMenu nhưng chưa có menuData, tự động khởi tạo menuData trống
      if (field === 'hasMenu' && val && !item.menuData) {
        updated.menuData = { links: [], cards: [] };
      }
      return updated;
    }));
  };

  // ─── CRUD Links con ──────────────────────────────────────────────────────────
  const addSubLink = (tabIdx) => {
    setMenuItems(prev => prev.map((item, i) => {
      if (i !== tabIdx) return item;
      const menuData = item.menuData ? { ...item.menuData } : { links: [], cards: [] };
      menuData.links = [...(menuData.links || []), { name: 'Liên kết mới', href: '/shop' }];
      return { ...item, menuData };
    }));
  };

  const removeSubLink = (tabIdx, linkIdx) => {
    setMenuItems(prev => prev.map((item, i) => {
      if (i !== tabIdx) return item;
      const menuData = { ...item.menuData };
      menuData.links = menuData.links.filter((_, li) => li !== linkIdx);
      return { ...item, menuData };
    }));
  };

  const updateSubLinkField = (tabIdx, linkIdx, field, val) => {
    setMenuItems(prev => prev.map((item, i) => {
      if (i !== tabIdx) return item;
      const menuData = { ...item.menuData };
      menuData.links = menuData.links.map((link, li) => 
        li === linkIdx ? { ...link, [field]: val } : link
      );
      return { ...item, menuData };
    }));
  };

  const moveSubLink = (tabIdx, linkIdx, direction) => {
    const nextIdx = linkIdx + direction;
    setMenuItems(prev => prev.map((item, i) => {
      if (i !== tabIdx) return item;
      const menuData = { ...item.menuData };
      if (nextIdx < 0 || nextIdx >= menuData.links.length) return item;
      const updatedLinks = [...menuData.links];
      const temp = updatedLinks[linkIdx];
      updatedLinks[linkIdx] = updatedLinks[nextIdx];
      updatedLinks[nextIdx] = temp;
      menuData.links = updatedLinks;
      return { ...item, menuData };
    }));
  };

  // ─── CRUD Cards ảnh ─────────────────────────────────────────────────────────
  const addCard = (tabIdx) => {
    setMenuItems(prev => prev.map((item, i) => {
      if (i !== tabIdx) return item;
      const menuData = item.menuData ? { ...item.menuData } : { links: [], cards: [] };
      if ((menuData.cards || []).length >= 3) {
        showToast('Chỉ nên có tối đa 3 card ảnh để vừa vặn layout MegaMenu!', 'error');
        return item;
      }
      menuData.cards = [...(menuData.cards || []), { title: 'Card Mới', image: '', href: '/shop' }];
      return { ...item, menuData };
    }));
  };

  const removeCard = (tabIdx, cardIdx) => {
    setMenuItems(prev => prev.map((item, i) => {
      if (i !== tabIdx) return item;
      const menuData = { ...item.menuData };
      menuData.cards = menuData.cards.filter((_, ci) => ci !== cardIdx);
      return { ...item, menuData };
    }));
  };

  const updateCardField = (tabIdx, cardIdx, field, val) => {
    setMenuItems(prev => prev.map((item, i) => {
      if (i !== tabIdx) return item;
      const menuData = { ...item.menuData };
      menuData.cards = menuData.cards.map((card, ci) => 
        ci === cardIdx ? { ...card, [field]: val } : card
      );
      return { ...item, menuData };
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-forest" size={28} />
        <span className="ml-3 text-brand-sage text-sm">Đang tải cấu hình menu...</span>
      </div>
    );
  }

  const activeTab = activeTabIdx !== null ? menuItems[activeTabIdx] : null;

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={url => {
          if (pickerCallback) pickerCallback(url);
          setPickerOpen(false);
        }}
      />

      {/* Action Header */}
      <div className="flex justify-between items-center bg-white p-4 border border-brand-sand/60 rounded">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-forest">Cấu hình Menu bán hàng</h2>
          <p className="text-[11px] text-[#888] mt-0.5">Tùy biến thanh menu chính (Header) và menu con MegaMenu một cách đơn giản, trực quan.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-brand-forest text-brand-cream hover:bg-brand-forest/90 text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50 transition-colors"
        >
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Lưu cấu hình
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Cột 1: Danh sách các Tab chính (xl:col-span-5) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white border border-brand-sand/60 p-4 space-y-4 rounded">
            <div className="flex justify-between items-center pb-2 border-b border-brand-sand/50">
              <span className="text-xs font-bold text-brand-forest uppercase tracking-widest">Thanh điều hướng chính</span>
              <button
                onClick={addTab}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-forest hover:text-brand-clay cursor-pointer"
              >
                <Plus size={12} />
                Thêm danh mục
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {menuItems.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    if (item.hasMenu) setActiveTabIdx(idx);
                  }}
                  className={`p-3 border transition-all rounded cursor-pointer ${
                    activeTabIdx === idx 
                      ? 'border-brand-forest bg-brand-cream/20 shadow-xs' 
                      : 'border-brand-sand/50 hover:border-brand-sand bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#aaa]">#{idx + 1}</span>
                        <input
                          type="text"
                          value={item.title}
                          onChange={e => updateTabField(idx, 'title', e.target.value)}
                          className="bg-transparent border-b border-transparent focus:border-brand-forest font-bold text-xs text-brand-forest focus:outline-none py-0.5"
                          placeholder="Tên danh mục (ví dụ: Cây Trong Nhà)"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      
                      <div className="space-y-2.5" onClick={e => e.stopPropagation()}>
                        {/* Cấu hình link đơn giản */}
                        <LinkSelector
                          value={item.view || ''}
                          onChange={val => updateTabField(idx, 'view', val)}
                        />

                        {/* Cấu hình style màu sắc đơn giản */}
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-brand-slate block font-bold">Màu sắc hiển thị</label>
                          <select
                            value={item.color || 'text-[#666] hover:text-brand-forest'}
                            onChange={e => updateTabField(idx, 'color', e.target.value)}
                            className="w-full bg-white border border-brand-sand text-[11px] py-1.5 px-2 focus:outline-none focus:border-brand-forest cursor-pointer rounded"
                          >
                            {STYLE_TEMPLATES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-1" onClick={e => e.stopPropagation()}>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">
                          <input
                            type="checkbox"
                            checked={item.hasMenu || false}
                            onChange={e => {
                              updateTabField(idx, 'hasMenu', e.target.checked);
                              if (e.target.checked) setActiveTabIdx(idx);
                            }}
                            className="rounded text-brand-forest focus:ring-brand-forest"
                          />
                          Có chứa Menu con (MegaMenu)
                        </label>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-0.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveTab(idx, -1)}
                          className="p-1 hover:bg-brand-cream text-brand-sage hover:text-brand-forest disabled:opacity-30 cursor-pointer rounded"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          disabled={idx === menuItems.length - 1}
                          onClick={() => moveTab(idx, 1)}
                          className="p-1 hover:bg-brand-cream text-brand-sage hover:text-brand-forest disabled:opacity-30 cursor-pointer rounded"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          onClick={() => removeTab(idx)}
                          className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {item.hasMenu && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-brand-clay bg-brand-clay/10 px-1.5 py-0.5 mt-2 rounded flex items-center gap-1">
                          <MenuIcon size={8} /> Click để sửa con
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột 2: Cấu hình MegaMenu con của Tab đang chọn (xl:col-span-7) */}
        <div className="xl:col-span-7">
          {activeTab ? (
            <div className="bg-white border border-brand-sand/60 p-5 space-y-6 rounded">
              
              {/* Tab Info Header */}
              <div className="flex items-center justify-between pb-3 border-b border-brand-sand/50">
                <div>
                  <h3 className="font-serif text-sm text-brand-forest font-medium">
                    Menu thả xuống của tab: <span className="underline font-bold">{activeTab.title}</span>
                  </h3>
                  <p className="text-[10px] text-[#888] mt-0.5">Tùy biến các liên kết con (bên trái) và 3 card hình ảnh giới thiệu (bên phải).</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-forest/15 text-brand-forest px-2 py-0.5 rounded">
                  Menu thả xuống
                </span>
              </div>

              {/* Grid Links & Cards */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* 1. Danh sách liên kết con bên trái (md:col-span-5) */}
                <div className="md:col-span-5 space-y-3">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-[10px] font-bold text-brand-forest uppercase tracking-widest">Liên kết danh mục con</span>
                    <button
                      onClick={() => addSubLink(activeTabIdx)}
                      className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-forest hover:text-brand-clay cursor-pointer"
                    >
                      <Plus size={10} /> Thêm Link
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {((activeTab.menuData?.links) || []).map((link, li) => (
                      <div key={li} className="p-2.5 bg-brand-cream/30 border border-brand-sand/50 rounded space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-[#aaa]">Mục #{li + 1}</span>
                          <div className="flex gap-0.5">
                            <button
                              disabled={li === 0}
                              onClick={() => moveSubLink(activeTabIdx, li, -1)}
                              className="p-0.5 hover:bg-brand-cream text-[#888] hover:text-brand-forest disabled:opacity-30 cursor-pointer rounded"
                            >
                              <ArrowUp size={10} />
                            </button>
                            <button
                              disabled={li === activeTab.menuData.links.length - 1}
                              onClick={() => moveSubLink(activeTabIdx, li, 1)}
                              className="p-0.5 hover:bg-brand-cream text-[#888] hover:text-brand-forest disabled:opacity-30 cursor-pointer rounded"
                            >
                              <ArrowDown size={10} />
                            </button>
                            <button
                              onClick={() => removeSubLink(activeTabIdx, li)}
                              className="p-0.5 hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer rounded"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={link.name}
                            onChange={e => updateSubLinkField(activeTabIdx, li, 'name', e.target.value)}
                            className="w-full bg-white border border-brand-sand text-[11px] py-1 px-2 focus:outline-none focus:border-brand-forest font-bold rounded"
                            placeholder="Tên hiển thị (ví dụ: Lựa chọn hàng đầu)"
                          />
                          <LinkSelector
                            value={link.href || ''}
                            onChange={val => updateSubLinkField(activeTabIdx, li, 'href', val)}
                          />
                        </div>
                      </div>
                    ))}
                    {((activeTab.menuData?.links) || []).length === 0 && (
                      <div className="text-center py-6 text-[10px] text-[#aaa] italic border border-dashed border-brand-sand rounded">
                        Chưa có liên kết con nào.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Cấu hình 3 Cards ảnh bên phải (md:col-span-7) */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-[10px] font-bold text-brand-forest uppercase tracking-widest">Card ảnh nổi bật (Tối đa 3)</span>
                    <button
                      disabled={((activeTab.menuData?.cards) || []).length >= 3}
                      onClick={() => addCard(activeTabIdx)}
                      className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-forest hover:text-brand-clay cursor-pointer disabled:opacity-40"
                    >
                      <Plus size={10} /> Thêm Card
                    </button>
                  </div>

                  <div className="space-y-4">
                    {((activeTab.menuData?.cards) || []).map((card, ci) => (
                      <div key={ci} className="p-3 border border-brand-sand/60 rounded bg-white hover:border-brand-sand shadow-2xs space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-brand-forest uppercase tracking-wider bg-brand-cream px-2 py-0.5 rounded">
                            Ảnh banner #{ci + 1}
                          </span>
                          <button
                            onClick={() => removeCard(activeTabIdx, ci)}
                            className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 cursor-pointer rounded"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        <div className="flex gap-3">
                          {/* Khối chọn ảnh */}
                          <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <ImagePreview url={card.image} alt={card.title} size="md" />
                            <button
                              type="button"
                              onClick={() => openPicker(url => updateCardField(activeTabIdx, ci, 'image', url))}
                              className="text-[9px] font-bold uppercase tracking-wider text-brand-forest hover:underline cursor-pointer"
                            >
                              Chọn ảnh
                            </button>
                          </div>
                          
                          {/* Form thông tin card */}
                          <div className="flex-1 space-y-2">
                            <div>
                              <label className="text-[9px] uppercase tracking-wider text-brand-slate font-bold">Chữ hiển thị</label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={e => updateCardField(activeTabIdx, ci, 'title', e.target.value)}
                                className="w-full bg-brand-cream/30 border border-brand-sand text-[11px] py-1 px-2 focus:outline-none focus:border-brand-forest font-bold rounded"
                                placeholder="Tiêu đề banner (ví dụ: Quà Tặng Ý Nghĩa)"
                              />
                            </div>
                            
                            <LinkSelector
                              value={card.href || ''}
                              onChange={val => updateCardField(activeTabIdx, ci, 'href', val)}
                            />
                          </div>
                        </div>

                        {/* Link ảnh (Readonly hoặc cho sửa khi cần) */}
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-[#888] block">URL ảnh được chọn</label>
                          <input
                            type="text"
                            value={card.image || ''}
                            readOnly
                            onClick={e => e.target.select()}
                            className="w-full bg-brand-cream/10 border border-brand-sand text-[9px] py-0.5 px-2 text-[#aaa] font-mono select-all focus:outline-none rounded"
                            placeholder="Nhấn nút Chọn ảnh phía trên để chọn ảnh"
                          />
                        </div>
                      </div>
                    ))}

                    {((activeTab.menuData?.cards) || []).length === 0 && (
                      <div className="text-center py-10 text-[10px] text-[#aaa] italic border border-dashed border-brand-sand rounded">
                        Chưa có card ảnh nổi bật nào.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white border border-brand-sand/60 p-10 text-center rounded flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center text-brand-sage">
                <FileText size={20} />
              </div>
              <p className="text-xs font-bold text-brand-forest uppercase tracking-widest">Cấu hình chi tiết MegaMenu</p>
              <p className="text-[11px] text-[#888] max-w-sm">
                Vui lòng chọn một Danh mục chính bên trái có bật tính năng <strong>"Có chứa Menu con"</strong> để tùy chỉnh danh sách link con và các card ảnh quảng cáo.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
