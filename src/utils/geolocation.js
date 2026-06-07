/**
 * Geolocation utility for retrieving and reverse-geocoding the user's current location.
 */

export const getCurrentGPSCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Trình duyệt của bạn không hỗ trợ định vị GPS.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Không thể lấy vị trí hiện tại.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Vui lòng cho phép quyền truy cập vị trí (GPS) trên trình duyệt.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Thông tin vị trí không khả dụng.';
            break;
          case error.TIMEOUT:
            msg = 'Hết thời gian yêu cầu định vị.';
            break;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

export const getAddressFromCoordinates = async (latitude, longitude) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=vi&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
  
  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'vi,en;q=0.9',
      'User-Agent': 'TheSillCloneCustomerApp/1.0' // OpenStreetMap Nominatim requires a User-Agent
    }
  });

  if (!response.ok) {
    throw new Error('Không thể kết nối đến máy chủ định vị địa chỉ.');
  }

  const data = await response.json();
  if (!data || !data.address) {
    throw new Error('Không tìm thấy thông tin địa chỉ cho tọa độ này.');
  }

  const addr = data.address;

  // Phân tích tỉnh/thành phố
  const province = addr.city || addr.province || addr.state || addr.municipality || '';
  
  // Phân tích quận/huyện
  const district = addr.suburb || addr.district || addr.county || addr.city_district || '';

  // Phân tích phường/xã
  const ward = addr.quarter || addr.neighbourhood || addr.village || addr.town || addr.hamlet || addr.ward || '';

  // Phân tích số nhà/tên đường
  const houseNumber = addr.house_number || '';
  const road = addr.road || '';
  const streetAddress = [houseNumber, road].filter(Boolean).join(' ');

  // Tạo chuỗi địa chỉ hoàn chỉnh
  const cleanProvince = province.replace(/^(Tỉnh|Thành phố)\s+/i, '');
  const cleanDistrict = district.replace(/^(Quận|Huyện|Thị xã|Thành phố)\s+/i, '');
  const cleanWard = ward.replace(/^(Phường|Xã|Thị trấn)\s+/i, '');

  return {
    province: cleanProvince ? (province.startsWith('Thành phố') || province.startsWith('Tỉnh') ? province : `Tỉnh ${province}`) : '',
    district: cleanDistrict ? (district.startsWith('Quận') || district.startsWith('Huyện') || district.startsWith('Thị xã') || district.startsWith('Thành phố') ? district : `Quận/Huyện ${district}`) : '',
    ward: cleanWard ? (ward.startsWith('Phường') || ward.startsWith('Xã') || ward.startsWith('Thị trấn') ? ward : `Phường/Xã ${ward}`) : '',
    streetAddress,
    displayName: data.display_name || ''
  };
};
