# BỘ QUY ƯỚC & TIÊU CHUẨN LẬP TRÌNH (CODING GUIDELINES)
*Dự án: The Sill Clone (Cửa hàng Cây cảnh Cao cấp)*

Tài liệu này quy định các tiêu chuẩn viết mã nguồn bắt buộc đối với tất cả các nhà phát triển (bao gồm cả các AI coding assistants) khi làm việc trên dự án này để đảm bảo mã nguồn luôn tối ưu, dễ bảo trì, đạt chuẩn mỹ thuật cao và không xảy ra lỗi vận hành.

---

## 1. NGUYÊN TẮC CHUNG (GLOBAL RULES)
*   **Không tự ý xóa code cũ**: Giữ nguyên các comment, docstring và đoạn code không liên quan của tác giả trước trừ khi có yêu cầu cấu trúc lại rõ ràng.
*   **Kiểm tra biên dịch bắt buộc**: Sau mỗi lần chỉnh sửa mã nguồn, **bắt buộc** phải chạy lệnh build thử nghiệm để kiểm tra lỗi cú pháp:
    *   **Frontend**: `npm run build` (tại thư mục gốc)
    *   **Backend**: `npm run build` (tại thư mục `backend/`)
*   **Ngôn ngữ hiển thị**: Toàn bộ giao diện người dùng (UI) và trang quản trị (Admin) phải được Việt hóa 100% bằng ngôn ngữ tinh tế, thanh lịch.

---

## 2. TIÊU CHUẨN FRONTEND (VITE + REACT + TAILWIND/CSS)

### A. Kiến trúc & Quản lý Component (Component-Driven)
*   **Nguyên tắc file nhỏ gọn**: Không viết các file component quá dài (giới hạn tối đa **400 dòng**). Nếu vượt quá, bắt buộc phải chia nhỏ thành các sub-components nằm trong thư mục riêng (Ví dụ: `src/components/Header/`, `src/components/Home/`, `src/components/ProductDetail/`).
*   **Tránh Re-render thừa (Performance)**:
    *   Bọc các hàm xử lý sự kiện truyền xuống component con trong `useCallback`.
    *   Sử dụng `useMemo` cho các phép tính toán phức tạp hoặc lọc dữ liệu.
    *   Sử dụng `React.memo` cho các component con tĩnh để tối ưu hóa CPU.
    *   Sử dụng `passive: true` cho các listener cuộn màn hình (`window.addEventListener('scroll')`).

### B. Mỹ thuật & Typography (Premium Aesthetic)
*   **Font chữ thương hiệu**:
    *   Tiêu đề chính (`h1`, `h2`, `h3`, `h4`) bắt buộc sử dụng font **Domaine Display** sang trọng.
    *   Nội dung văn bản, mô tả, menu bắt buộc sử dụng font **Gill Sans** (fallback về Montserrat/sans-serif).
*   **Tỷ lệ hình ảnh**:
    *   Tất cả ảnh sản phẩm và ảnh danh mục trong các thẻ/lưới hiển thị phải tuân thủ tỷ lệ **`aspect-[4/5]`** ($360\text{px} \times 450\text{px}$) chuẩn phong cách tạp chí nghệ thuật.
    *   Không sử dụng bo góc quá đà cho ảnh sản phẩm, sử dụng `rounded-none` hoặc tối đa `rounded-sm` để giữ nét vuông vắn cao cấp.
*   **Bố cục & Khoảng trắng (Editorial Layout)**:
    *   Lề trái/phải trên desktop lớn (`xl`) phải được khóa cố định ở mức **`xl:px-[146px]`** (tương đương khoảng cách đo thực tế cách viền màn hình đúng 146px hoặc 246px tùy cấu hình khung).
    *   Khoảng cách lưới sản phẩm (grid gap) phải khít khao và thanh lịch: sử dụng **`gap-x-[12px]`** hoặc **`gap-x-[20px]`** thay vì các khoảng gap quá rộng làm loãng thiết kế.
    *   Không bọc viền hộp hay đổ bóng thô cứng (`shadow-lg`, `border-gray-300`) xung quanh ảnh sản phẩm, để ảnh hiển thị tràn viền tự nhiên trên nền trắng/kem (`#f9f8f7`).
*   **Responsive**: Tất cả giao diện phải được thiết kế theo tư duy **Mobile-First**. Kiểm thử tối ưu hiển thị mượt mà trên cả các thiết bị màn hình nhỏ (từ 320px như iPhone SE) đến màn hình máy tính lớn.

---

## 3. TIÊU CHUẨN BACKEND (NESTJS + TYPESCRIPT + PRISMA)

### A. Quy trình cập nhật Database & Prisma
Khi có bất kỳ thay đổi nào liên quan đến cấu trúc cơ sở dữ liệu (`backend/prisma/schema.prisma`), nhà phát triển **bắt buộc** phải tuân thủ đúng 3 bước theo thứ tự sau để tránh lỗi mất đồng bộ kiểu dữ liệu (Type compilation error):
1.  **Bước 1 - Tạo Migration**: Chạy lệnh di trú database thực tế:
    ```bash
    npx prisma migrate dev --name <tên_chức_năng>
    ```
2.  **Bước 2 - Generate Prisma Client**: Sinh lại định nghĩa kiểu dữ liệu TypeScript mới nhất cho Prisma Client:
    ```bash
    npx prisma generate
    ```
3.  **Bước 3 - Build & Restart**: Build lại backend để trình biên dịch NestJS nhận diện thuộc tính mới và khởi động lại server.

### B. Kiến trúc mã nguồn (Clean Architecture)
*   **Controller Layer**: Chỉ làm nhiệm vụ điều phối request HTTP, nhận tham số, phân quyền và trả về dữ liệu. Không viết logic nghiệp vụ (business logic) tại đây.
*   **Service Layer**: Nơi xử lý 100% logic nghiệp vụ, giao tiếp cơ sở dữ liệu qua Prisma.
*   **Data Transfer Object (DTO)**: Tất cả dữ liệu đầu vào gửi lên qua HTTP POST/PATCH/PUT bắt buộc phải được định nghĩa bằng Class DTO và được validate chặt chẽ bằng các decorators của `class-validator` (như `@IsString()`, `@IsNumber()`, `@IsBoolean()`, `@IsOptional()`).

### C. Quản lý lỗi & Dữ liệu
*   Luôn sử dụng `HttpException` (hoặc các lớp con của nó như `BadRequestException`, `NotFoundException`) để trả về thông báo lỗi chi tiết cho client thay vì quăng lỗi thô (`throw new Error()`).
*   Đối với các giao dịch quan trọng (tạo đơn hàng, thanh toán), hãy bọc trong Prisma Transaction (`prisma.$transaction`) để đảm bảo tính toàn vẹn dữ liệu.

---

## 4. QUY ƯỚC RIÊNG CHO AI CODING ASSISTANT
*   **Đọc kỹ file này**: Trước khi viết bất kỳ đoạn code nào, hãy tự động quét và ghi nhớ bộ quy ước này để áp dụng.
*   **Không code tắt, không tạo placeholder**: Viết code hoàn thiện 100%, không sử dụng các đoạn comment kiểu `// TODO: implement later` hoặc code mẫu giả lập.
*   **Giải thích rõ ràng**: Khi báo cáo kết quả, hãy sử dụng tiếng Việt chuyên nghiệp, giải thích rõ những file nào đã sửa đổi, rationale (lý do thiết kế) đằng sau đó và kết quả biên dịch thực tế.
