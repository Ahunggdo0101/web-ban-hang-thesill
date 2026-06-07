import React, { useState, useCallback } from 'react';
import { Save } from 'lucide-react';

const AppearanceTab = React.memo(function AppearanceTab({ theme, toggleTheme, showToast }) {
  const [appearanceForm, setAppearanceForm] = useState({
    language: 'vi', // 'vi' | 'en'
    currency: 'vnd', // 'vnd' | 'usd'
    fontSize: 'medium' // 'small' | 'medium' | 'large'
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setAppearanceForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCurrencyChange = useCallback((val) => {
    setAppearanceForm(prev => ({ ...prev, currency: val }));
  }, []);

  const handleFontSizeChange = useCallback((size) => {
    setAppearanceForm(prev => ({ ...prev, fontSize: size }));
  }, []);

  const handleSaveAppearance = useCallback((e) => {
    e.preventDefault();
    if (showToast) {
      showToast('Đã áp dụng cấu hình giao diện & hiển thị!', 'success');
    }
  }, [showToast]);

  return (
    <form onSubmit={handleSaveAppearance} className="space-y-6 max-w-xl text-left animate-fade-in font-sans">
      {/* 1. Giao diện sáng tối */}
      <div className="space-y-2">
        <span className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Chế độ giao diện (Theme)
        </span>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex-1 border p-4 text-center cursor-pointer transition-all ${
              theme === 'light'
                ? 'bg-brand-white border-brand-forest text-brand-forest font-bold ring-1 ring-brand-forest'
                : 'bg-brand-white/40 border-brand-sand text-brand-charcoal hover:border-brand-forest'
            }`}
          >
            <span className="block text-xs">Light Mode ☀️</span>
          </button>
          <button
            type="button"
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`flex-1 border p-4 text-center cursor-pointer transition-all ${
              theme === 'dark'
                ? 'bg-brand-white border-brand-forest text-brand-forest font-bold ring-1 ring-brand-forest'
                : 'bg-brand-white/40 border-brand-sand text-brand-charcoal hover:border-brand-forest'
            }`}
          >
            <span className="block text-xs">Dark Mode 🌙</span>
          </button>
        </div>
      </div>

      {/* 2. Ngôn ngữ hiển thị */}
      <div className="space-y-2">
        <span className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Ngôn ngữ mặc định
        </span>
        <select
          name="language"
          value={appearanceForm.language}
          onChange={handleInputChange}
          className="w-full bg-white border border-brand-sand p-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-forest"
        >
          <option value="vi">Tiếng Việt (Việt Nam)</option>
          <option value="en">English (US)</option>
        </select>
      </div>

      {/* 3. Đơn vị tiền tệ */}
      <div className="space-y-2">
        <span className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Đơn vị hiển thị tiền tệ
        </span>
        <div className="flex gap-4">
          <label className="flex-1 flex items-center justify-between border border-brand-sand bg-white p-3.5 cursor-pointer text-xs select-none">
            <span className="font-semibold text-brand-forest">Việt Nam Đồng (đ)</span>
            <input
              type="radio"
              name="currency-select"
              checked={appearanceForm.currency === 'vnd'}
              onChange={() => handleCurrencyChange('vnd')}
              className="accent-brand-forest"
            />
          </label>
          <label className="flex-1 flex items-center justify-between border border-brand-sand bg-white p-3.5 cursor-pointer text-xs select-none">
            <span className="font-semibold text-brand-forest">Đô la Mỹ ($)</span>
            <input
              type="radio"
              name="currency-select"
              checked={appearanceForm.currency === 'usd'}
              onChange={() => handleCurrencyChange('usd')}
              className="accent-brand-forest"
            />
          </label>
        </div>
      </div>

      {/* 4. Cỡ chữ */}
      <div className="space-y-2">
        <span className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
          Cỡ chữ trang E-commerce
        </span>
        <div className="flex gap-2">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleFontSizeChange(size)}
              className={`flex-1 py-2 text-center text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                appearanceForm.fontSize === size
                  ? 'bg-brand-forest text-brand-cream border-brand-forest'
                  : 'bg-white border-brand-sand text-[#666] hover:border-brand-forest'
              }`}
            >
              {size === 'small' ? 'Nhỏ' : size === 'medium' ? 'Vừa' : 'Lớn'}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="bg-brand-forest text-brand-cream hover:bg-brand-moss py-2.5 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2"
      >
        <Save size={12} /> Áp dụng cấu hình
      </button>
    </form>
  );
});

export default AppearanceTab;
