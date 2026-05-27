// Tự động reload trang khi gặp lỗi tải chunk cũ sau khi deploy bản mới (tránh lỗi cache trình duyệt)
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('Failed to fetch dynamically imported module')) {
    const hasReloaded = sessionStorage.getItem('chunk-reload-timestamp');
    const now = Date.now();
    if (!hasReloaded || now - parseInt(hasReloaded, 10) > 10000) {
      sessionStorage.setItem('chunk-reload-timestamp', now.toString());
      window.location.reload();
    }
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && e.reason.message.includes('Failed to fetch dynamically imported module')) {
    const hasReloaded = sessionStorage.getItem('chunk-reload-timestamp');
    const now = Date.now();
    if (!hasReloaded || now - parseInt(hasReloaded, 10) > 10000) {
      sessionStorage.setItem('chunk-reload-timestamp', now.toString());
      window.location.reload();
    }
  }
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
