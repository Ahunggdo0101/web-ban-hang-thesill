import { memo } from 'react';
import { Link } from 'react-router-dom';
import { optimizeUnsplashImage } from '../utils/image';

const MegaMenu = memo(function MegaMenu({ data, parentTitle }) {
  if (!data || !data.links || !data.cards) return null;

  return (
    <div 
      className="absolute top-full left-0 w-full bg-[#f9f8f7] border-b border-[#2a2d24]/10 shadow-[0_15px_30px_rgba(0,0,0,0.02)] z-[999999] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all will-change-transform transform-gpu -translate-y-[15px] group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto before:content-[''] before:absolute before:-top-6 before:left-0 before:right-0 before:h-6 min-h-[250px]"
      style={{
        animationDuration: '0.001s',
        animationIterationCount: 1,
        animationTimingFunction: 'steps(1)',
        transitionDelay: '0.001s',
        transitionDuration: '0s, 0s, 0.001s',
        transitionProperty: 'transform, height, width',
        transitionTimingFunction: 'ease, ease, linear',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[30px] pb-[30px] flex justify-center gap-[60px] text-left">
        
        {/* Left Column - Cột danh sách link nhỏ nhắn, xinh xắn */}
        <div className="w-[160px] flex-shrink-0 flex flex-col">
          <h3 className="font-['Gill_Sans'] text-[18px] font-normal text-[#2a2d24] tracking-[0.3px] leading-[32.4px] mb-[15px]">
            {parentTitle || "Hàng Mới"}
          </h3>
          <ul className="space-y-[8px]">
            {data.links.map((link, idx) => (
              <li key={idx}>
                <Link
                  to={link.href}
                  className="text-[13px] text-[#2a2d24]/80 hover:text-brand-forest hover:underline transition-colors duration-200 block font-normal leading-[1.6]"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column - Cụm 3 Cards ảnh nhỏ nhắn, đặt sát nhau */}
        <div className="flex gap-[20px]">
          {data.cards.map((card, idx) => (
            <Link to={card.href} key={idx} className="group/card block w-[130px] flex-shrink-0 overflow-hidden">
              {/* Ảnh tỉ lệ 4:5 đứng nhỏ xinh */}
              <div className="relative w-[130px] h-[162px] overflow-hidden bg-brand-cream border border-[#2a2d24]/10">
                <img
                  src={optimizeUnsplashImage(card.image, 300)}
                  alt={card.title}
                  className="w-full h-full object-cover transform group-hover/card:scale-[1.03] transition-transform duration-500 ease-out"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {/* Tiêu đề in đậm nhỏ nhắn kèm mũi tên, hover gạch chân */}
              <div className="mt-2.5 text-left text-[#2a2d24]">
                <span className="font-sans text-[12.5px] font-bold tracking-wide group-hover/card:underline leading-tight block">
                  {card.title} &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
});

export default MegaMenu;


