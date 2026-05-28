import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const API = API_BASE_URL;

export default function ProductSearchInput({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/products?search=${encodeURIComponent(query)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.items || []);
        }
      } catch (err) {
        console.error('Lỗi search sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 text-[#aaa]" size={13} />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm sản phẩm..."
          className="w-full bg-brand-cream/50 border border-brand-sand pl-8 pr-8 py-1.5 text-xs focus:outline-none focus:border-brand-forest placeholder:text-[#999] placeholder:italic"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-2.5 top-2 text-[#aaa] hover:text-brand-charcoal cursor-pointer flex items-center h-full"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && (query.trim() || loading) && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 bg-white border border-brand-sand shadow-lg max-h-60 overflow-y-auto z-50 divide-y divide-brand-sand/50">
            {loading ? (
              <div className="py-4 text-center text-xs text-[#888] flex items-center justify-center gap-2">
                <Loader2 size={12} className="animate-spin text-brand-forest" />
                Tìm kiếm...
              </div>
            ) : results.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#888] italic">
                Không tìm thấy sản phẩm
              </div>
            ) : (
              results.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-2 hover:bg-brand-cream/40 flex gap-2.5 items-center transition-colors cursor-pointer text-xs"
                >
                  <div className="w-8 h-8 bg-brand-cream border border-brand-sand overflow-hidden shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-brand-forest truncate">{p.name}</div>
                    <div className="text-[10px] text-[#888] truncate">{p.botanicalName || 'Sản phẩm'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-brand-charcoal">${p.price}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
