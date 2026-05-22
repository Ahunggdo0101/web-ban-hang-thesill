import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

/**
 * GlobalErrorPage là chốt chặn cuối cùng (Error Boundary) để xử lý mọi lỗi xảy ra
 * trong quá trình định tuyến hoặc lỗi runtime UI của ứng dụng.
 */
export default function GlobalErrorPage() {
  const error = useRouteError();
  const is404 = error?.status === 404;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream text-center px-6 py-12">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        
        {/* Biểu tượng lỗi trực quan */}
        <div className="p-4 bg-brand-sand/30 rounded-full text-brand-clay animate-bounce">
          <AlertTriangle size={48} className="stroke-[1.5]" />
        </div>

        {/* Tiêu đề lỗi */}
        <h1 className="font-serif text-3xl md:text-4xl text-brand-forest font-light leading-tight">
          {is404 ? 'Không tìm thấy trang' : 'Oops! Có gì đó không ổn.'}
        </h1>

        {/* Nội dung mô tả ngắn gọn thân thiện với người dùng */}
        <p className="text-sm text-brand-charcoal/80 max-w-sm">
          {is404
            ? 'Đường liên kết bạn vừa truy cập có thể đã bị lỗi, bị xóa hoặc không tồn tại.'
            : 'Đã xảy ra lỗi hệ thống ngoài ý muốn. Chúng tôi đang nhanh chóng khắc phục sự cố này.'}
        </p>

        {/* Chi tiết lỗi kỹ thuật (dành cho nhà phát triển debug) */}
        {error && (
          <div className="bg-brand-white/60 border border-brand-sand/50 rounded-lg p-3 w-full">
            <p className="text-[10px] uppercase tracking-wider font-bold text-brand-sage">Chi tiết kỹ thuật</p>
            <p className="text-xs text-brand-clay italic mt-1 font-mono break-all">
              {error.statusText || error.message || 'Unknown Error'}
            </p>
          </div>
        )}

        {/* Nút điều hướng về trang chủ */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-brand-forest hover:bg-brand-green text-brand-white font-serif text-sm font-semibold tracking-wide py-3 px-6 rounded-md shadow-md transition-colors duration-300 group cursor-pointer"
        >
          <Home size={16} className="transform group-hover:-translate-y-0.5 transition-transform duration-300" />
          <span>Trở về Trang Chủ</span>
        </Link>

      </div>
    </div>
  );
}
