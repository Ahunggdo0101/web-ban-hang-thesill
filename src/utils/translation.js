/**
 * Hàm tiện ích dịch các thuật ngữ tiếng Anh giao diện sang tiếng Việt
 */

export const translatePotColor = (colorName) => {
  if (!colorName) return '';
  const map = {
    'Terracotta': 'Đất nung',
    'Cream': 'Kem',
    'Mint': 'Bạc hà',
    'Charcoal': 'Than củi'
  };
  return map[colorName] || colorName;
};

export const translatePotStyle = (styleName) => {
  if (!styleName) return '';
  const map = {
    'Classic Ceramic': 'Chậu gốm cổ điển',
    'Earthenware Pot': 'Chậu đất nung mộc',
    'Plastic Grow Pot': 'Chậu nhựa ươm'
  };
  return map[styleName] || styleName;
};

export const translatePotStyleShort = (styleName) => {
  if (!styleName) return '';
  const map = {
    'Classic Ceramic': 'Chậu gốm',
    'Earthenware Pot': 'Chậu đất',
    'Plastic Grow Pot': 'Chậu ươm'
  };
  return map[styleName] || styleName.split(' ')[0];
};

export const formatVND = (value) => {
  if (value === undefined || value === null) return '';
  const numValue = Number(value);
  const vndValue = numValue * 1000;
  return vndValue.toLocaleString('vi-VN') + ' đ';
};

