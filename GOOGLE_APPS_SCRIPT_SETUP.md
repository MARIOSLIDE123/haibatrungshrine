# HƯỚNG DẪN KẾT NỐI GOOGLE SHEET QUA GOOGLE APPS SCRIPT
## Ứng dụng Di tích Lịch sử Đền Hai Bà Trưng (Tiếng Anh Lớp 6)

Hệ thống cho phép:
1. Tự động ghi nhận thông tin học sinh: **Họ và tên, Trường, Lớp** ngay khi bắt đầu.
2. Cập nhật **Điểm số**, **Thời gian học** và **Hoạt động** theo thời gian thực (real-time).
3. Hiển thị **Bảng xếp hạng toàn quốc** trực tiếp từ Google Sheet.

---

### BƯỚC 1: TẠO GOOGLE SHEET VÀ MỞ APPS SCRIPT
1. Truy cập [Google Sheets (Trang tính)](https://sheets.google.com) và tạo một Trang tính mới (ví dụ đặt tên: `Bảng Xếp Hạng Đền Hai Bà Trưng`).
2. Trên thanh menu phía trên, chọn **Tiện ích mở rộng** (Extensions) -> **Apps Script**.

---

### BƯỚC 2: DÁN MÃ NGUỒN APPS SCRIPT
1. Xóa toàn bộ nội dung mặc định trong tệp `Code.gs`.
2. Mở file `google_apps_script.js` trong thư mục dự án này, copy toàn bộ nội dung và dán vào trình soạn thảo Apps Script.
3. Nhấn tổ hợp phím **Ctrl + S** (hoặc nhấn biểu tượng Đĩa mềm) để lưu dự án.

---

### BƯỚC 3: TRIỂN KHAI DƯỚI DẠNG WEB APP (CỰC KỲ QUAN TRỌNG)
1. Ở góc trên bên phải, nhấn nút **Triển khai** (Deploy) -> chọn **Tùy chọn triển khai mới** (New deployment).
2. Nhấn vào biểu tượng **Bánh răng cài đặt** (Select type) -> chọn **Ứng dụng web** (Web app).
3. Điền các mục như sau:
   - **Mô tả (Description)**: `HBT Shrine Ranking API`
   - **Thực thi dưới dạng (Execute as)**: `Tôi` (`Me - email của bạn`)
   - **Ai có quyền truy cập (Who has access)**: **`Bất kỳ ai` (`Anyone`)** *(Lưu ý: Bắt buộc chọn "Bất kỳ ai" để học sinh không cần đăng nhập tài khoản Google của bạn)*.
4. Nhấn **Triển khai** (Deploy).
5. Google sẽ yêu cầu "Ủy quyền truy cập" (Authorize access) -> Chọn tài khoản Google của bạn -> Bấm "Advanced" (Nâng cao) -> Bấm "Go to ... (unsafe)" -> Bấm "Allow" (Cho phép).
6. Sau khi hoàn tất, sao chép đường link **URL ứng dụng web** (Web app URL) có dạng:  
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

### BƯỚC 4: KẾT NỐI VÀO ỨNG DỤNG
1. Mở ứng dụng, nhấn vào nút **Hồ sơ học sinh** trên thanh công cụ (Toolbar).
2. Chọn tab hoặc nút **Cài đặt Google Sheet**.
3. Dán đường dẫn Web app URL vừa copy vào ô nhập và bấm **Lưu kết nối**.
4. Ứng dụng sẽ tự động đồng bộ điểm số và bảng xếp hạng trực tiếp từ Google Sheet của bạn!

*(Lưu ý: Nếu chưa dán URL, ứng dụng vẫn hoạt động bình thường với bảng xếp hạng toàn quốc mô phỏng từ các trường trên toàn quốc và lưu trữ tại máy!)*
