import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Loader2, Navigation, X } from 'lucide-react';
import { VIETNAM_PROVINCES } from '../../utils/vietnamAreas';
import { getCurrentGPSCoordinates, getAddressFromCoordinates } from '../../utils/geolocation';

const AreaSelector = React.memo(function AreaSelector({ onSelectArea, onGPSLocateSuccess, onCancel, showToast }) {
  const [provincesList, setProvincesList] = useState(VIETNAM_PROVINCES);
  const [districtsList, setDistrictsList] = useState([]);
  const [wardsList, setWardsList] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null); // { code, name }
  const [selectedDistrict, setSelectedDistrict] = useState(null); // { code, name }
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Province, 2: District, 3: Ward
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Tải danh sách Tỉnh/Thành từ API khi mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch('https://provinces.open-api.vn/api/?depth=1');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map(p => ({ code: String(p.code), name: p.name }));
            setProvincesList(formatted);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải tỉnh thành từ API, sử dụng fallback tĩnh.', err);
      }
    };
    fetchProvinces();
  }, []);

  // Chọn Tỉnh
  const handleSelectProvince = useCallback(async (prov) => {
    setSelectedProvince(prov);
    setSelectedDistrict(null);
    setSearchQuery('');
    setIsLoadingApi(true);
    setCurrentStep(2);

    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${prov.code}?depth=2`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.districts)) {
          const formatted = data.districts.map(d => ({ code: String(d.code), name: d.name }));
          setDistrictsList(formatted);
        } else {
          setDistrictsList([]);
        }
      } else {
        throw new Error('API Error');
      }
    } catch (err) {
      console.warn('Lỗi tải quận huyện:', err);
      if (showToast) showToast('Không thể tải danh sách Quận/Huyện từ API.', 'warning');
      onSelectArea(prov.name, '', '', true); // Force manual mode on error
    } finally {
      setIsLoadingApi(false);
    }
  }, [onSelectArea, showToast]);

  // Chọn Quận/Huyện
  const handleSelectDistrict = useCallback(async (dist) => {
    setSelectedDistrict(dist);
    setSearchQuery('');
    setIsLoadingApi(true);
    setCurrentStep(3);

    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${dist.code}?depth=2`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.wards)) {
          const formatted = data.wards.map(w => ({ code: String(w.code), name: w.name }));
          setWardsList(formatted);
        } else {
          setWardsList([]);
        }
      } else {
        throw new Error('API Error');
      }
    } catch (err) {
      console.warn('Lỗi tải phường xã:', err);
      if (showToast) showToast('Không thể tải danh sách Phường/Xã từ API.', 'warning');
      onSelectArea(selectedProvince?.name || '', dist.name, '', true);
    } finally {
      setIsLoadingApi(false);
    }
  }, [selectedProvince, onSelectArea, showToast]);

  // Chọn Phường/Xã (Hoàn tất)
  const handleSelectWard = useCallback((wrd) => {
    onSelectArea(selectedProvince?.name || '', selectedDistrict?.name || '', wrd.name, false);
    setCurrentStep(1);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSearchQuery('');
  }, [selectedProvince, selectedDistrict, onSelectArea]);

  // Định vị GPS vị trí hiện tại
  const handleGPSLocation = async () => {
    setIsLocatingGps(true);
    if (showToast) showToast('Đang kết nối GPS định vị tọa độ của bạn...', 'info');

    try {
      const coords = await getCurrentGPSCoordinates();
      const addressData = await getAddressFromCoordinates(coords.latitude, coords.longitude);
      
      onGPSLocateSuccess(addressData);
      
      setCurrentStep(1);
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSearchQuery('');
    } catch (error) {
      console.error('Lỗi định vị:', error);
      if (showToast) showToast(error.message || 'Lỗi định vị. Vui lòng tự chọn bằng tay.', 'error');
    } finally {
      setIsLocatingGps(false);
    }
  };

  // Lọc theo tìm kiếm
  const filteredProvinces = useMemo(() => {
    if (!searchQuery) return provincesList;
    return provincesList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [provincesList, searchQuery]);

  const filteredDistricts = useMemo(() => {
    if (!searchQuery) return districtsList;
    return districtsList.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [districtsList, searchQuery]);

  const filteredWards = useMemo(() => {
    if (!searchQuery) return wardsList;
    return wardsList.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [wardsList, searchQuery]);

  // Quay lại bước trước
  const handleHeaderBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setSearchQuery('');
    } else {
      onCancel(); // Quay lại form chính nếu đang ở bước 1 và bấm Back
    }
  }, [currentStep, onCancel]);

  return (
    <div className="w-full bg-brand-cream space-y-4 animate-slide-up flex flex-col text-left">
      
      {/* Header Inline */}
      <div className="border-b border-brand-sand pb-3 mb-2 space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleHeaderBack}
              className="text-[#555] hover:text-brand-forest p-1 cursor-pointer transition-colors rounded-full hover:bg-brand-sand/30"
              title="Quay lại"
            >
              <ArrowLeft size={18} />
            </button>
            <h4 className="font-serif text-base font-semibold text-brand-forest">
              {currentStep === 1 ? 'Chọn Tỉnh / Thành phố' : currentStep === 2 ? 'Chọn Quận / Huyện' : 'Chọn Phường / Xã'}
            </h4>
          </div>
          
          <button 
            type="button"
            onClick={onCancel}
            className="text-xs text-[#555] hover:text-brand-forest font-bold uppercase tracking-wider px-2 py-1 cursor-pointer transition-colors"
            title="Hủy và quay về form chính"
          >
            Hủy
          </button>
        </div>

        {/* Breadcrumb hiển thị các cấp đã chọn */}
        {currentStep > 1 && selectedProvince && (
          <p className="text-[10px] text-brand-forest/70 font-semibold tracking-wide pl-8 uppercase animate-fade-in">
            {selectedProvince.name} {selectedDistrict ? ` → ${selectedDistrict.name}` : ''}
          </p>
        )}
      </div>

      {/* GPS Button */}
      <div>
        <button
          type="button"
          disabled={isLocatingGps}
          onClick={handleGPSLocation}
          className="w-full bg-brand-white border border-brand-forest/40 hover:border-brand-forest text-brand-forest text-xs font-semibold py-3 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        >
          {isLocatingGps ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Đang dò tìm tọa độ GPS...
            </>
          ) : (
            <>
              <Navigation size={14} className="fill-brand-forest/20" />
              📍 Định vị theo vị trí hiện tại (GPS Map)
            </>
          )}
        </button>
      </div>

      {/* Progress step indicators */}
      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#999]">
        <span className={currentStep === 1 ? 'text-brand-forest font-extrabold' : ''}>Tỉnh Thành</span>
        <span>/</span>
        <span className={currentStep === 2 ? 'text-brand-forest font-extrabold' : ''}>Quận Huyện</span>
        <span>/</span>
        <span className={currentStep === 3 ? 'text-brand-forest font-extrabold' : ''}>Phường Xã</span>
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder={`Tìm nhanh ${currentStep === 1 ? 'Tỉnh/Thành phố' : currentStep === 2 ? 'Quận/Huyện' : 'Phường/Xã'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-brand-sand bg-white px-3 py-2.5 text-xs focus:outline-none focus:border-brand-forest rounded-sm placeholder-gray-400"
        />
        {searchQuery && (
          <button 
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-gray-400 hover:text-[#555] cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="overflow-y-auto border border-brand-sand/60 bg-white rounded-sm divide-y divide-brand-sand/30 max-h-[300px]">
        {isLoadingApi ? (
          <div className="p-12 text-center text-xs text-brand-moss font-semibold flex flex-col items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin text-brand-forest" />
            Đang tải danh sách...
          </div>
        ) : (
          <>
            {currentStep === 1 && (
              filteredProvinces.length > 0 ? (
                filteredProvinces.map(prov => (
                  <div
                    key={prov.code}
                    onClick={() => handleSelectProvince(prov)}
                    className="p-3 text-xs text-brand-charcoal hover:bg-brand-cream hover:text-brand-forest cursor-pointer transition-colors font-medium"
                  >
                    {prov.name}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400">Không tìm thấy tỉnh/thành nào.</div>
              )
            )}

            {currentStep === 2 && (
              filteredDistricts.length > 0 ? (
                filteredDistricts.map(dist => (
                  <div
                    key={dist.code}
                    onClick={() => handleSelectDistrict(dist)}
                    className="p-3 text-xs text-brand-charcoal hover:bg-brand-cream hover:text-brand-forest cursor-pointer transition-colors font-medium"
                  >
                    {dist.name}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400">Không tìm thấy quận/huyện nào.</div>
              )
            )}

            {currentStep === 3 && (
              filteredWards.length > 0 ? (
                filteredWards.map(wrd => (
                  <div
                    key={wrd.code}
                    onClick={() => handleSelectWard(wrd)}
                    className="p-3 text-xs text-brand-charcoal hover:bg-brand-cream hover:text-brand-forest cursor-pointer transition-colors font-medium"
                  >
                    {wrd.name}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400">Không tìm thấy phường/xã nào.</div>
              )
            )}
          </>
        )}
      </div>

      {/* Footer controls */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={() => onSelectArea('', '', '', true)} // switch to manual mode
          className="bg-brand-forest/10 hover:bg-brand-forest/20 text-brand-forest text-[10px] font-bold uppercase tracking-wider px-4 py-2 cursor-pointer transition-colors"
        >
          Tự gõ tay
        </button>
      </div>

    </div>
  );
});

export default AreaSelector;
