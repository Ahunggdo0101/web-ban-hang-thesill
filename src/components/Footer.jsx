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
    <footer className="bg-brand-forest text-brand-cream mt-auto border-t border-brand-green">
      
      {/* 1. Trust Badges Section - Thin elegant borders */}
      <div className="border-b border-[#1A372C] bg-[#071710]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1A372C] text-center">
          
          <div className="flex flex-col items-center p-6 space-y-3">
            <div className="p-3 bg-brand-forest border border-[#1A372C]">
              <Truck className="h-5 w-5 text-brand-clay" />
            </div>
            <h3 className="font-bold text-[10px] tracking-widest uppercase text-brand-beige">Giao hàng an toàn</h3>
            <p className="text-[11px] text-brand-beige/60 max-w-xs leading-relaxed font-medium">
              Hộp đóng gói chuyên dụng được cấp bằng sáng chế giúp bảo vệ bầu đất và tán lá nguyên vẹn 100%.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 space-y-3">
            <div className="p-3 bg-brand-forest border border-[#1A372C]">
              <ShieldCheck className="h-5 w-5 text-brand-clay" />
            </div>
            <h3 className="font-bold text-[10px] tracking-widest uppercase text-brand-beige">Bảo hành 30 ngày</h3>
            <p className="text-[11px] text-brand-beige/60 max-w-xs leading-relaxed font-medium">
              Hoàn toàn yên tâm với chính sách 1 đổi 1 hoặc hoàn tiền nếu cây gặp sự cố sức khỏe trong 30 ngày đầu.
            </p>
          </div>

          <div className="flex flex-col items-center p-6 space-y-3">
            <div className="p-3 bg-brand-forest border border-[#1A372C]">
              <RefreshCw className="h-5 w-5 text-brand-clay" />
            </div>
            <h3 className="font-bold text-[10px] tracking-widest uppercase text-brand-beige">Hỗ trợ trọn đời</h3>
            <p className="text-[11px] text-brand-beige/60 max-w-xs leading-relaxed font-medium">
              Bất cứ khi nào cây của bạn bị vàng lá, hãy nhắn tin. Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ.
            </p>
          </div>

        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Newsletter Signup - Minimal & Premium design */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <h3 className="font-serif text-3xl font-light text-brand-white leading-tight">
              Tham gia bản tin <br />
              <span className="italic font-normal text-brand-clay">Đỗ Xuân Hùng Garden Club</span>
            </h3>
            <p className="text-xs text-brand-beige/70 leading-relaxed font-medium">
              Nhận ngay mã giảm giá **10%** cho đơn hàng đầu tiên, cộng với các mẹo chăm sóc cây độc quyền hàng tuần.
            </p>
            {subscribed ? (
              <div className="bg-[#123023] border border-[#20513C] text-brand-beige p-4 text-[10px] font-bold uppercase tracking-widest animate-fade-in">
                Cảm ơn bạn! Hãy kiểm tra hòm thư nhé. 🎉
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-3 pt-2">
                <div className="relative flex items-center border-b border-[#2A4B3E] focus-within:border-brand-clay transition-colors py-2">
                  <input
                     type="email"
                     placeholder="Nhập email của bạn..."
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     className="bg-transparent text-brand-cream placeholder-[#5F746C] text-xs w-full focus:outline-none font-semibold tracking-wider pr-10"
                   />
                   <button
                     type="submit"
                     className="absolute right-0 text-brand-beige hover:text-brand-clay transition-colors p-1 cursor-pointer"
                     title="Đăng ký"
                   >
                     <ArrowRight size={16} />
                   </button>
                 </div>
               </form>
            )}
          </div>

          {/* Directory Links columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12 text-left">
            <div className="space-y-4">
              <h4 className="font-serif text-base text-brand-white font-medium border-b border-[#1A372C] pb-2">Mua Sắm</h4>
              <ul className="space-y-3 text-xs text-brand-beige/60 font-semibold tracking-wide">
                <li><button onClick={() => navigate('/shop')} className="hover:text-brand-clay transition-colors text-left cursor-pointer">Tất cả cây cảnh</button></li>
                <li><button onClick={() => navigate('/shop')} className="hover:text-brand-clay transition-colors text-left cursor-pointer font-medium text-brand-clay/90">Cây cảnh bán chạy nhất</button></li>
                <li><button onClick={() => navigate('/shop')} className="hover:text-brand-clay transition-colors text-left cursor-pointer">Chậu gốm nghệ thuật</button></li>
                <li><button onClick={() => navigate('/shop')} className="hover:text-brand-clay transition-colors text-left cursor-pointer">Dụng cụ & Đất trồng</button></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-serif text-base text-brand-white font-medium border-b border-[#1A372C] pb-2">Tài Nguyên</h4>
              <ul className="space-y-3 text-xs text-brand-beige/60 font-semibold tracking-wide">
                <li><button onClick={() => navigate('/quiz')} className="hover:text-brand-clay transition-colors text-left cursor-pointer">Trắc nghiệm chọn cây</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-brand-clay transition-colors text-left cursor-pointer">Về chúng tôi</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-brand-clay transition-colors text-left cursor-pointer">Liên hệ</button></li>
                <li><Link to="/shipping" className="hover:text-brand-clay transition-colors block">Chính sách vận chuyển</Link></li>
              </ul>
            </div>

            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="font-serif text-base text-brand-white font-medium border-b border-[#1A372C] pb-2">Hỗ Trợ</h4>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="hover:text-brand-clay text-brand-beige/50 transition-colors" title="Instagram">
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-brand-clay text-brand-beige/50 transition-colors" title="Facebook">
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-brand-clay text-brand-beige/50 transition-colors" title="Twitter / X">
                  <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                  </svg>
                </a>
              </div>
              <p className="text-[10px] text-brand-beige/50 leading-relaxed font-semibold uppercase tracking-widest">
                Showroom: Số 150 Điện Biên, TP. Nam Định<br />
                Hotline: 1900 8888<br />
                Email: doxuanhung@caycanhnamdinh.vn
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-[#1A372C] mt-20 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-brand-beige/40 font-bold uppercase tracking-widest space-y-4 md:space-y-0">
          <p>© 2026 Cây Cảnh Đỗ Xuân Hùng. Giám tuyển nghệ thuật bởi Nghệ nhân Đỗ Xuân Hùng.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-brand-cream transition-colors">Bảo mật</Link>
            <Link to="/shipping" className="hover:text-brand-cream transition-colors">Vận chuyển</Link>
            <Link to="/returns" className="hover:text-brand-cream transition-colors">Đổi trả</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
