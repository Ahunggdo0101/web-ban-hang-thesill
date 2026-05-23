import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { optimizeUnsplashImage } from '../utils/image';

const MegaMenu = memo(function MegaMenu({ data }) {
  if (!data || !data.links || !data.cards) return null;

  return (
    <div className="fixed top-[163px] left-0 w-screen bg-brand-white border-b border-brand-sand shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-opacity will-change-transform transform-gpu translate-z-0 pointer-events-none group-hover:pointer-events-auto before:content-[''] before:absolute before:-top-6 before:left-0 before:right-0 before:h-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-5 gap-8">
        
        {/* Left column (20% - col-span-1) */}
        <div className="col-span-1 flex flex-col space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-sage">Danh Mục</h3>
          <ul className="space-y-3">
            {data.links.map((link, idx) => (
              <li key={idx}>
                <Link
                  to={link.href}
                  className="text-[11px] font-semibold text-[#666] hover:text-brand-forest transition-colors duration-200 block"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column (80% - col-span-4) */}
        <div className="col-span-4">
          <div className="grid grid-cols-3 gap-6">
            {data.cards.map((card, idx) => (
              <Link to={card.href} key={idx} className="group/card block overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden border border-brand-sand/50 bg-brand-cream">
                  <img
                    src={optimizeUnsplashImage(card.image, 300)}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-brand-forest">
                  <span className="font-serif text-xs font-semibold tracking-wide">{card.title}</span>
                  <ArrowRight size={14} className="transform group-hover/card:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
});

export default MegaMenu;
