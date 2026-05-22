import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { products as staticProducts } from '../data/products';
import { Sun, ShieldAlert, Award, ArrowLeft, RefreshCw, Star, Heart, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

export default function PlantQuiz({ products: propProducts } = {}) {
  const navigate = useNavigate();
  const products = propProducts && propProducts.length > 0 ? propProducts : staticProducts;
  const { addToCart } = useCart();
  const [step, setStep] = useState(0); // 0: Start, 1: Light, 2: Pets, 3: Skill, 4: Results
  const [answers, setAnswers] = useState({
    light: '',
    hasPets: null,
    skill: '',
  });

  const handleStart = () => {
    setStep(1);
  };

  const handleSelectLight = (option) => {
    setAnswers({ ...answers, light: option });
    setStep(2);
  };

  const handleSelectPets = (option) => {
    setAnswers({ ...answers, hasPets: option });
    setStep(3);
  };

  const handleSelectSkill = (option) => {
    setAnswers({ ...answers, skill: option });
    setStep(4);
  };

  const resetQuiz = () => {
    setAnswers({ light: '', hasPets: null, skill: '' });
    setStep(0);
  };

  const goBack = () => {
    setStep(step - 1);
  };

  // Filter recommendations based on answers using useMemo to avoid re-calculating on every render
  const recommendedPlants = useMemo(() => {
    return products.filter((product) => {
      // 1. Light filter
      if (answers.light && product.light !== answers.light) {
        return false;
      }
      // 2. Pet filter
      if (answers.hasPets === true && !product.petFriendly) {
        return false;
      }
      // 3. Skill filter
      if (answers.skill === 'easy' && product.difficulty !== 'easy') {
        return false;
      }
      if (answers.skill === 'moderate' && product.difficulty === 'care') {
        return false;
      }
      return true;
    });
  }, [products, answers]);

  // Stable empty callback to prevent breaking React.memo on ProductCard
  const noopColorChange = useCallback(() => {}, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 bg-brand-cream min-h-[60vh] flex flex-col justify-center">
      
      {/* ProgressBar */}
      {step > 0 && step < 4 && (
        <div className="w-full max-w-xs mx-auto mb-16 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-brand-slate uppercase tracking-widest">
            <span>Tiến trình</span>
            <span>Bước {step} / 3</span>
          </div>
          <div className="w-full bg-brand-sand h-1 overflow-hidden">
            <div
              className="bg-brand-forest h-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* QUIZ START */}
      {step === 0 && (
        <div className="text-center max-w-xl mx-auto space-y-8 animate-slide-up">
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">
            Trắc nghiệm tìm cây cảnh
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-forest font-light leading-tight">
            Tìm loài cây hoàn hảo cho ngôi nhà bạn
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
            Trả lời 3 câu hỏi nhanh về điều kiện ánh sáng, sự hiện diện của thú cưng và kỹ năng làm vườn của bạn. Thuật toán của chúng tôi sẽ đề xuất những lựa chọn cây xanh lý tưởng nhất.
          </p>
          <button
            onClick={handleStart}
            className="bg-brand-forest hover:bg-brand-green text-brand-white text-[10px] font-bold tracking-widest uppercase px-10 py-5 transition-all cursor-pointer hover:-translate-y-0.5 shadow-sm"
          >
            BẮT ĐẦU TRẮC NGHIỆM
          </button>
        </div>
      )}

      {/* STEP 1: LIGHT */}
      {step === 1 && (
        <div className="max-w-lg mx-auto text-center space-y-8 animate-fade-in w-full">
          <div className="flex justify-between items-center border-b border-brand-sand pb-4">
            <button onClick={goBack} className="text-brand-slate hover:text-brand-forest flex items-center text-[9px] font-bold uppercase tracking-widest cursor-pointer">
              <ArrowLeft size={12} className="mr-1" /> Quay lại
            </button>
            <span className="text-[9px] text-brand-slate font-bold uppercase tracking-widest">Ánh sáng</span>
          </div>
          <h2 className="font-serif text-3xl text-brand-forest font-light">Ánh sáng phòng bạn như thế nào?</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'low', name: 'Ánh sáng yếu', desc: 'Góc phòng xa cửa sổ, hoặc văn phòng chỉ có đèn điện.' },
              { id: 'medium', name: 'Ánh sáng trung bình', desc: 'Gần cửa sổ lớn có rèm che, ánh sáng gián tiếp dịu mát.' },
              { id: 'bright', name: 'Ánh sáng rực rỡ', desc: 'Có nắng chiếu trực tiếp vài tiếng mỗi ngày, sát bên cửa kính.' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectLight(opt.id)}
                className="border border-brand-sand hover:border-brand-forest bg-brand-white p-5 rounded-none text-left transition-all duration-300 cursor-pointer flex items-center justify-between group hover:-translate-y-0.5 shadow-xs"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-brand-forest uppercase tracking-wider group-hover:text-brand-clay transition-colors">{opt.name}</h4>
                  <p className="text-[11px] text-brand-slate font-medium leading-normal">{opt.desc}</p>
                </div>
                <Sun size={16} className="text-brand-slate opacity-40 group-hover:opacity-100 group-hover:text-brand-forest transition-all ml-4 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: PETS */}
      {step === 2 && (
        <div className="max-w-lg mx-auto text-center space-y-8 animate-fade-in w-full">
          <div className="flex justify-between items-center border-b border-brand-sand pb-4">
            <button onClick={goBack} className="text-brand-slate hover:text-brand-forest flex items-center text-[9px] font-bold uppercase tracking-widest cursor-pointer">
              <ArrowLeft size={12} className="mr-1" /> Quay lại
            </button>
            <span className="text-[9px] text-brand-slate font-bold uppercase tracking-widest">Thú cưng</span>
          </div>
          <h2 className="font-serif text-3xl text-brand-forest font-light">Bạn có nuôi chó hoặc mèo không?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectPets(true)}
              className="border border-brand-sand hover:border-brand-forest bg-brand-white p-8 rounded-none text-center transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 shadow-xs"
            >
              <ShieldAlert size={24} className="text-brand-clay mx-auto mb-4" />
              <h4 className="font-bold text-xs text-brand-forest uppercase tracking-wider group-hover:text-brand-clay transition-colors">Có thú cưng</h4>
              <p className="text-[11px] text-brand-slate mt-2 font-medium leading-normal">
                Chúng tôi sẽ lọc ra các cây an toàn, thân thiện vật nuôi.
              </p>
            </button>

            <button
              onClick={() => handleSelectPets(false)}
              className="border border-brand-sand hover:border-brand-forest bg-brand-white p-8 rounded-none text-center transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 shadow-xs"
            >
              <Award size={24} className="text-[#1F3E35] mx-auto mb-4" />
              <h4 className="font-bold text-xs text-brand-forest uppercase tracking-wider group-hover:text-brand-clay transition-colors">Không có thú cưng</h4>
              <p className="text-[11px] text-brand-slate mt-2 font-medium leading-normal">
                Bạn có thể lựa chọn bất kỳ loài cây nào mong muốn.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EXPERIENCE */}
      {step === 3 && (
        <div className="max-w-lg mx-auto text-center space-y-8 animate-fade-in w-full">
          <div className="flex justify-between items-center border-b border-brand-sand pb-4">
            <button onClick={goBack} className="text-brand-slate hover:text-brand-forest flex items-center text-[9px] font-bold uppercase tracking-widest cursor-pointer">
              <ArrowLeft size={12} className="mr-1" /> Quay lại
            </button>
            <span className="text-[9px] text-brand-slate font-bold uppercase tracking-widest">Kinh nghiệm</span>
          </div>
          <h2 className="font-serif text-3xl text-brand-forest font-light">Kinh nghiệm chăm cây của bạn?</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'easy', label: 'Người mới bắt đầu', desc: 'Tôi cần cây dễ chịu, có thể quên tưới nước đôi lúc.' },
              { id: 'moderate', label: 'Mức độ trung bình', desc: 'Tôi có thể chăm sóc cây 1-2 lần mỗi tuần.' },
              { id: 'expert', label: 'Người có kinh nghiệm', desc: 'Tôi sẵn sàng chăm sóc loài cây đòi hỏi độ ẩm cao.' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectSkill(opt.id)}
                className="border border-brand-sand hover:border-brand-forest bg-brand-white p-5 rounded-none text-left transition-all duration-300 flex items-center justify-between cursor-pointer group hover:-translate-y-0.5 shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-xs text-brand-forest uppercase tracking-wider group-hover:text-brand-clay transition-colors">{opt.label}</h4>
                  <p className="text-[11px] text-brand-slate font-medium mt-0.5 leading-normal">{opt.desc}</p>
                </div>
                <ChevronRight size={16} className="text-brand-slate opacity-40 group-hover:opacity-100 group-hover:text-brand-forest transition-all flex-shrink-0 ml-4" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {step === 4 && (
        <div className="space-y-16 animate-slide-up w-full">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-clay font-bold block">Gợi ý dành riêng cho bạn</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-forest font-light leading-tight">Những lựa chọn hoàn hảo</h2>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed font-medium">
              Tìm thấy <strong className="text-brand-forest">{recommendedPlants.length} sản phẩm</strong> phù hợp với căn phòng ánh sáng <strong className="text-brand-forest">{answers.light === 'low' ? 'yếu' : answers.light === 'medium' ? 'trung bình' : 'rực rỡ'}</strong>
              {answers.hasPets ? ' và an toàn với vật nuôi' : ''}.
            </p>
          </div>

          {recommendedPlants.length === 0 ? (
            <div className="text-center py-20 bg-brand-white border border-brand-sand rounded-none max-w-md mx-auto space-y-4 shadow-xs">
              <span className="text-3xl block">⚠️</span>
              <h3 className="font-serif text-lg font-medium text-brand-forest">Không tìm thấy loài cây phù hợp</h3>
              <p className="text-xs text-brand-slate px-6 leading-relaxed font-medium">
                Vui lòng làm lại trắc nghiệm và điều chỉnh một số điều kiện lọc thoải mái hơn để nhận gợi ý nhé.
              </p>
              <button
                onClick={resetQuiz}
                className="bg-brand-forest hover:bg-brand-green text-brand-white text-xs font-semibold uppercase tracking-widest px-8 py-4 transition-colors cursor-pointer"
              >
                THỰC HIỆN LẠI TRẮC NGHIỆM
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {recommendedPlants.map((plant) => (
                  <ProductCard
                    key={plant.id}
                    plant={plant}
                    activeColor="Terracotta"
                    onColorChange={noopColorChange}
                    addToCart={addToCart}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-16 border-t border-brand-sand mt-16">
                <button
                  onClick={resetQuiz}
                  className="border border-brand-sand hover:border-brand-forest bg-brand-white text-brand-charcoal hover:text-brand-forest text-xs font-bold uppercase tracking-widest px-6 py-4 transition-colors flex items-center cursor-pointer"
                >
                  <RefreshCw size={12} className="mr-1.5" /> LÀM LẠI
                </button>
                <button
                  onClick={() => navigate('/shop')}
                  className="bg-brand-forest hover:bg-brand-green text-brand-white text-xs font-bold uppercase tracking-widest px-8 py-4 transition-colors cursor-pointer"
                >
                  VÀO CỬA HÀNG MUA SẮM
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
