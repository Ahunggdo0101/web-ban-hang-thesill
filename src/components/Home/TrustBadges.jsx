import { Smile, ShieldCheck } from 'lucide-react';

export default function TrustBadges() {
  return (
    <section className="bg-[#f9f8f7] border-y border-brand-sand/60 py-12 md:py-14">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
          
          {/* Cột 1 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-brand-forest mt-0.5">
              {/* SVG watering can */}
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M7 11h8a1 1 0 0 1 1 1v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6a1 1 0 0 1 1-1z" />
                <path d="M7 13H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2" />
                <path d="M16 14l5-3" />
                <path d="M21 9v6" />
              </svg>
            </div>
            <div className="space-y-1.5 text-left">
              <h3 className="font-sans text-sm sm:text-base font-bold text-brand-charcoal">
                Hướng dẫn của chuyên gia
              </h3>
              <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
                Thành công bắt đầu từ việc lựa chọn đúng loại cây. Chúng tôi sẽ đảm bảo bạn làm được điều đó.
              </p>
            </div>
          </div>

          {/* Cột 2 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-brand-forest mt-0.5">
              <Smile size={24} strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 text-left">
              <h3 className="font-sans text-sm sm:text-base font-bold text-brand-charcoal">
                Kết nối & Phát triển
              </h3>
              <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
                Cộng đồng là tất cả. Các buổi hội thảo và sự kiện của chúng tôi giúp bạn học hỏi và kết nối.
              </p>
            </div>
          </div>

          {/* Cột 3 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-brand-forest mt-0.5">
              <ShieldCheck size={24} strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 text-left">
              <h3 className="font-sans text-sm sm:text-base font-bold text-brand-charcoal">
                Dịch vụ không phán xét
              </h3>
              <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
                Đội ngũ tận tâm của chúng tôi luôn sẵn sàng hỗ trợ — không có câu hỏi nào là quá nhỏ hay quá ngớ ngẩn!
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
