import { useState, useEffect } from 'react';
import { optimizeUnsplashImage } from '../../utils/image';

export default function HappySlider({ happySlides }) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Tự động chuyển slide sau mỗi 5 giây
  useEffect(() => {
    if (!happySlides || happySlides.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % happySlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [happySlides]);

  if (!happySlides || happySlides.length === 0) return null;

  return (
    <section className="relative bg-white py-16 md:py-24 text-left overflow-hidden">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] space-y-10">
        
        {/* Tiêu đề */}
        <div className="space-y-2">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] text-[#2A2D24] font-normal tracking-tight">
            #CâyCảnhLàmChoMọiNgườiHạnhPhúc
          </h2>
          <p className="text-xs sm:text-sm text-brand-slate font-medium">
            Khách hàng của chúng tôi nói gì?
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-6xl mx-auto w-full">
          
          {/* Vùng chứa ảnh Slider */}
          <div className="w-full md:w-[78%] ml-auto aspect-[16/11] md:aspect-[21/9] overflow-hidden bg-brand-beige relative z-10 border border-brand-sand/30 shadow-xs">
            <div className="absolute inset-0 w-full h-full">
              {happySlides.map((slideImg, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                    index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={optimizeUnsplashImage(slideImg, 1200)}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Ô chữ màu trắng cố định đè giao thoa */}
          <div className="absolute left-4 md:left-0 top-1/2 -translate-y-1/2 w-[88%] sm:w-[60%] md:w-[420px] bg-white p-6 sm:p-8 md:p-12 shadow-xl z-20 border border-brand-sand/35">
            <div className="space-y-6 text-left">
              <p className="font-serif text-sm sm:text-base md:text-lg italic text-[#2A2D24] leading-relaxed">
                “Tôi đã đặt hàng nhiều lần và mỗi lần đều nhận được những cây khỏe mạnh và đẹp nhất một cách nhanh chóng. Tôi vô cùng hài lòng với The Sill.”
              </p>
              <div className="text-xs sm:text-sm font-semibold tracking-wider text-brand-slate uppercase">
                Kelsey, CA
              </div>
            </div>
          </div>

        </div>

        {/* Dots Indicator */}
        <div className="w-full md:w-[78%] ml-auto flex justify-center items-center gap-3 pt-4">
          {happySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === activeSlide 
                  ? 'bg-[#007b5f] scale-110' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
