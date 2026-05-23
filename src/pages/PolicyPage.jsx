import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function PolicyPage({ type }) {
  // Xác định tiêu đề và nội dung theo type chính sách
  let title = '';
  let content = null;

  switch (type) {
    case 'shipping':
      title = 'Chính Sách Vận Chuyển';
      content = (
        <div className="space-y-8">
          <p className="lead text-base sm:text-lg text-brand-slate italic font-medium">
            Tại Cây Cảnh Nam Định, chúng tôi hiểu rằng việc vận chuyển sinh vật sống yêu cầu sự chăm sóc và kỹ thuật đặc biệt. 
            Mỗi chậu cây gửi đi đều được đóng gói tỉ mỉ bằng giải pháp độc quyền để đảm bảo cây đến tay bạn luôn tươi tốt và khỏe mạnh.
          </p>
          
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-brand-forest font-light">1. Thời gian & Phạm vi giao hàng</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Chúng tôi giao hàng trên toàn quốc (Việt Nam). Thời gian chuẩn bị cây và vận chuyển thường dao động từ <strong>3 đến 7 ngày làm việc</strong> tùy thuộc vào khoảng cách địa lý.
              Đối với các khu vực nội thành Đà Nẵng, Hà Nội, và TP. Hồ Chí Minh, chúng tôi có dịch vụ giao hàng hỏa tốc trong vòng 24 giờ.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-brand-forest font-light">2. Chi phí vận chuyển</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Phí giao hàng tiêu chuẩn được tính dựa trên trọng lượng bầu đất và kích thước của chậu cây. 
              Đặc biệt, Cây Cảnh Nam Định áp dụng chương trình <strong>miễn phí vận chuyển tiêu chuẩn cho tất cả các đơn hàng từ 150.000đ trở lên</strong>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-brand-forest font-light">3. Quy cách đóng gói chuyên dụng</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Cây được cố định phần bầu đất bằng màng giữ ẩm phân hủy sinh học, đặt trong hộp carton 5 lớp cứng cáp được thiết kế riêng có các lỗ thông khí.
              Chậu gốm được bọc trong nhiều lớp xốp bong bóng khí để chống va đập tuyệt đối trong suốt quá trình trung chuyển.
            </p>
          </section>
        </div>
      );
      break;

    case 'returns':
      title = 'Chính Sách Đổi Trả & Hoàn Tiền';
      content = (
        <div className="space-y-8">
          <p className="lead text-base sm:text-lg text-brand-slate italic font-medium">
            Sự hài lòng của bạn và sức khỏe của cây xanh là ưu tiên hàng đầu của chúng tôi. 
            Mỗi đơn hàng tại Cây Cảnh Nam Định đều được bảo đảm bằng chính sách cam kết chất lượng vượt trội.
          </p>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-brand-forest font-light">1. Bảo hành sức khỏe cây trong 30 ngày</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Nếu cây của bạn gặp bất kỳ vấn đề nghiêm trọng nào về sức khỏe (héo úa, rụng sạch lá, thối rễ do vận chuyển) trong vòng <strong>30 ngày kể từ ngày nhận hàng</strong>, 
              Cây Cảnh Nam Định cam kết <strong>1 đổi 1 hoặc hoàn trả sản phẩm miễn phí</strong>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-brand-forest font-light">2. Điều kiện áp dụng đổi trả</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Yêu cầu đổi trả hợp lệ cần đi kèm hình ảnh chụp thực tế tình trạng cây khi mở hộp hoặc trong quá trình chăm sóc. 
              Chính sách bảo hành không áp dụng đối với các trường hợp cây hư hại do tưới quá nhiều nước hoặc đặt sai điều kiện ánh sáng khuyến nghị đi kèm.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-brand-forest font-light">3. Quy trình hoàn tiền</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Khi yêu cầu hoàn tiền được phê duyệt, số tiền sẽ được chuyển khoản lại vào tài khoản ngân hàng của quý khách trong vòng 5-7 ngày làm việc.
            </p>
          </section>
        </div>
      );
      break;

    case 'privacy':
      title = 'Chính Sách Bảo Mật Thông Tin';
      content = (
        <div className="space-y-8">
          <p className="lead text-base sm:text-lg text-brand-slate italic font-medium">
            Cây Cảnh Nam Định tôn trọng quyền riêng tư của khách hàng và cam kết bảo vệ tuyệt đối các dữ liệu cá nhân mà bạn đã tin tưởng chia sẻ với chúng tôi.
          </p>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-brand-forest font-light">1. Thu thập thông tin cá nhân</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Chúng tôi chỉ thu thập các thông tin cần thiết để xử lý đơn hàng và cải thiện dịch vụ, bao gồm: Họ tên, Email, Số điện thoại, Địa chỉ giao hàng và thông tin tài khoản mua hàng.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-brand-forest font-light">2. Sử dụng Cookie & Trải nghiệm người dùng</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Website sử dụng cookie để ghi nhớ các sản phẩm trong giỏ hàng, thông tin đăng nhập và phân tích hành vi duyệt web nhằm cá nhân hóa danh mục gợi ý cây xanh phù hợp với sở thích của bạn.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-brand-forest font-light">3. Bảo mật thanh toán trực tuyến</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Tất cả các giao dịch thanh toán bằng thẻ tín dụng tại Cây Cảnh Nam Định đều được mã hóa qua giao thức cổng thanh toán bảo mật chuẩn quốc tế. 
              Chúng tôi hoàn toàn không lưu trữ thông tin thẻ ngân hàng hoặc mã CVV của khách hàng trên hệ thống máy chủ nội bộ.
            </p>
          </section>
        </div>
      );
      break;

    default:
      title = 'Chính Sách Pháp Lý';
      content = <p className="text-sm text-brand-slate font-medium">Chính sách đang được cập nhật...</p>;
  }

  useDocumentTitle(title);

  return (
    <div className="bg-brand-cream text-brand-forest min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-left bg-brand-white border border-brand-sand p-8 sm:p-12 shadow-xs">
        <h1 className="font-serif text-4xl sm:text-5xl text-brand-forest font-light border-b border-brand-sand pb-6 mb-8">
          {title}
        </h1>
        <div className="prose prose-sm prose-green max-w-none">
          {content}
        </div>
      </div>
    </div>
  );
}
