import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function ContactPage() {
  useDocumentTitle('Liên Hệ');
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'support',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra validation đơn giản
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    // Mock gửi thành công
    setSubmitted(true);
    showToast('Đã gửi tin nhắn!', 'success');
    setFormData({
      name: '',
      email: '',
      subject: 'support',
      message: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in bg-brand-cream text-brand-forest">
      
      {/* Tiêu đề trang theo style premium */}
      <div className="text-left border-b border-brand-sand pb-10 mb-14">
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
          Liên hệ với chúng tôi
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-brand-forest font-light mt-2">
          Kết nối với Cây Cảnh Nam Định
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate max-w-xl mt-3 leading-relaxed font-medium">
          Bạn có câu hỏi về việc chăm sóc cây cảnh, đơn hàng hay muốn hợp tác? Hãy gửi lời nhắn, chúng tôi luôn ở đây để đồng hành cùng bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Cột trái: Thông tin liên hệ (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand-white border border-brand-sand p-8 space-y-8 shadow-sm">
            <h3 className="font-serif text-xl font-medium text-brand-forest border-b border-brand-sand/60 pb-4">
              Thông tin cửa hàng
            </h3>

            <div className="space-y-6 text-left">
              {/* Địa chỉ */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center shrink-0 text-brand-forest">
                  <MapPin size={18} className="stroke-1.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase tracking-wider text-brand-clay font-bold">Địa chỉ showroom</h4>
                  <p className="text-xs text-brand-slate font-semibold leading-relaxed">
                    Số 150 Điện Biên, Cửa Bắc, TP. Nam Định
                  </p>
                </div>
              </div>

              {/* Điện thoại */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center shrink-0 text-brand-forest">
                  <Phone size={18} className="stroke-1.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase tracking-wider text-brand-clay font-bold">Số điện thoại hotline</h4>
                  <p className="text-xs text-brand-slate font-semibold">
                    1900 8888 (Tư vấn miễn phí)
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center shrink-0 text-brand-forest">
                  <Mail size={18} className="stroke-1.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase tracking-wider text-brand-clay font-bold">Email hỗ trợ</h4>
                  <p className="text-xs text-brand-slate font-semibold">
                    support@caycanhnamdinh.vn
                  </p>
                </div>
              </div>

              {/* Giờ làm việc */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center shrink-0 text-brand-forest">
                  <Clock size={18} className="stroke-1.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase tracking-wider text-brand-clay font-bold">Giờ làm việc</h4>
                  <p className="text-xs text-brand-slate font-semibold leading-relaxed">
                    Thứ Hai - Chủ Nhật | 08:00 - 21:30 <br />
                    (Kể cả các ngày lễ Tết)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Form liên hệ (7 columns) */}
        <div className="lg:col-span-7">
          {submitted ? (
            <div className="bg-brand-white border border-brand-sand p-10 text-center space-y-6 shadow-sm animate-fade-in">
              <div className="w-16 h-16 bg-[#f4f7f6] border border-brand-sand rounded-full flex items-center justify-center mx-auto text-brand-forest">
                <CheckCircle2 size={32} className="stroke-1.5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-brand-forest font-light">Đã gửi tin nhắn thành công!</h3>
                <p className="text-xs text-brand-slate max-w-sm mx-auto leading-relaxed font-semibold">
                  Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn của bạn và đội ngũ tư vấn sẽ phản hồi trong vòng 24 giờ làm việc.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-brand-forest text-brand-cream text-[10px] font-bold uppercase tracking-widest px-8 py-3.5 hover:bg-brand-green transition-colors cursor-pointer"
              >
                Gửi một lời nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-brand-white border border-brand-sand p-8 sm:p-10 shadow-sm space-y-6 text-left">
              <h3 className="font-serif text-xl font-medium text-brand-forest border-b border-brand-sand/60 pb-4">
                Gửi lời nhắn cho chúng tôi
              </h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-none font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Họ tên */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#555] block">Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="VD: Nguyễn Văn A"
                    required
                    className="w-full bg-brand-cream border border-brand-sand text-brand-charcoal text-xs p-3 focus:outline-none focus:border-brand-forest font-semibold"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#555] block">Địa chỉ Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="VD: email@domain.com"
                    required
                    className="w-full bg-brand-cream border border-brand-sand text-brand-charcoal text-xs p-3 focus:outline-none focus:border-brand-forest font-semibold"
                  />
                </div>
              </div>

              {/* Chủ đề */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#555] block">Bạn cần hỗ trợ về chủ đề gì?</label>
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-brand-cream border border-brand-sand text-brand-charcoal text-xs p-3 pr-10 focus:outline-none focus:border-brand-forest font-semibold appearance-none rounded-none cursor-pointer"
                  >
                    <option value="support">Hỗ trợ đặt hàng & Sản phẩm</option>
                    <option value="partnership">Hợp tác kinh doanh & Truyền thông</option>
                    <option value="feedback">Góp ý & Khiếu nại dịch vụ</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-forest">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tin nhắn */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#555] block">Nội dung tin nhắn *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Hãy viết nội dung yêu cầu của bạn tại đây..."
                  rows={5}
                  required
                  className="w-full bg-brand-cream border border-brand-sand text-brand-charcoal text-xs p-3 focus:outline-none focus:border-brand-forest font-semibold resize-none"
                />
              </div>

              {/* Nút gửi */}
              <button
                type="submit"
                className="bg-brand-forest hover:bg-brand-green text-brand-cream text-[10px] font-bold uppercase tracking-widest py-4 hover:bg-brand-green transition-colors cursor-pointer w-full text-center flex items-center justify-center gap-2"
              >
                Gửi tin nhắn <Send size={11} />
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Google Maps nhúng showroom */}
      <div className="mt-20 border border-brand-sand bg-brand-white p-3 shadow-xs">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.156100984852!2d106.17516831487856!3d20.43265888682496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135e0be67ee35ab%3A0xb35a0cf07c3be4cf!2zMTUwIMSQaeG7h24gQmnDqm4sIEPhu61hIELhuq9jLCBUUC4gTmFtIMSQ4buLbmgsIE5hbSDEkOG7i25oLCBWaWV0bmFt!5e0!3m2!1svi!2s!4v1680000000000!5m2!1svi!2s"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Maps Showroom Cây Cảnh Nam Định"
        />
      </div>

    </div>
  );
}
