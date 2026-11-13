# Nghĩa Béo Money

Sổ thu chi cài lên màn hình iPhone (PWA). Chỉ 2 tài khoản vào được, dữ liệu dùng chung, có nhắc hằng ngày.

## Cài đặt (làm 1 lần, khoảng 20 phút)

### 1. Firebase (miễn phí, gói Spark)
1. Vào https://console.firebase.google.com → Add project.
2. Build → Authentication → Get started → bật **Email/Password**. Tab Users → Add user: tạo đúng 2 tài khoản (email + mật khẩu) cho 2 người.
3. Build → Firestore Database → Create database (production mode).
4. Firestore → tab Rules: dán nội dung `firestore.rules`, **đổi 2 email** thành 2 email vừa tạo → Publish.
5. Project settings → Your apps → Web (`</>`) → đăng ký app → copy `firebaseConfig` dán vào `public/firebase-config.js`.
6. Project settings → Service accounts → Generate new private key → tải file JSON (dùng ở bước 3, không commit).

### 2. GitHub
1. Tạo repo **public** (GitHub Pages miễn phí chỉ chạy với repo public; code công khai nhưng dữ liệu vẫn khóa bằng đăng nhập + rules).
2. Upload toàn bộ thư mục này lên nhánh `main`.
3. Settings → Pages → Source: **GitHub Actions**. App sẽ ở `https://<username>.github.io/<repo>/`.
4. Firebase → Authentication → Settings → Authorized domains → thêm `<username>.github.io`.

### 3. Nhắc hằng ngày (thông báo đẩy)
Repo → Settings → Secrets and variables → Actions → New repository secret, tạo 4 cái:
- `FIREBASE_SERVICE_ACCOUNT`: toàn bộ nội dung file JSON ở bước 1.6
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`: lấy trong file `nghia-money-secrets.txt`
- `VAPID_SUBJECT`: `mailto:<email của bạn>`

### 4. Trên iPhone (mỗi người làm 1 lần)
1. Mở link app bằng **Safari** → nút Chia sẻ → **Thêm vào MH chính**.
2. Mở app từ icon, đăng nhập.
3. Bấm 🔔 → chọn giờ → **Bật thông báo** → Cho phép. (Cần iOS 16.4+.)
4. Hoặc bấm "tải lịch nhắc (.ics)" để thêm sự kiện lặp hằng ngày vào Lịch iPhone.

## Ghi chú
- Thông báo chỉ gửi khi hôm đó **chưa ghi khoản nào**. GitHub chạy lịch 15 phút/lần và có thể trễ 5–30 phút.
- GitHub tự tắt lịch chạy nếu repo không có commit nào trong 60 ngày; vào tab Actions bật lại là được.
- Đổi người được vào: sửa email trong Firestore Rules và tài khoản trong Authentication.
