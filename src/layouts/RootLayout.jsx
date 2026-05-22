import { Outlet, ScrollRestoration } from 'react-router-dom';
import ToastContainer from '../components/ToastContainer';
import ScrollProgress from '../components/ScrollProgress';
import BackToTop from '../components/BackToTop';

/**
 * RootLayout là layout gốc trên cùng (Top-level Wrapper).
 * Nơi lưu trữ các thành phần toàn cục của React Router như khôi phục vị trí cuộn trang.
 */
export default function RootLayout() {
  return (
    <>
      <ScrollProgress />
      <Outlet />
      <BackToTop />
      <ToastContainer />
      <ScrollRestoration />
    </>
  );
}
