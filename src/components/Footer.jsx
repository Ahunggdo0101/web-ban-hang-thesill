import { useState, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ShieldCheck, Truck, RefreshCw, ArrowRight } from 'lucide-react';

const Footer = memo(function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#f9f8f7] text-brand-charcoal mt-auto border-t border-brand-sand">
      
      {/* 1. Trust Badges Section - Màu nền nhẹ nhàng, viền xám sáng */}
      <div className="border-b border-brand-sand/60 bg-[#f3f1ed]/50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-brand-sand/75 text-center">
          
          <div className="flex flex-col items-center p-6 space-y-3">
            <div className="p-3 bg-brand-white border border-brand-sand rounded-full shadow-xs">
              <Truck className="h-5 w-5 text-brand-forest" />
            </div>
            <h3 className="font-bold text-[10px] tracking-widest uppercase text-brand-forest">Giao hàng an toàn</h3>
            <p className="text-[11px] text-brand-slate max-w-xs leading-relaxed font-semibold">
              Hộp đóng gói chuyên dụng được cấp bằng sáng chế giúp bảo vệ bầu đất và tán lá nguyên vẹn 100%.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 space-y-3">
            <div className="p-3 bg-brand-white border border-brand-sand rounded-full shadow-xs">
              <ShieldCheck className="h-5 w-5 text-brand-forest" />
            </div>
            <h3 className="font-bold text-[10px] tracking-widest uppercase text-brand-forest">Bảo hành 30 ngày</h3>
            <p className="text-[11px] text-brand-slate max-w-xs leading-relaxed font-semibold">
              Hoàn toàn yên tâm với chính sách 1 đổi 1 hoặc hoàn tiền nếu cây gặp sự cố sức khỏe trong 30 ngày đầu.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 space-y-3">
            <div className="p-3 bg-brand-white border border-brand-sand rounded-full shadow-xs">
              <RefreshCw className="h-5 w-5 text-brand-forest" />
            </div>
            <h3 className="font-bold text-[10px] tracking-widest uppercase text-brand-forest">Hỗ trợ trọn đời</h3>
            <p className="text-[11px] text-brand-slate max-w-xs leading-relaxed font-semibold">
              Bất cứ khi nào cây của bạn bị vàng lá, hãy nhắn tin. Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ.
            </p>
          </div>

        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Newsletter Signup - Thiết kế tối giản tinh tế */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <h3 className="font-serif text-3xl font-light text-brand-forest leading-tight">
              Tham gia bản tin <br />
              <span className="italic font-normal text-brand-clay">Đỗ Xuân Hùng Garden Club</span>
            </h3>
            <p className="text-xs text-brand-slate leading-relaxed font-semibold">
              Nhận ngay mã giảm giá **10%** cho đơn hàng đầu tiên, cộng với các mẹo chăm sóc cây độc quyền hàng tuần.
            </p>
            {subscribed ? (
              <div className="bg-brand-cream border border-brand-sand text-brand-forest p-4 text-[10px] font-bold uppercase tracking-widest animate-fade-in">
                Cảm ơn bạn! Hãy kiểm tra hòm thư nhé. 🎉
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-3 pt-2">
                <div className="relative flex items-center border-b border-brand-sand focus-within:border-brand-forest transition-colors py-2">
                  <input
                     type="email"
                     placeholder="Nhập email của bạn..."
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     className="bg-transparent text-brand-charcoal placeholder-brand-slate/60 text-xs w-full focus:outline-none font-semibold tracking-wider pr-10"
                   />
                   <button
                     type="submit"
                     className="absolute right-0 text-brand-forest hover:text-brand-clay transition-colors p-1 cursor-pointer"
                     title="Đăng ký"
                   >
                     <ArrowRight size={16} />
                   </button>
                 </div>
               </form>
            )}
          </div>

          {/* Directory Links columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 text-left">
            <div className="space-y-4">
              <h4 className="font-serif text-base text-brand-forest font-medium border-b border-brand-sand pb-2">Mua Sắm</h4>
              <ul className="space-y-3 text-xs text-[#555] font-semibold tracking-wide">
                <li><button onClick={() => navigate('/shop')} className="hover:text-brand-forest transition-colors text-left cursor-pointer">Tất cả cây cảnh</button></li>
                <li><button onClick={() => navigate('/shop')} className="hover:text-brand-forest transition-colors text-left cursor-pointer font-medium text-brand-clay">Cây cảnh bán chạy nhất</button></li>
                <li><button onClick={() => navigate('/shop')} className="hover:text-brand-forest transition-colors text-left cursor-pointer">Chậu gốm nghệ thuật</button></li>
                <li><button onClick={() => navigate('/shop')} className="hover:text-brand-forest transition-colors text-left cursor-pointer">Dụng cụ & Đất trồng</button></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-serif text-base text-brand-forest font-medium border-b border-brand-sand pb-2">Tài Nguyên</h4>
              <ul className="space-y-3 text-xs text-[#555] font-semibold tracking-wide">
                <li><button onClick={() => navigate('/quiz')} className="hover:text-brand-forest transition-colors text-left cursor-pointer">Trắc nghiệm chọn cây</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-brand-forest transition-colors text-left cursor-pointer">Về chúng tôi</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-brand-forest transition-colors text-left cursor-pointer">Liên hệ</button></li>
                <li><Link to="/shipping" className="hover:text-brand-forest transition-colors block">Chính sách vận chuyển</Link></li>
              </ul>
            </div>

            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="font-serif text-base text-brand-forest font-medium border-b border-brand-sand pb-2">Hỗ Trợ</h4>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="hover:text-brand-forest text-brand-slate transition-colors" title="Instagram">
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/ohung.345374" target="_blank" rel="noopener noreferrer" className="hover:text-brand-forest text-brand-slate transition-colors" title="Facebook">
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-brand-forest text-brand-slate transition-colors" title="Twitter / X">
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                  </svg>
                </a>
              </div>
              <p className="text-[10px] text-brand-slate leading-relaxed font-semibold uppercase tracking-widest">
                Showroom: Số 150 Điện Biên, TP. Nam Định<br />
                Hotline: 0966337492<br />
                Email: dohungg0101@gmail.com
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-brand-sand mt-10 md:mt-20 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-brand-slate/75 font-bold uppercase tracking-widest space-y-4 md:space-y-0">
          <p>© 2026 Nghệ Nhân Cây Cảnh Đỗ Xuân Hùng. Bảo lưu mọi quyền tạo tác nghệ thuật.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-brand-forest transition-colors">Bảo mật</Link>
            <Link to="/shipping" className="hover:text-brand-forest transition-colors">Vận chuyển</Link>
            <Link to="/returns" className="hover:text-brand-forest transition-colors">Đổi trả</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
