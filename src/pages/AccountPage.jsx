import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Heart, Sparkles, LogOut, User as UserIcon, Mail, ShieldAlert } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function AccountPage() {
  useDocumentTitle('Tài Khoản');
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 1. Trạng thái chưa đăng nhập
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[60vh] flex flex-col items-center justify-center bg-brand-cream text-brand-forest">
        <div className="text-center max-w-md mx-auto space-y-6 bg-brand-white border border-brand-sand p-8 sm:p-10 shadow-sm">
          <div className="w-16 h-16 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center mx-auto text-brand-clay">
            <UserIcon size={28} className="stroke-1.5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl text-brand-forest font-light">Tài khoản của bạn</h3>
            <p className="text-xs text-brand-slate leading-relaxed font-semibold">
              Vui lòng đăng nhập hoặc đăng ký để quản lý thông tin cá nhân, kiểm tra lịch sử đơn hàng và danh sách sản phẩm yêu thích.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full bg-brand-forest text-brand-cream text-[10px] font-bold uppercase tracking-widest py-4 hover:bg-brand-green transition-colors cursor-pointer"
          >
            Đăng nhập hoặc Đăng ký
          </button>
        </div>
      </div>
    );
  }

  // 2. Trạng thái đã đăng nhập
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in bg-brand-cream text-brand-forest min-h-screen">
      
      {/* Tiêu đề trang theo style premium */}
      <div className="text-left border-b border-brand-sand pb-10 mb-14">
        <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
          Tổng quan tài khoản
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-brand-forest font-light mt-2">
          Chào, {user.name}
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate max-w-xl mt-3 leading-relaxed font-medium">
          Xem thông tin cá nhân của bạn, truy cập nhanh vào giỏ hàng, lịch sử đơn hàng và danh sách yêu thích.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Profile Card (4 Columns) */}
        <div className="lg:col-span-4 bg-brand-white border border-brand-sand p-8 shadow-sm space-y-6 text-center">
          <div className="relative w-24 h-24 mx-auto border-2 border-brand-sand rounded-full overflow-hidden shadow-xs">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-brand-cream flex items-center justify-center text-brand-forest">
                <UserIcon size={32} />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-xl font-medium text-brand-forest">{user.name}</h3>
            <div className="flex items-center justify-center gap-1.5 text-xs text-brand-slate font-medium">
              <Mail size={12} className="stroke-1.5 text-brand-clay" />
              <span>{user.email}</span>
            </div>
          </div>

          {user.role === 'admin' ? (
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider mx-auto">
              <ShieldAlert size={10} /> Quản trị viên
            </span>
          ) : (
            <span className="inline-flex items-center bg-brand-cream text-brand-forest border border-brand-sand px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider mx-auto">
              Thành viên xanh
            </span>
          )}

          <div className="border-t border-brand-sand/60 pt-6">
            <button
              onClick={handleLogout}
              className="w-full border border-red-200 text-red-700 bg-red-50/30 hover:bg-red-50 text-[10px] font-bold uppercase tracking-widest py-3 hover:text-red-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Đăng xuất <LogOut size={12} />
            </button>
          </div>
        </div>

        {/* Quick Links Grid (8 Columns) */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <h3 className="font-serif text-2xl text-brand-forest font-light mb-4">
            Lối tắt nhanh
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Đơn hàng */}
            <Link
              to="/orders"
              className="bg-brand-white border border-brand-sand p-6 shadow-xs hover:border-brand-forest hover:shadow-md transition-all flex flex-col justify-between aspect-square max-w-[240px] sm:max-w-none w-full"
            >
              <div className="w-10 h-10 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center text-brand-forest">
                <ShoppingBag size={18} className="stroke-1.5" />
              </div>
              <div className="space-y-1.5 mt-8">
                <h4 className="font-serif text-base font-semibold text-brand-forest">Đơn hàng của tôi</h4>
                <p className="text-[10px] text-brand-slate font-medium leading-relaxed">
                  Xem chi tiết lịch sử mua sắm và theo dõi hành trình giao nhận của các đơn hàng.
                </p>
              </div>
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="bg-brand-white border border-brand-sand p-6 shadow-xs hover:border-brand-forest hover:shadow-md transition-all flex flex-col justify-between aspect-square max-w-[240px] sm:max-w-none w-full"
            >
              <div className="w-10 h-10 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center text-brand-forest">
                <Heart size={18} className="stroke-1.5" />
              </div>
              <div className="space-y-1.5 mt-8">
                <h4 className="font-serif text-base font-semibold text-brand-forest">Danh sách yêu thích</h4>
                <p className="text-[10px] text-brand-slate font-medium leading-relaxed">
                  Lưu giữ các loài cây cảnh đẹp mắt bạn đang quan sát để dễ dàng đặt mua sau này.
                </p>
              </div>
            </Link>

            {/* Trắc nghiệm chọn cây */}
            <Link
              to="/quiz"
              className="bg-brand-white border border-brand-sand p-6 shadow-xs hover:border-brand-forest hover:shadow-md transition-all flex flex-col justify-between aspect-square max-w-[240px] sm:max-w-none w-full"
            >
              <div className="w-10 h-10 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center text-brand-forest">
                <Sparkles size={18} className="stroke-1.5" />
              </div>
              <div className="space-y-1.5 mt-8">
                <h4 className="font-serif text-base font-semibold text-brand-forest">Bài trắc nghiệm cây</h4>
                <p className="text-[10px] text-brand-slate font-medium leading-relaxed">
                  Làm lại trắc nghiệm chọn cây để khám phá thêm nhiều loài cây phù hợp với bạn.
                </p>
              </div>
            </Link>
          </div>

          {/* Admin shortcut */}
          {user.role === 'admin' && (
            <div className="border border-red-200 bg-red-50/20 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-semibold text-brand-forest flex items-center gap-1.5">
                  <ShieldAlert size={18} className="text-red-700 stroke-1.5" /> Quyền quản trị hệ thống
                </h4>
                <p className="text-xs text-brand-slate font-medium max-w-xl">
                  Bạn đang đăng nhập với tài khoản Admin. Bạn có quyền truy cập vào Dashboard để quản lý sản phẩm, đơn hàng và các thiết lập hệ thống.
                </p>
              </div>
              <Link
                to="/admin"
                className="bg-brand-forest text-brand-cream text-[10px] font-bold uppercase tracking-widest px-6 py-3 hover:bg-brand-green transition-colors cursor-pointer shrink-0"
              >
                Vào trang quản trị
              </Link>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
