import { Leaf, ShieldCheck, Users } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function AboutPage() {
  useDocumentTitle('Về Chúng Tôi');
  const values = [
    {
      icon: Leaf,
      title: "Bền vững",
      desc: "Chúng tôi cam kết sử dụng các vật liệu thân thiện với môi trường, nguồn gốc cây trồng bền vững và giảm thiểu tối đa dấu chân carbon trong chuỗi cung ứng của mình."
    },
    {
      icon: ShieldCheck,
      title: "Chất lượng vượt trội",
      desc: "Mỗi chậu cây đều được tuyển chọn kỹ lưỡng, chăm sóc chuyên nghiệp tại vườn ươm trước khi được đóng gói cẩn thận để gửi đến tận tay khách hàng."
    },
    {
      icon: Users,
      title: "Cộng đồng xanh",
      desc: "The Sill không chỉ bán cây, chúng tôi xây dựng một cộng đồng nơi những người yêu thiên nhiên có thể chia sẻ kinh nghiệm và cùng nhau lan tỏa lối sống xanh."
    }
  ];

  const team = [
    {
      name: "Elisa Green",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80"
    },
    {
      name: "James Root",
      role: "Chuyên gia thực vật học",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80"
    },
    {
      name: "Sophia Bloom",
      role: "Giám đốc thiết kế",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80"
    },
    {
      name: "Lucas Soil",
      role: "Giám đốc vận hành",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80"
    }
  ];

  const [missionRef, missionVisible] = useScrollAnimation();
  const [valuesRef, valuesVisible] = useScrollAnimation();
  const [teamRef, teamVisible] = useScrollAnimation();

  return (
    <div className="bg-brand-cream text-brand-forest min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=1600&auto=format&fit=crop&q=80"
            alt="The Sill Houseplants"
            className="w-full h-full object-cover brightness-65 scale-102 transition-transform duration-1000"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl space-y-6">
          <span className="text-[11px] uppercase tracking-[0.3em] text-brand-clay font-bold block drop-shadow-md">
            Câu chuyện thương hiệu
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-brand-cream font-light leading-tight tracking-wide drop-shadow-lg">
            Mang thiên nhiên vào <br />
            <span className="italic font-normal">mọi không gian sống</span>
          </h1>
          <div className="w-16 h-[2px] bg-brand-clay mx-auto mt-6"></div>
        </div>
      </section>

      {/* 2. Mission Section */}
      <section ref={missionRef} className={`py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-700 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Image Stack */}
          <div className="relative aspect-4/3 w-full bg-brand-white border border-brand-sand shadow-sm overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&auto=format&fit=crop&q=80"
              alt="Caring for plants"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          </div>

          {/* Right Column - Text Storytelling */}
          <div className="space-y-8 text-left">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-brand-clay font-bold block">
                Sứ mệnh của chúng tôi
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light leading-tight">
                Mối quan hệ đặc biệt <br />giữa con người và cây xanh
              </h2>
            </div>
            
            <div className="space-y-5 text-sm text-brand-slate leading-relaxed font-medium">
              <p>
                The Sill được thành lập với niềm tin mãnh liệt rằng cây xanh không chỉ đơn thuần là những vật trang trí vô tri vô giác. Chúng là những người bạn đồng hành sống động, mang năng lượng tích cực giúp thanh lọc không khí, giảm bớt căng thẳng và nâng cao chất lượng cuộc sống hàng ngày của bạn.
              </p>
              <p>
                Hành trình đưa một chậu cây từ vườn ươm về ngôi nhà của bạn được chúng tôi chăm chút bằng cả tình yêu thương. Bằng cách đơn giản hóa quá trình chăm sóc cây xanh, cung cấp đầy đủ hướng dẫn tận tình và lựa chọn những loại cây dẻo dai nhất, chúng tôi muốn bất kỳ ai cũng có thể tự tin trở thành một người yêu cây thực thụ.
              </p>
              <p>
                Hãy bắt đầu biến ngôi nhà của mình thành một ốc đảo xanh mát, nơi bạn có thể tìm thấy sự bình yên và kết nối sâu sắc hơn với thiên nhiên ngay giữa lòng thành phố hối hả.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Values Section */}
      <section ref={valuesRef} className={`bg-brand-white border-y border-brand-sand py-24 transition-all duration-700 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-4 mb-20">
            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-clay font-bold block">
              Triết lý hoạt động
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light">
              Những giá trị cốt lõi
            </h2>
            <p className="text-xs text-brand-slate font-medium">
              Tại The Sill, chúng tôi luôn đặt tính bền vững, chất lượng sản phẩm và trải nghiệm của cộng đồng lên hàng đầu trong mọi quyết định.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="space-y-5 p-8 border border-brand-sand/65 bg-brand-cream/15 flex flex-col items-center">
                  <div className="w-14 h-14 bg-brand-cream border border-brand-sand rounded-full flex items-center justify-center text-brand-forest">
                    <Icon size={24} className="stroke-1.5" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-brand-forest">{val.title}</h3>
                  <p className="text-xs text-brand-slate leading-relaxed font-medium max-w-xs">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Team Section */}
      <section ref={teamRef} className={`py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center max-w-xl mx-auto space-y-4 mb-20">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-clay font-bold block">
            Chúng tôi là ai
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light">
            Đội ngũ sáng lập
          </h2>
          <p className="text-xs text-brand-slate font-medium">
            Những con người đầy nhiệt huyết đứng sau sứ mệnh phủ xanh không gian sống tại The Sill.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {team.map((member, idx) => (
            <div key={idx} className="space-y-4 text-center group">
              <div className="aspect-square w-full border border-brand-sand overflow-hidden relative shadow-xs">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-medium text-brand-forest leading-tight">
                  {member.name}
                </h4>
                <p className="text-[9px] uppercase tracking-wider text-brand-clay font-bold">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
