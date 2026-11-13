// Chạy 1 lần để nhập dữ liệu từ Google Sheet vào Firestore. Chạy lại cũng an toàn (không bị trùng).
import admin from 'firebase-admin';

const DATA = {
 "2026-10": [
  {
   "id": "imp-2026-10-001",
   "d": "2026-10-31",
   "t": "gửi xe db",
   "a": 5000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-002",
   "d": "2026-10-31",
   "t": "đá bóng",
   "a": 60000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-003",
   "d": "2026-10-30",
   "t": "ăn tối",
   "a": 55000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-004",
   "d": "2026-10-30",
   "t": "bò húc",
   "a": 16000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-005",
   "d": "2026-10-29",
   "t": "gửi xe",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-006",
   "d": "2026-10-29",
   "t": "xem phim",
   "a": 140000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-007",
   "d": "2026-10-29",
   "t": "đi ăn",
   "a": 105000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-008",
   "d": "2026-10-28",
   "t": "gửi xe sáng",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-009",
   "d": "2026-10-28",
   "t": "đá bóng",
   "a": 34000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-010",
   "d": "2026-10-28",
   "t": "gửi xe db",
   "a": 5000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-011",
   "d": "2026-10-27",
   "t": "gửi xe cả ng",
   "a": 6000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-012",
   "d": "2026-10-27",
   "t": "xôi",
   "a": 25000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-013",
   "d": "2026-10-27",
   "t": "nhân trần",
   "a": 10000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-014",
   "d": "2026-10-27",
   "t": "bò húc",
   "a": 15000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-015",
   "d": "2026-10-26",
   "t": "gửi xe cả ng",
   "a": 8000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-016",
   "d": "2026-10-26",
   "t": "cắt tóc",
   "a": 80000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-017",
   "d": "2026-10-26",
   "t": "bánh mì",
   "a": 25000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-018",
   "d": "2026-10-26",
   "t": "chai nước",
   "a": 12000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-019",
   "d": "2026-10-25",
   "t": "Hôm nay không chi",
   "a": 0,
   "k": "VND",
   "c": "none",
   "n": ""
  },
  {
   "id": "imp-2026-10-020",
   "d": "2026-10-24",
   "t": "đá bóng",
   "a": 40000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-021",
   "d": "2026-10-23",
   "t": "gửi xe cả ng",
   "a": 8000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-022",
   "d": "2026-10-23",
   "t": "xôi",
   "a": 30000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-023",
   "d": "2026-10-23",
   "t": "ngô gia",
   "a": 53000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-024",
   "d": "2026-10-23",
   "t": "chai nước x2",
   "a": 24000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-025",
   "d": "2026-10-23",
   "t": "đi vuốt tóc",
   "a": 20000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-026",
   "d": "2026-10-23",
   "t": "in sách",
   "a": 42000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-027",
   "d": "2026-10-23",
   "t": "bmi+nhân trần",
   "a": 35000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-028",
   "d": "2026-10-23",
   "t": "mỳ +trà đá",
   "a": 26000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-029",
   "d": "2026-10-22",
   "t": "chai nước",
   "a": 14000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-030",
   "d": "2026-10-22",
   "t": "gửi xe cả ng",
   "a": 8000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-031",
   "d": "2026-10-21",
   "t": "tiền đá bóng",
   "a": 35000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-032",
   "d": "2026-10-21",
   "t": "ngô gia",
   "a": 28000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-033",
   "d": "2026-10-21",
   "t": "tiền giày đb bù",
   "a": 225000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-034",
   "d": "2026-10-21",
   "t": "gửi xe sáng",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-035",
   "d": "2026-10-20",
   "t": "bánh mì và nhân trần",
   "a": 35000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-036",
   "d": "2026-10-20",
   "t": "mixue",
   "a": 40000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-037",
   "d": "2026-10-20",
   "t": "gửi xe cả ng",
   "a": 8000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-038",
   "d": "2026-10-19",
   "t": "gửi xe cả ng",
   "a": 8000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-039",
   "d": "2026-10-19",
   "t": "hoa tặng mẹ 20/10",
   "a": 180000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-040",
   "d": "2026-10-19",
   "t": "locket gold",
   "a": 49000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-041",
   "d": "2026-10-18",
   "t": "Hôm nay không chi",
   "a": 0,
   "k": "VND",
   "c": "none",
   "n": ""
  },
  {
   "id": "imp-2026-10-042",
   "d": "2026-10-17",
   "t": "tiền khoai tây chiên",
   "a": 45000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-043",
   "d": "2026-10-17",
   "t": "tiền đá bóng",
   "a": 40000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-044",
   "d": "2026-10-17",
   "t": "tiền cà chanh",
   "a": 56000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-045",
   "d": "2026-10-17",
   "t": "tiền cafe",
   "a": 95000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-046",
   "d": "2026-10-17",
   "t": "gửi xe x2",
   "a": 6000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-047",
   "d": "2026-10-16",
   "t": "tiền cafe",
   "a": 47500,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-048",
   "d": "2026-10-16",
   "t": "bánh mì vợ ong vàng",
   "a": 52000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-049",
   "d": "2026-10-16",
   "t": "gửi xe tối",
   "a": 5000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-050",
   "d": "2026-10-15",
   "t": "mua nước uống (mixue)",
   "a": 22000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-051",
   "d": "2026-10-15",
   "t": "gửi xe tối",
   "a": 5000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-052",
   "d": "2026-10-15",
   "t": "gửi xe sáng",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-053",
   "d": "2026-10-15",
   "t": "quà sn",
   "a": 290000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-054",
   "d": "2026-10-15",
   "t": "ăn sn hm",
   "a": 126000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-055",
   "d": "2026-10-15",
   "t": "gửi xe",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-056",
   "d": "2026-10-15",
   "t": "vở bút",
   "a": 45000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-057",
   "d": "2026-10-15",
   "t": "xăng",
   "a": 90000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-058",
   "d": "2026-10-14",
   "t": "Áo real dài tay",
   "a": 285000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-059",
   "d": "2026-10-14",
   "t": "Kẹo ngậm ho",
   "a": 44000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-060",
   "d": "2026-10-14",
   "t": "Nước nhỏ mắt",
   "a": 4000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-061",
   "d": "2026-10-14",
   "t": "Ăn xôi",
   "a": 30000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-062",
   "d": "2026-10-14",
   "t": "Gửi xe",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-063",
   "d": "2026-10-13",
   "t": "Đi chơi",
   "a": 109000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-064",
   "d": "2026-10-13",
   "t": "Gửi xe tối",
   "a": 5000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-065",
   "d": "2026-10-13",
   "t": "Bánh bao",
   "a": 17000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-066",
   "d": "2026-10-13",
   "t": "Mua nước uống",
   "a": 20000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-067",
   "d": "2026-10-13",
   "t": "Gửi xe",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-068",
   "d": "2026-10-12",
   "t": "Bánh đa trộn",
   "a": 40000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-069",
   "d": "2026-10-12",
   "t": "ăn trưa(bánh đa trộn)",
   "a": 30000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-070",
   "d": "2026-10-12",
   "t": "chai nước",
   "a": 12000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-071",
   "d": "2026-10-11",
   "t": "gửi xe",
   "a": 3000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-072",
   "d": "2026-10-11",
   "t": "cafe đi học",
   "a": 50000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-073",
   "d": "2026-10-11",
   "t": "Xăng",
   "a": 90000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-074",
   "d": "2026-10-11",
   "t": "Gửi xe",
   "a": 10000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-10-075",
   "d": "2026-10-10",
   "t": "Gửi xe ở trg",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-076",
   "d": "2026-10-09",
   "t": "Gửi xe",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-077",
   "d": "2026-10-08",
   "t": "Gửi xe sáng",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-10-078",
   "d": "2026-10-08",
   "t": "bme cho",
   "a": 2500000,
   "k": "VND",
   "c": "Allowance",
   "n": ""
  },
  {
   "id": "imp-2026-10-079",
   "d": "2026-10-08",
   "t": "Anh Dương cho",
   "a": 2000000,
   "k": "VND",
   "c": "Allowance",
   "n": ""
  },
  {
   "id": "imp-2026-10-080",
   "d": "2026-10-08",
   "t": "Gửi xe tối",
   "a": 5000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  }
 ],
 "2026-11": [
  {
   "id": "imp-2026-11-001",
   "d": "2026-11-01",
   "t": "Saving",
   "a": 500000,
   "k": "VND",
   "c": "Saving",
   "n": ""
  },
  {
   "id": "imp-2026-11-002",
   "d": "2026-11-01",
   "t": "bme cho",
   "a": 3000000,
   "k": "VND",
   "c": "Allowance",
   "n": ""
  },
  {
   "id": "imp-2026-11-003",
   "d": "2026-11-08",
   "t": "gửi xe đb",
   "a": 5000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-11-004",
   "d": "2026-11-08",
   "t": "Ăn tối nhẹ",
   "a": 90000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-005",
   "d": "2026-11-08",
   "t": "Đá bóng",
   "a": 50000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-006",
   "d": "2026-11-07",
   "t": "Gửi xe",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-007",
   "d": "2026-11-07",
   "t": "Ăn tối",
   "a": 60000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-11-008",
   "d": "2026-11-06",
   "t": "Cafe",
   "a": 55000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-11-009",
   "d": "2026-11-05",
   "t": "gửi xe sáng",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-010",
   "d": "2026-11-05",
   "t": "đi chơi",
   "a": 65000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-11-011",
   "d": "2026-11-04",
   "t": "dán cổ chân",
   "a": 30000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-012",
   "d": "2026-11-04",
   "t": "gửi xe db",
   "a": 5000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-013",
   "d": "2026-11-04",
   "t": "đá bóng",
   "a": 25000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-014",
   "d": "2026-11-03",
   "t": "đki btl",
   "a": 70000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-015",
   "d": "2026-11-03",
   "t": "nhân trần",
   "a": 20000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-11-016",
   "d": "2026-11-02",
   "t": "cafe",
   "a": 5000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-11-017",
   "d": "2026-11-02",
   "t": "gửi xe sáng",
   "a": 3000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-018",
   "d": "2026-11-01",
   "t": "đi chơi",
   "a": 70000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-11-019",
   "d": "2026-11-01",
   "t": "ăn trưa",
   "a": 100000,
   "k": "VND",
   "c": "Wanted",
   "n": ""
  },
  {
   "id": "imp-2026-11-020",
   "d": "2026-11-01",
   "t": "dán cổ chân",
   "a": 50000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  },
  {
   "id": "imp-2026-11-021",
   "d": "2026-11-01",
   "t": "gửi xe db",
   "a": 5000,
   "k": "VND",
   "c": "Needed",
   "n": ""
  }
 ]
};

const { FIREBASE_SERVICE_ACCOUNT } = process.env;
if (!FIREBASE_SERVICE_ACCOUNT) { console.error('Thiếu secret FIREBASE_SERVICE_ACCOUNT'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();

for (const [ym, items] of Object.entries(DATA)) {
  const ref = db.collection('ledger').doc('m-' + ym);
  const snap = await ref.get();
  const old = snap.exists && Array.isArray(snap.data().items) ? snap.data().items : [];
  const have = new Set(old.map(i => i.id));
  const add = items.filter(i => !have.has(i.id));
  await ref.set({ ym, items: old.concat(add) });
  console.log(ym + ': giữ ' + old.length + ' khoản cũ, thêm ' + add.length + ' khoản mới, tổng ' + (old.length + add.length));
}
console.log('Xong.');
