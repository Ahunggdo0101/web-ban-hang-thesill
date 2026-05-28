import { Link } from 'react-router-dom';
import { MessageSquare, Phone, Mail } from 'lucide-react';

export default function ExpertAssistance() {
  return (
    <section className="relative overflow-hidden bg-[#f9f8f7] py-14 sm:py-16 md:py-20 border-y border-brand-sand/60">
      {/* Vệt chiếc lá màu xanh trang trí ở góc trái trên cùng */}
      <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#007b5f] fill-current -translate-x-6 -translate-y-6 rotate-[15deg]">
          <path d="M0,0 C30,25 55,20 75,0 C65,35 45,65 0,85 Z" />
        </svg>
      </div>

      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Cột trái: Văn bản giới thiệu */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="text-[11px] uppercase tracking-[0.15em] text-brand-slate font-bold block">
              Hãy nói chuyện với chuyên gia về cây trồng
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] text-[#2A2D24] font-normal leading-tight">
              Cần trợ giúp?
            </h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium max-w-md">
              Sự tin tưởng của bạn là ưu tiên hàng đầu của chúng tôi. Bạn không chắc loại cây nào phù hợp với ánh sáng của mình? Bạn mới bắt đầu làm vườn ngoài trời và cần lời khuyên? Hãy liên hệ with chúng tôi, chúng tôi luôn sẵn sàng hỗ trợ.
            </p>
          </div>

          {/* Cột phải: 3 Card liên hệ */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Card 1: Trò chuyện */}
            <Link 
              to="/contact"
              className="bg-brand-white border border-brand-sand/65 p-6 flex flex-col items-center text-center justify-center space-y-4 hover:border-brand-forest hover:shadow-xs transition-all duration-300 group min-h-[180px]"
            >
              <div className="text-brand-forest group-hover:scale-110 transition-transform duration-300">
                <MessageSquare size={24} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-forest transition-colors">
                  Trò chuyện
                </h3>
                <p className="text-xs text-brand-slate leading-relaxed font-medium">
                  Nhắn tin trực tiếp với chuyên gia chăm sóc cây trồng
                </p>
              </div>
            </Link>

            {/* Card 2: Gọi điện */}
            <a 
              href="tel:0988888888"
              className="bg-brand-white border border-brand-sand/65 p-6 flex flex-col items-center text-center justify-center space-y-4 hover:border-brand-forest hover:shadow-xs transition-all duration-300 group min-h-[180px]"
            >
              <div className="text-brand-forest group-hover:scale-110 transition-transform duration-300">
                <Phone size={24} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-forest transition-colors">
                  Gọi
                </h3>
                <p className="text-xs text-brand-slate leading-relaxed font-medium">
                  Trò chuyện trực tiếp với chuyên gia chăm sóc cây trồng
                </p>
              </div>
            </a>

            {/* Card 3: Email */}
            <a 
              href="mailto:info@thesill.com"
              className="bg-brand-white border border-brand-sand/65 p-6 flex flex-col items-center text-center justify-center space-y-4 hover:border-brand-forest hover:shadow-xs transition-all duration-300 group min-h-[180px]"
            >
              <div className="text-brand-forest group-hover:scale-110 transition-transform duration-300">
                <Mail size={24} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-forest transition-colors">
                  E-mail
                </h3>
                <p className="text-xs text-brand-slate leading-relaxed font-medium">
                  Hãy gửi thư đến địa chỉ info@thesill.com
                </p>
              </div>
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}
