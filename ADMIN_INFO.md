# THÔNG TIN QUẢN TRỊ WEBSITE - CÂY CẢNH NAM ĐIỀN

Tài liệu này lưu trữ các tài khoản quản trị quan trọng của website để anh Đỗ Xuân Hùng tra cứu khi quên.

---

## 1. TÀI KHOẢN ADMIN WEBSITE (Đăng nhập trên Web)
Dùng để truy cập trang quản trị sản phẩm, xem đơn hàng, quản lý người dùng tại link:
* **Đường dẫn Admin**: https://caycanhnamdien.vercel.app/admin (Hoặc click vào ảnh đại diện sau khi đăng nhập tài khoản Admin)

### Thông tin tài khoản Admin mặc định:
* **Email**: `dohungg0101@gmail.com`
* **Mật khẩu**: `admin`

---

## 2. TÀI KHOẢN KHÁCH HÀNG MẪU (Để kiểm tra đặt hàng)
Dùng để đăng nhập thử nghiệm với vai trò người mua hàng thông thường:
* **Email**: `khachhang@caycanhnamdinh.vn`
* **Mật khẩu**: `password123`

---

## 3. CÁC TÀI KHOẢN CLOUD HOSTING & DATABASE
Khi cần cấu hình hệ thống, sửa đổi database hoặc thay đổi cài đặt sâu hơn:

### A. Github (Quản lý mã nguồn)
* **Tài khoản**: `ahunggdo0101`
* **Email liên kết**: `dohungg0101@gmail.com`
* **Công dụng**: Chứa toàn bộ mã nguồn của dự án. Khi push code lên đây, Vercel và Render sẽ tự động cập nhật web.

### B. Vercel (Quản lý giao diện Web - Frontend)
* **Đường dẫn**: https://vercel.com/
* **Đăng nhập bằng**: Tài khoản GitHub (`ahunggdo0101`)
* **Dự án**: `web-ban-hang-the-sill` (Đang trỏ tên miền về https://caycanhnamdien.vercel.app)
* **Cấu hình API**: Biến môi trường `VITE_API_BASE_URL` = `https://web-ban-hang-thesill.onrender.com/api`

### C. Render (Quản lý máy chủ API - Backend)
* **Đường dẫn**: https://dashboard.render.com/
* **Đăng nhập bằng**: Tài khoản GitHub (`ahunggdo0101`)
* **Dịch vụ**: Web Service chạy API backend của dự án.
* **Đường dẫn API**: `https://web-ban-hang-thesill.onrender.com`

### D. Supabase (Cơ sở dữ liệu - Database)
* **Đường dẫn**: https://supabase.com/
* **Đăng nhập bằng**: Tài khoản GitHub (`ahunggdo0101`) hoặc email `dohungg0101@gmail.com`
* **Công dụng**: Chứa tất cả sản phẩm, thông tin khách hàng, và các đơn đặt hàng.
