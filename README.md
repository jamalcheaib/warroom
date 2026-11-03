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
- الأماكن التي لم تُحسم تُكتب في `data/geo/unresolved.json` لاستكمالها يدوياً في `manual.json`.

لتنزيل القاموس:

```bash
mkdir -p geomelon/lebanon geomelon/israel
curl -sL https://registry.npmjs.org/@geomelon/lebanon/-/lebanon-1.0.0.tgz | tar xz -C geomelon/lebanon
curl -sL https://registry.npmjs.org/@geomelon/israel/-/israel-1.0.0.tgz | tar xz -C geomelon/israel
```

## الصفحات

| المسار | المحتوى |
|---|---|
| `/` | السجل الميداني لآخر يوم |
| `/log/<YYYY-MM-DD>` | السجل الميداني ليوم محدد (صفحات ثابتة) |
| `/archive` | أرشيف الرصد الآلي القديم (28 شباط – 17 نيسان 2026) |
| `/losses`، `/analysis` | الصفحات السابقة |

## التطوير

```bash
npm install
npm run dev
```
