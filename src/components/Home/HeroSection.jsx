import { Link } from 'react-router-dom';
import { optimizeUnsplashImage } from '../../utils/image';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-beige">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] py-20 md:py-28 grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
        
        <div className="md:col-span-6 space-y-8 text-left">
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
            NGHỆ NHÂN CÂY CẢNH ĐỖ XUÂN HÙNG • NAM ĐỊNH
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-brand-forest font-light leading-[1.08] tracking-tight">
            Nghệ nhân cây cảnh <br />
            <span className="italic text-brand-clay font-normal">Đỗ Xuân Hùng</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#555] leading-relaxed max-w-md font-medium">
            Kiến tạo tổ ấm xanh mát với các loài cây dễ chăm sóc được chọn lọc kỹ lưỡng, kết hợp cùng các dòng chậu gốm thủ công tinh xảo. Đóng gói chuyên nghiệp và vận chuyển trực tiếp đến cửa nhà bạn.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/shop"
              className="bg-brand-forest hover:bg-brand-green text-brand-white text-[10px] font-bold tracking-widest uppercase px-10 py-5 transition-all duration-300 shadow-sm cursor-pointer hover:-translate-y-0.5 inline-block text-center"
            >
              MUA SẮM NGAY
            </Link>
            <Link
              to="/quiz"
              className="border border-brand-forest bg-transparent hover:bg-brand-moss text-brand-forest text-[10px] font-bold tracking-widest uppercase px-10 py-5 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 inline-block text-center"
            >
              TRẮC NGHIỆM CHỌN CÂY
            </Link>
          </div>
        </div>

        <div className="md:col-span-6 relative flex justify-center">
          {/* Double framed image overlay */}
          <div className="relative w-full max-w-md aspect-[4/5] bg-brand-white p-4 border border-brand-sand shadow-xs">
            <div className="w-full h-full overflow-hidden border border-brand-sand bg-brand-beige">
              <img
                src={optimizeUnsplashImage("https://images.unsplash.com/photo-1585320806297-9794b3e4eeae", 800)}
                alt="Premium houseplants collection"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[3000ms] ease-out"
              />
            </div>
            {/* Decorative accent element */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border border-brand-sand bg-brand-cream/95 hidden sm:flex items-center justify-center p-3 text-center">
              <span className="font-serif text-[10px] italic text-brand-forest">100% Cây Khỏe Mạnh</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
