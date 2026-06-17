const getApiBaseUrl = () => {
  // Tự động phát hiện nếu trình duyệt đang chạy ở môi trường localhost
  const isLocalhost = 
    typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     window.location.hostname.startsWith('192.168.') ||
     window.location.hostname.startsWith('10.') ||
     window.location.hostname.startsWith('172.') ||
     window.location.hostname.endsWith('.local'));

  if (isLocalhost) {
    return `http://${window.location.hostname}:3005/api`;
  }

  // Sử dụng biến môi trường trên Production (hoặc fallback về Render URL)
  return import.meta.env.VITE_API_BASE_URL || 'https://web-ban-hang-thesill.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();


