// Chạy bởi GitHub Actions mỗi 15 phút. Gửi thông báo đẩy tới iPhone nếu đến giờ nhắc và hôm nay chưa ghi khoản nào.
import admin from 'firebase-admin';
import webpush from 'web-push';

const { FIREBASE_SERVICE_ACCOUNT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
if (!FIREBASE_SERVICE_ACCOUNT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) { console.error('Thiếu secrets'); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) });
webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const db = admin.firestore();

function localNow(tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map(x => [x.type, x.value]));
  return { today: `${p.year}-${p.month}-${p.day}`, min: +p.hour * 60 + +p.minute };
}

const snap = await db.collection('reminders').get();
for (const doc of snap.docs) {
  const x = doc.data();
  if (!x.sub || !x.time) continue;
  const { today, min } = localNow(x.tz || 'America/Toronto');
  const [h, m] = x.time.split(':').map(Number);
  const target = h * 60 + m;
  if (x.lastSent === today) continue;
  if (min < target || min > target + 180) continue; // chưa tới giờ, hoặc trễ quá 3 tiếng thì bỏ qua hôm nay
  const led = await db.collection('ledger').doc('m-' + today.slice(0, 7)).get();
  const logged = led.exists && (led.data().items || []).some(i => i.d === today);
  if (logged) { await doc.ref.update({ lastSent: today }); console.log('đã ghi hôm nay, bỏ qua', x.email); continue; }
  try {
    await webpush.sendNotification(x.sub, JSON.stringify({ title: 'Nghĩa Béo Money', body: 'Hôm nay chưa ghi thu chi. Ghi nhanh nhé!', url: './' }));
    await doc.ref.update({ lastSent: today });
    console.log('đã gửi', x.email);
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) { await doc.ref.delete(); console.log('subscription hết hạn, đã xóa', x.email); }
    else console.error('lỗi gửi', x.email, e.statusCode || e.message);
  }
}
