# غرفة الحرب — السجل الميداني للجبهة اللبنانية

موقع Next.js يعرض رصداً يومياً موثّقاً للجبهة اللبنانية: عمليات المقاومة، واعتداءات العدو، والمسار السياسي، والأثر المعلن.

## تحديث البيانات من ملف Excel

```bash
pip install openpyxl
python3 scripts/import_xlsx.py path/to/warroom_YYYY-MM-DD.xlsx --geomelon path/to/geomelon
```

- يقرأ الأوراق: «الأحداث» و«الأثر المعلن».
- يكتب `data/events/<التاريخ>.json` لكل يوم، و`data/index.json` للإحصاءات.
- الإحداثيات تُحسم بالترتيب التالي:
  1. `data/geo/manual.json`: تصحيحات يدوية وأسماء بديلة وأماكن على مستوى المنطقة.
  2. قاموس Wikidata المفتوح (CC0)، أي حزم npm ‏`@geomelon/lebanon` و`@geomelon/israel`، ويُمرَّر مجلدها عبر `--geomelon`.
  3. الإحداثيات المكتوبة في ملف Excel، إن وُجدت.
- قبل تحديد الإحداثيات، يُنظَّف عمود «الموقع» وفق `data/geo/location-fixes.json`:
  - حذف العبارات التي ليست أماكن، مثل «العدو الاسرائيلي» و«5 كلم».
  - قصّ اللواحق، مثل «علي النحو الاتي» و«بدفعات».
  - تصحيح الإملاء.
  - تقسيم الخانة التي تذكر عدة أماكن، فيظهر الحدث على الخريطة في كل مكان منها.
- كل تعديل من هذا النوع يُسجَّل في `data/geo/location-report.json`، لتصحيحه في ملف Excel الأصلي أيضاً.
- الأماكن التي لم تُحسم تُكتب في `data/geo/unresolved.json` لاستكمالها يدوياً في `manual.json`. يمكن هناك تحديد نوع المكان (`kind`): مزرعة `farm`، أو موقع عسكري `position`، أو منطقة `area`.

لتنزيل القاموس:

```bash
mkdir -p geomelon/lebanon geomelon/israel
curl -sL https://registry.npmjs.org/@geomelon/lebanon/-/lebanon-1.0.0.tgz | tar xz -C geomelon/lebanon
curl -sL https://registry.npmjs.org/@geomelon/israel/-/israel-1.0.0.tgz | tar xz -C geomelon/israel
```

## الصفحات

| المسار | المحتوى |
|---|---|
| `/` | لوحة الجبهة: الأرقام الكلية، والإيقاع الأسبوعي، والتوزيعات، وحصاد الأشهر، وآخر الأحداث |
| `/log`، `/log/<YYYY-MM-DD>` | السجل الميداني اليومي (صفحات ثابتة) |
| `/map` | الخريطة الزمنية مع التشغيل يوماً بيوم (البيانات من `public/data/map.json`) |
| `/impact` | الأثر المعلن مربوطاً بالعمليات (حلّت محل `/losses`، والرابط القديم يحوّل إليها) |
| `/archive`، `/archive/losses` | أرشيف الرصد الآلي القديم وصفحة الخسائر القديمة |
| `/analysis` | التحليلات |

المحطات المعلَّمة على المنحنيات (مثل وقف إطلاق النار) تُضاف في `src/data/annotations.ts`.

## التطوير

```bash
npm install
npm run dev
```
