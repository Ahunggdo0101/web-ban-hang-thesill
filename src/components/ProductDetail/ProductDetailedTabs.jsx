import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Droplets, Info } from 'lucide-react';
import { optimizeUnsplashImage } from '../../utils/image';

export default function ProductDetailedTabs({ product }) {
  const [activeInfoTab, setActiveInfoTab] = useState('info');

  if (!product) return null;

  return (
    <div className="w-full bg-[#f7f8f9] py-16 mt-20 border-t border-b border-brand-sand/30">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[146px] text-left">
        <h2 className="font-serif text-3xl md:text-[38px] text-[#2A2D24] font-normal mb-8 text-left">
          {product.id === 'olive-tree' ? 'Thông tin về cây ô liu' : `Thông tin về ${product.name.toLowerCase()}`}
        </h2>

        {/* Tab Buttons bar */}
        <div className="w-full bg-white border border-brand-sand/20 rounded-2xl sm:rounded-full flex flex-col sm:flex-row p-1.5 gap-1.5 sm:gap-2 mb-10">
          {[
            { id: 'info', label: 'Thông tin & Kích cỡ' },
            { id: 'care', label: 'Hướng dẫn chăm sóc' },
            { id: 'faq', label: 'Câu hỏi thường gặp' },
            { id: 'pot', label: 'Thông tin về chậu trồng cây' },
            { id: 'shipping', label: 'Cách thức vận chuyển' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveInfoTab(tab.id)}
              className={`flex-1 text-center px-4 sm:px-6 py-3 text-sm md:text-[15px] font-medium transition-all cursor-pointer rounded-xl sm:rounded-full ${
                activeInfoTab === tab.id
                  ? 'bg-[#2A2D24] text-white shadow-sm ring-2 ring-[#0060df] ring-offset-2 ring-offset-white'
                  : 'text-brand-slate hover:text-[#2A2D24]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>


        {/* Tab Contents */}
        <div className="mt-12 text-left">
          {activeInfoTab === 'info' && (
            <div className="space-y-12 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
                {/* Left image card (Col 7) */}
                <div className="col-span-12 md:col-span-7 aspect-[4/5] w-full max-h-[75vh] max-w-[60vh] bg-[#faf9f6] border border-brand-sand/30 rounded-2xl overflow-hidden shadow-xs flex-grow">
                  <img
                    src={optimizeUnsplashImage(product.image, 800)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right text info (Col 5) */}
                <div className="col-span-12 md:col-span-5 space-y-6">
                  <span className="block text-[11px] md:text-xs font-bold text-brand-slate/60 uppercase tracking-widest">
                    VỀ CÂY Ô LIU
                  </span>
                  <p className="text-base md:text-[17px] text-[#2A2D24]/90 leading-relaxed font-normal">
                    {product.id === 'olive-tree' ? (
                      `Với những chiếc lá nhỏ, màu xám xanh ánh bạc, cây ô liu (loại cụ thể này là cây ô liu thông thường) là loại cây cảnh trong nhà rất đẹp. Loại cây Địa Trung Hải này cần nhiều ánh nắng trực tiếp và rực rỡ. Cửa sổ hướng Nam và Tây là lý tưởng. Thân thiện với vật nuôi. (Mẹo nhỏ: Cành ô liu rất đẹp khi dùng để trang trí bó hoa, hãy nhớ điều này khi cây của bạn phát triển trong nhiều năm tới.)`
                    ) : (
                      `Với những chiếc lá xanh tốt, đầy sức sống, cây ${product.name.toLowerCase()} (${product.botanicalName}) là một trong những loài cây cảnh trong nhà rất được yêu chuộng. Loài cây này mang lại cảm giác tươi mới cho mọi không gian sống. Cần ánh sáng gián tiếp rực rỡ và chu kỳ nước tưới điều độ để cây phát triển khỏe mạnh nhất.`
                    )}
                  </p>
                  <p className="text-base md:text-[17px] text-[#2A2D24] italic leading-relaxed font-normal">
                    Kết hợp với <Link to="/shop" className="underline text-[#007b5f] hover:text-[#005a45] not-italic font-medium">Bộ dụng cụ chăm sóc cây ô liu</Link> của chúng tôi để giữ cho cây của bạn khỏe mạnh và cho năng suất cao!
                  </p>
                  
                  {/* Bullet points list */}
                  <ul className="space-y-4 text-base md:text-[16px] text-[#2A2D24]/90 font-normal">
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 text-[#2A2D24]/60">→</span>
                      <span>Mỗi cây đều độc đáo; kích thước và hình dáng thay đổi theo mùa, vì vậy tất cả các cỡ đo được hiển thị dưới dạng khoảng giá trị.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 text-[#2A2D24]/60">→</span>
                      <span>Cây nhỏ có chiều cao từ 5-10 inch tính từ đáy chậu đến ngọn tán lá.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 text-[#2A2D24]/60">→</span>
                      <span>Cây cỡ trung bình có chiều cao từ 8-16 inch tính từ đáy chậu đến ngọn tán lá.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 text-[#2A2D24]/60">→</span>
                      <span>Cây lớn có chiều cao từ 90 đến 1,5 mét tính từ đáy chậu đến ngọn tán lá.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 text-[#2A2D24]/60">→</span>
                      <span>Cây khổng lồ này cao từ 1,5 đến 1,8 mét tính từ đáy chậu đến ngọn tán lá.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 text-[#2A2D24]/60">→</span>
                      <span>Cây nhỏ và vừa được giao trong chậu ươm đặt sẵn trong chậu trồng cây mà bạn lựa chọn; chậu trồng cây và cây lớn có thể được vận chuyển riêng biệt.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Hướng dẫn chọn kích cỡ */}
              <div className="border-t border-brand-sand/30 pt-10">
                <span className="block text-xs font-bold text-brand-forest uppercase tracking-widest mb-10">
                  Hướng dẫn chọn kích cỡ
                </span>
                
                {/* 4 outline columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 lg:gap-8 text-center items-end">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto text-brand-slate stroke-current fill-none" strokeWidth="0.8">
                      <path d="M38,40 L62,40 L57,75 L43,75 Z" />
                      <ellipse cx="50" cy="40" rx="12" ry="3" />
                    </svg>
                    <div className="space-y-1.5">
                      <span className="block font-bold text-xs uppercase tracking-wider text-brand-slate">5"</span>
                      <strong className="block font-serif text-sm text-brand-forest font-semibold">Bé nhỏ</strong>
                      <p className="text-[11px] text-brand-slate leading-relaxed px-2 font-medium">
                        Đường kính khoảng 5 inch, phù hợp với cây trồng trong chậu 4 inch hoặc nhỏ hơn.
                      </p>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto text-brand-slate stroke-current fill-none" strokeWidth="0.8">
                      <path d="M32,32 L68,32 L62,75 L38,75 Z" />
                      <ellipse cx="50" cy="32" rx="18" ry="4" />
                    </svg>
                    <div className="space-y-1.5">
                      <span className="block font-bold text-xs uppercase tracking-wider text-brand-slate">7"</span>
                      <strong className="block font-serif text-sm text-brand-forest font-semibold">Trung bình</strong>
                      <p className="text-[11px] text-brand-slate leading-relaxed px-2 font-medium">
                        Đường kính khoảng 7 inch, phù hợp với cây trồng trong chậu 6 inch hoặc nhỏ hơn.
                      </p>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="space-y-4">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto text-brand-slate stroke-current fill-none" strokeWidth="0.8">
                      <path d="M26,24 L74,24 L67,75 L33,75 Z" />
                      <ellipse cx="50" cy="24" rx="24" ry="5.5" />
                    </svg>
                    <div className="space-y-1.5">
                      <span className="block font-bold text-xs uppercase tracking-wider text-brand-slate">10 - 12"</span>
                      <strong className="block font-serif text-sm text-brand-forest font-semibold">Lớn</strong>
                      <p className="text-[11px] text-brand-slate leading-relaxed px-2 font-medium">
                        Đường kính khoảng 10-12 cm, phù hợp với cây trồng trong chậu có đường kính 10 cm hoặc nhỏ hơn.
                      </p>
                    </div>
                  </div>

                  {/* Column 4 */}
                  <div className="space-y-4">
                    <svg viewBox="0 0 100 100" className="w-28 h-28 mx-auto text-brand-slate stroke-current fill-none" strokeWidth="0.8">
                      <path d="M20,16 L80,16 L72,75 L28,75 Z" />
                      <ellipse cx="50" cy="16" rx="30" ry="7" />
                    </svg>
                    <div className="space-y-1.5">
                      <span className="block font-bold text-xs uppercase tracking-wider text-brand-slate">12 - 14"</span>
                      <strong className="block font-serif text-sm text-brand-forest font-semibold">To lớn</strong>
                      <p className="text-[11px] text-brand-slate leading-relaxed px-2 font-medium">
                        Đường kính khoảng 30-30 cm, phù hợp với cây trồng trong chậu có đường kính 30 cm hoặc nhỏ hơn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeInfoTab === 'care' && (
            <div className="w-full space-y-8 bg-white p-8 border border-brand-sand/20 rounded-2xl shadow-xs animate-fade-in">
              <span className="block text-[11px] font-bold text-brand-forest uppercase tracking-widest">
                Cẩm nang chăm sóc chi tiết
              </span>
              
              <div className="space-y-6 text-sm font-medium text-brand-slate">
                <div className="flex items-start gap-4 pb-6 border-b border-brand-sand/30">
                  <Sun size={20} className="text-brand-forest shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-forest text-base mb-1">Yêu cầu Ánh sáng</h4>
                    <p className="leading-relaxed">{(typeof product.careDetails === 'string' ? JSON.parse(product.careDetails) : product.careDetails)?.light || 'Yêu cầu ánh sáng gián tiếp hoặc trực tiếp tùy loại cây. Tránh đặt ở nơi tối tăm hoàn toàn.'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 pb-6 border-b border-brand-sand/30">
                  <Droplets size={20} className="text-brand-forest shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-forest text-base mb-1">Chế độ tưới nước</h4>
                    <p className="leading-relaxed">{(typeof product.careDetails === 'string' ? JSON.parse(product.careDetails) : product.careDetails)?.water || 'Tưới nước khi lớp đất mặt đã khô. Không được để cây ngập úng hoặc quá khô hạn lâu ngày.'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Info size={20} className="text-brand-forest shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-forest text-base mb-1">Độc tính & Thú cưng</h4>
                    <p className="leading-relaxed">{(typeof product.careDetails === 'string' ? JSON.parse(product.careDetails) : product.careDetails)?.toxicity || 'Tìm hiểu kỹ độ an toàn của cây với thú cưng và trẻ nhỏ để có vị trí đặt phù hợp.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeInfoTab === 'faq' && (
            <div className="w-full space-y-6 animate-fade-in bg-white p-8 border border-brand-sand/20 rounded-2xl shadow-xs">
              <span className="block text-[11px] font-bold text-brand-forest uppercase tracking-widest mb-6">
                Câu hỏi thường gặp (FAQ)
              </span>
              <div className="space-y-5">
                {[
                  { q: 'Tôi nên tưới nước cho cây bao lâu một lần?', a: 'Thông thường từ 1-2 tuần một lần. Hãy kiểm tra độ ẩm của đất trước khi tưới bằng cách chọc sâu ngón tay khoảng 2-3 cm. Nếu đất khô hoàn toàn thì mới tiến hành tưới nước.' },
                  { q: 'Lá cây bị vàng hoặc rụng là do nguyên nhân gì?', a: 'Có thể do tưới quá nhiều nước gây úng rễ, hoặc do cây bị thiếu ánh sáng nghiêm trọng. Hãy chuyển cây ra vị trí thoáng mát, có ánh sáng tán xạ tốt và giãn chu kỳ tưới.' },
                  { q: 'Tôi có cần bón phân cho cây không?', a: 'Có, nên bón phân hữu cơ lỏng nhẹ hoặc phân tan chậm định kỳ 1 tháng/lần vào mùa xuân và mùa hè (mùa sinh trưởng của cây), hạn chế bón vào mùa đông.' },
                  { q: 'Làm thế nào để vệ sinh lá cây?', a: 'Lá cây lâu ngày sẽ bị bám bụi làm giảm khả năng quang hợp. Hãy dùng khăn ẩm mềm lau nhẹ bề mặt lá hoặc phun sương nhẹ nhàng định kỳ hàng tuần.' }
                ].map((item, idx) => (
                  <div key={idx} className="border-b border-brand-sand/30 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-serif text-base text-brand-forest font-bold mb-2">Q: {item.q}</h4>
                    <p className="text-xs md:text-sm text-brand-slate leading-relaxed font-medium">A: {item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeInfoTab === 'pot' && (
            <div className="w-full space-y-8 bg-white p-8 border border-brand-sand/20 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in shadow-xs">
              <div>
                <span className="block text-[11px] font-bold text-brand-forest uppercase tracking-widest mb-4">
                  Chất liệu chậu trồng cao cấp
                </span>
                <div className="space-y-4 text-xs md:text-sm text-brand-slate leading-relaxed font-medium">
                  <p>
                    Các chậu trồng của chúng tôi (như dòng Pallas, Isabella) được làm thủ công từ đất nung hoặc gốm sứ tráng men mờ chất lượng cao, có độ bền và tính thẩm mỹ tuyệt vời.
                  </p>
                  <p>
                    Chậu được thiết kế thông minh với lỗ thoát nước ở đáy và đi kèm đĩa đệm đồng bộ. Điều này giúp ngăn ngừa triệt để tình trạng úng rễ, bảo vệ sự phát triển toàn diện của cây trồng.
                  </p>
                </div>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-brand-sand/30 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1616047000311-59d72569650d?auto=format&fit=crop&q=80&w=600"
                  alt="Chậu cây"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {activeInfoTab === 'shipping' && (
            <div className="w-full space-y-8 bg-white p-8 border border-brand-sand/20 rounded-2xl animate-fade-in shadow-xs">
              <span className="block text-[11px] font-bold text-brand-forest uppercase tracking-widest">
                Thông tin đóng gói & Vận chuyển
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center mx-auto text-brand-forest font-bold">📦</div>
                  <h4 className="font-bold text-brand-forest text-sm">Đóng gói an toàn</h4>
                  <p className="text-[11px] text-brand-slate font-medium leading-relaxed">
                    Cây được bọc màng giữ ẩm đất và cố định chắc chắn trong hộp carton 3 lớp đặc thù chống va đập.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center mx-auto text-brand-forest font-bold">🚚</div>
                  <h4 className="font-bold text-brand-forest text-sm">Giao hàng toàn quốc</h4>
                  <p className="text-[11px] text-brand-slate font-medium leading-relaxed">
                    Hợp tác với các đơn vị vận chuyển hỏa tốc, thời gian giao từ 2-4 ngày để bảo toàn độ tươi của cây.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center mx-auto text-brand-forest font-bold">🛡️</div>
                  <h4 className="font-bold text-brand-forest text-sm">Bảo hành 30 ngày</h4>
                  <p className="text-[11px] text-brand-slate font-medium leading-relaxed">
                    Đổi mới hoặc hoàn tiền 100% nếu cây bị hỏng, héo úa hoặc gặp sự cố trong vòng 30 ngày kể từ khi nhận.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
