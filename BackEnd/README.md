# Intercity Bus API (NestJS)

بديل NestJS لواجهة Express الموجودة في `BackEnd`، يستخدم MongoDB/Mongoose ويحافظ على بادئة `/api` وعقود الاستجابات الحالية.

## التشغيل

1. انسخ `.env.example` إلى `.env` واضبط `MONGO_URI` و`JWT_SECRET`.
2. من هذا المجلد شغّل:

```powershell
npm install
npm run start:dev
```

يبني المشروع باستخدام `npm run build` ويعمل إنتاجياً باستخدام `npm run start:prod`. المنفذ الافتراضي `5000`.

## المسارات

- `GET /` فحص الصحة.
- `/api/auth`: التسجيل، الدخول، والملف الشخصي.
- `/api/users`: إدارة المستخدمين.
- `/api/buses`: إدارة الحافلات والمقاعد.
- `/api/trips`: الرحلات والجداول المتكررة.
- `/api/reservations`: الحجوزات والدفع التجريبي.
- `GET /api/trips/:tripId/seats`: توفر مقاعد الرحلة.

تظل عملية الدفع محاكاة فقط كما في التطبيق الأصلي. لا تنسخ ملف `.env` من نسخة Express؛ أنشئ ملفاً محلياً جديداً من المثال.
