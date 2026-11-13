/* Dán thông tin Firebase của bạn vào đây (Firebase Console > Project settings > Your apps > Web app).
   Các giá trị này KHÔNG phải bí mật: dữ liệu được bảo vệ bằng đăng nhập + firestore.rules. */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDpcp0_767aeyF4qYOUeKHl57i21By_8b0",
  authDomain: "dai-nghia-s-money.firebaseapp.com",
  projectId: "dai-nghia-s-money",
  storageBucket: "dai-nghia-s-money.firebasestorage.app",
  messagingSenderId: "513387124327",
  appId: "1:513387124327:web:ee4f4564c83b8e027626c2"
};
/* Khóa công khai cho thông báo đẩy (khóa riêng nằm trong file nghia-money-secrets.txt, chỉ dán vào GitHub Secrets). */
window.VAPID_PUBLIC_KEY = "BArxgiZMwc_LIsNHjV7oXCEV6282_2Rq4P33M-Yz39eM_lolnxQTu_O-ja9lj0sS_v3C2lo2m-ZhCjkzoojOc-U";
/* Email của chủ sổ: có sổ riêng (ledger_owner), và xem được sổ của tài khoản kia (chỉ xem). Để trống = như cũ, cả 2 dùng chung 1 sổ. */
window.OWNER_EMAIL = "daiduong0106@gmail.com";
