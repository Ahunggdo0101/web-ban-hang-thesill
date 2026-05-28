import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { optimizeUnsplashImage } from '../../utils/image';

export default function ProductShowcase({ 
  title, 
  items = [], 
  viewAllPath = '', 
  viewAllText = '', 
  className = 'pt-10 md:pt-12' 
}) {
  return (
    <section className={`max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] space-y-10 ${className}`}>
      <div className="flex justify-between items-end">
        <div className="text-left">
          <h2 className="font-serif text-[26px] sm:text-[32px] md:text-[40px] text-[#2A2D24] font-normal leading-tight tracking-tight">
            {title}
          </h2>
        </div>
        {viewAllPath && viewAllText && (
          <Link 
            to={viewAllPath}
            className="font-serif text-xs sm:text-sm font-normal text-brand-forest hover:text-brand-green hover-underline inline-flex items-center gap-1 transition-colors pb-0.5"
          >
            {viewAllText} <span className="font-sans font-light">→</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {items.map((item, idx) => (
          <Link key={idx} to={item.path} className="group flex flex-col space-y-4 cursor-pointer">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-beige">
              {item.badge === 'bestseller' ? (
                <div className="absolute top-0 left-0 z-10 bg-[#00ced1] text-white text-[9px] font-bold px-2.5 py-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <Heart size={10} fill="white" className="text-white" />
                  Sản phẩm bán chạy nhất
                </div>
              ) : item.badge === 'sale' ? (
                <div className="absolute top-0 left-0 z-10 bg-[#e74c3c] text-white text-[9px] font-bold px-2.5 py-1.5 flex items-center gap-1 uppercase tracking-wider">
                  <Star size={10} fill="white" className="text-white" />
                  Ưu đãi đặc biệt nhân dịp kỷ niệm!
                </div>
              ) : null}
              <img
                src={optimizeUnsplashImage(item.image, 600)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </div>
            <div className="p-2.5 space-y-1 text-left">
              <h3 className="font-serif text-[18px] font-normal text-[#2A2D24] group-hover:text-brand-forest transition-colors leading-[1.8] tracking-[0.02em] truncate">
                {item.title}
              </h3>
              <p className="text-[12px] text-brand-slate italic font-sans truncate">{item.desc}</p>
              {item.rating > 0 ? (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <div className="flex text-brand-forest">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" className="text-brand-forest" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-brand-slate font-semibold">{item.reviewsCount}</span>
                </div>
              ) : (
                <div className="h-[18px]" />
              )}
              <p className="text-xs sm:text-sm font-bold text-brand-charcoal pt-0.5 flex items-center gap-2">
                <span className="text-brand-forest">{item.price}</span>
                {item.oldPrice && <span className="text-brand-slate/60 line-through font-normal text-xs">{item.oldPrice}</span>}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
