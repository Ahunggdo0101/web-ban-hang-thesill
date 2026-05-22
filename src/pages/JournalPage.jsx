import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { journals } from '../data/journals';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function JournalPage() {
  useDocumentTitle('Nhật Ký Cây Xanh');
  const [selectedJournal, setSelectedJournal] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in bg-brand-cream text-brand-forest min-h-screen">
      
      {/* Tiêu đề trang theo style premium */}
      <div className="text-left border-b border-brand-sand pb-10 mb-14">
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
          Tài liệu & Kiến thức
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-brand-forest font-light mt-2">
          Tạp chí làm vườn
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate max-w-xl mt-3 leading-relaxed font-medium">
          Nơi chia sẻ các kiến thức chăm sóc cây trồng, cẩm nang chọn chậu và những mẹo nhỏ để kiến tạo không gian sống xanh mát bền vững.
        </p>
      </div>

      {/* Grid danh sách bài viết (2 cột Desktop, 1 cột Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 text-left">
        {journals.map((blog, idx) => (
          <div 
            key={idx} 
            className="group space-y-6 cursor-pointer border border-brand-sand/40 bg-brand-white p-6 transition-all hover:border-brand-forest shadow-xs"
            onClick={() => setSelectedJournal(blog)}
          >
            <div className="aspect-[16/10] w-full overflow-hidden bg-brand-beige border border-brand-sand relative">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-750 ease-out"
                loading="lazy"
              />
            </div>
            <div className="space-y-4">
              <span className="text-[9px] font-bold text-brand-clay tracking-widest uppercase block">
                {blog.num} . {blog.category}
              </span>
              <h3 className="font-serif text-2xl font-light text-brand-forest group-hover:text-brand-clay transition-colors leading-snug">
                {blog.title}
              </h3>
              <p className="text-xs text-brand-slate leading-relaxed font-medium line-clamp-3">
                {blog.desc}
              </p>
              <div className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-brand-forest hover-underline pt-2">
                Đọc thêm <ChevronRight size={12} className="ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Journal Detail Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-[#0a2315]/60 backdrop-blur-xs transition-opacity animate-fade-in" 
            onClick={() => setSelectedJournal(null)} 
            aria-hidden="true"
          />
          <div className="relative bg-brand-cream border border-brand-sand shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto z-10 animate-fade-in text-left">
            <button 
              onClick={() => setSelectedJournal(null)} 
              className="absolute right-4 top-4 p-2 text-brand-forest hover:text-brand-clay transition-colors cursor-pointer z-20 bg-brand-white/80 rounded-full border border-brand-sand/30"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
            
            <div className="w-full aspect-[16/9] overflow-hidden bg-brand-beige border-b border-brand-sand">
              <img 
                src={selectedJournal.image} 
                alt={selectedJournal.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-8 sm:p-10 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brand-clay tracking-widest uppercase block">
                  {selectedJournal.num} • {selectedJournal.category}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light leading-tight">
                  {selectedJournal.title}
                </h2>
              </div>
              
              <div className="text-sm text-brand-slate leading-relaxed font-medium whitespace-pre-line border-t border-brand-sand/50 pt-6">
                {selectedJournal.content}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
