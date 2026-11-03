#!/usr/bin/env python3
"""
ملف مراجعة الأماكن: تصدير الأماكن التي تحتاج مراجعة إلى Excel، ثم تطبيق التعديلات.

    python3 scripts/places_sheet.py export  out.xlsx
    python3 scripts/places_sheet.py apply   filled.xlsx

بعد «apply» أعد تشغيل scripts/import_xlsx.py لتظهر التعديلات في الموقع.
"""
import collections
import glob
import json
import os
import sys

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEO = os.path.join(ROOT, 'data', 'geo')
SITE = 'https://warroom-ecru.vercel.app'

KINDS = {
    'بلدة / قرية': 'town',
    'مستوطنة': 'town',
    'مزرعة': 'farm',
    'موقع عسكري': 'position',
    'منطقة': 'area',
    'منطقة واسعة (بلا نقطة)': 'region',
    'نهر / معلم طبيعي': 'river',
    'مفهوم عملياتي (بلا نقطة)': 'concept',
    'اسم آخر لمكان موجود': 'alias',
    'ليس مكاناً (يُحذف)': 'drop',
}
KIND_BACK = {'farm': 'مزرعة', 'position': 'موقع عسكري', 'area': 'منطقة', 'region': 'منطقة واسعة (بلا نقطة)',
             'river': 'نهر / معلم طبيعي', 'concept': 'مفهوم عملياتي (بلا نقطة)'}
NO_POINT = {'region', 'concept'}

HEAD = ['الاسم كما ورد', 'عدد الذكر', 'أول ذكر', 'رابط السجل', 'مثال من نص الخبر',
        'النوع', 'خط العرض', 'خط الطول', 'اسم بديل لـ', 'ملاحظات',
        'الإحداثيات الحالية', 'المصدر الحالي']
COL = {h: i + 1 for i, h in enumerate(HEAD)}

# ملاحظات أولية من توضيحات جمال شعيب
PREFILL = {
    'الليطاني': ('نهر / معلم طبيعي', '', '', '', 'نهر يقسم الجنوب جغرافياً؛ «جنوب الليطاني» الأراضي بين النهر وفلسطين المحتلة، و«شمال النهر» ما يقع شماله. لا يُمثَّل بنقطة واحدة'),
    'نهر الليطاني': ('اسم آخر لمكان موجود', '', '', 'الليطاني', ''),
    'جنوب الليطاني': ('منطقة', '', '', '', 'الأراضي الواقعة بين نهر الليطاني وحدود فلسطين المحتلة'),
    'الشمال': ('اسم آخر لمكان موجود', '', '', 'شمال فلسطين المحتلة', 'حين ترد «الشمال» فهي في الأغلب شمال فلسطين المحتلة'),
    'شمال فلسطين': ('اسم آخر لمكان موجود', '', '', 'شمال فلسطين المحتلة', ''),
    'شمال إسرائيل': ('اسم آخر لمكان موجود', '', '', 'شمال فلسطين المحتلة', ''),
}


def collect():
    """كل الأماكن المذكورة مع عددها وأول مثال وإحداثياتها الحالية."""
    seen = {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'data', 'events', '*.json'))):
        day = json.load(open(f, encoding='utf-8'))
        for o in day['events'] + day['impact']:
            places = o.get('places') or ([{'name': o['location'], 'lat': o.get('lat'), 'lon': o.get('lon'), 'geo': o.get('geo')}] if o.get('location') else [])
            for p in places:
                r = seen.setdefault(p['name'], {'n': 0, 'first': o['date'], 'id': o['id'], 'text': o['text'], 'lat': p.get('lat'), 'lon': p.get('lon'), 'geo': p.get('geo')})
                r['n'] += 1
    return seen


def export(out):
    seen = collect()
    places = json.load(open(os.path.join(GEO, 'places.json'), encoding='utf-8'))
    manual_all = json.load(open(os.path.join(GEO, 'manual.json'), encoding='utf-8'))
    manual = manual_all['places']

    wb = openpyxl.Workbook()
    intro = wb.active
    intro.title = 'تعليمات'
    intro.sheet_view.rightToLeft = True
    lines = [
        'مراجعة أماكن «غرفة الحرب»',
        '',
        'الورقة «بلا إحداثيات»: أماكن لم تُحدَّد إحداثياتها بعد، مرتبة حسب عدد الذكر.',
        'الورقة «تقديرات للتحقق»: أماكن وضعتُ إحداثياتها تقديراً (≈) أو كمناطق؛ صحّح ما يلزم.',
        'الورقة «من القاموس»: أماكن طُوبقت آلياً مع Wikidata؛ راجع ما تشك فيه فقط.',
        '',
        'لكل صف:',
        '• «النوع»: اختر من القائمة المنسدلة.',
        '• «خط العرض» و«خط الطول»: الصق من خرائط Google (ضغط مطوّل على النقطة) مثل 33.0965 و 35.1744.',
        '  يمكن لصق الرقمين معاً في خانة «خط العرض» بصيغة: 33.0965, 35.1744',
        '• «اسم آخر لمكان موجود»: اكتب في «اسم بديل لـ» الاسم الصحيح (مثل: ديين ← دبين).',
        '• «ليس مكاناً»: يُحذف من خانة الموقع في كل الأحداث.',
        '• «منطقة واسعة» و«مفهوم عملياتي» (مثل جنوب الليطاني، الخط الأصفر): يظهر الاسم ونوعه على البطاقة دون نقطة على الخريطة.',
        '• «نهر / معلم طبيعي»: بلا نقطة إن تُركت الإحداثيات فارغة، أو بنقطة إن وضعت إحداثيات لمقطع محدد.',
        '• «ملاحظات»: أي توضيح (مثل: مزرعة شرق الجرمق). تُحفظ مع المكان.',
        '• اترك الصف فارغاً إن لم تكن متأكداً؛ لن يتغير شيء.',
        '',
        'بعد التعديل ارفع الملف في المحادثة.',
    ]
    for i, t in enumerate(lines, 1):
        intro.cell(i, 1, t).font = Font(bold=(i == 1), size=14 if i == 1 else 11)
    intro.column_dimensions['A'].width = 110

    def sheet(title, rows, fill):
        ws = wb.create_sheet(title)
        ws.sheet_view.rightToLeft = True
        ws.append(HEAD)
        for c in ws[1]:
            c.font = Font(bold=True, color='FFFFFF')
            c.fill = PatternFill('solid', fgColor=fill)
            c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        for r in rows:
            ws.append(r)
        widths = {'الاسم كما ورد': 26, 'عدد الذكر': 9, 'أول ذكر': 12, 'رابط السجل': 16, 'مثال من نص الخبر': 70,
                  'النوع': 20, 'خط العرض': 14, 'خط الطول': 14, 'اسم بديل لـ': 20, 'ملاحظات': 40,
                  'الإحداثيات الحالية': 22, 'المصدر الحالي': 14}
        for h, w in widths.items():
            ws.column_dimensions[openpyxl.utils.get_column_letter(COL[h])].width = w
        for row in ws.iter_rows(min_row=2):
            row[COL['مثال من نص الخبر'] - 1].alignment = Alignment(wrap_text=True, vertical='top')
            link = row[COL['رابط السجل'] - 1]
            if link.value:
                link.hyperlink = link.value
                link.value = 'فتح السجل'
                link.font = Font(color='1F5FBF', underline='single')
            cur = row[COL['الإحداثيات الحالية'] - 1]
            if cur.value and ',' in str(cur.value):
                cur.hyperlink = f'https://www.google.com/maps?q={cur.value.replace(" ", "")}'
                cur.font = Font(color='1F5FBF', underline='single')
        dv = DataValidation(type='list', formula1='"' + ','.join(KINDS) + '"', allow_blank=True)
        ws.add_data_validation(dv)
        col = openpyxl.utils.get_column_letter(COL['النوع'])
        dv.add(f'{col}2:{col}{max(2, ws.max_row)}')
        ws.freeze_panes = 'B2'
        ws.auto_filter.ref = ws.dimensions
        return ws

    def row(name, info, kind='', lat='', lon='', alias='', note='', current='', source=''):
        return [name, info['n'], info['first'], f"{SITE}/log/{info['first']}#{info['id']}", info['text'][:400],
                kind, lat, lon, alias, note, current, source]

    missing = sorted(((k, v) for k, v in seen.items() if v['lat'] is None), key=lambda x: -x[1]['n'])
    pending = manual_all.get('pending', {})
    def pre(k):
        if k in PREFILL:
            return PREFILL[k]
        if k in pending:
            return (KIND_BACK.get(pending[k].get('kind'), ''), '', '', '', pending[k].get('note', ''))
        return ('', '', '', '', '')
    sheet('بلا إحداثيات', [row(k, v, *pre(k)) for k, v in missing], 'B54708')

    guessed = []
    for k, v in sorted(seen.items(), key=lambda x: -x[1]['n']):
        pl = places.get(k)
        if v['lat'] is None or not pl or pl.get('source') not in ('manual', 'excel'):
            continue
        m = manual.get(k)
        if isinstance(m, dict) and m.get('note'):
            continue  # أكّدها جمال شعيب
        kind = KIND_BACK.get(pl.get('kind') or ('area' if pl.get('precision') == 'area' else ''), '')
        guessed.append(row(k, v, kind, '', '', '', '', f"{pl['lat']}, {pl['lon']}", 'تقدير يدوي' if pl['source'] == 'manual' else 'ملف Excel'))
    sheet('تقديرات للتحقق', guessed, '8A6D0B')

    gaz = [row(k, v, '', '', '', '', '', f"{places[k]['lat']}, {places[k]['lon']}", 'Wikidata')
           for k, v in sorted(seen.items(), key=lambda x: -x[1]['n'])
           if places.get(k, {}).get('source') == 'wikidata']
    sheet('من القاموس', gaz, '2F5D50')

    wb.save(out)
    print(f'بلا إحداثيات: {len(missing)} · تقديرات: {len(guessed)} · من القاموس: {len(gaz)} → {out}')


def num(v):
    try:
        return round(float(str(v).strip()), 5)
    except (TypeError, ValueError):
        return None


def apply(path):
    wb = openpyxl.load_workbook(path)
    mp = os.path.join(GEO, 'manual.json')
    fp = os.path.join(GEO, 'location-fixes.json')
    manual = json.load(open(mp, encoding='utf-8'))
    fixes = json.load(open(fp, encoding='utf-8'))
    stats = collections.Counter()
    for ws in wb.worksheets[1:]:
        for r in ws.iter_rows(min_row=2, values_only=True):
            name = (r[COL['الاسم كما ورد'] - 1] or '').strip()
            if not name:
                continue
            kind_ar = (r[COL['النوع'] - 1] or '').strip()
            lat_raw, lon_raw = r[COL['خط العرض'] - 1], r[COL['خط الطول'] - 1]
            alias = (r[COL['اسم بديل لـ'] - 1] or '').strip()
            note = (r[COL['ملاحظات'] - 1] or '').strip()
            if lat_raw and not lon_raw and ',' in str(lat_raw):
                lat_raw, lon_raw = str(lat_raw).split(',', 1)
            lat, lon = num(lat_raw), num(lon_raw)
            kind = KINDS.get(kind_ar)
            if not (kind or lat is not None or alias or note):
                continue
            if kind == 'drop':
                if name not in fixes['drop']:
                    fixes['drop'].append(name)
                manual['places'].pop(name, None)
                stats['حُذف'] += 1
                continue
            if kind == 'alias' or (alias and lat is None):
                if alias:
                    fixes['rename'][name] = alias
                    stats['اسم بديل'] += 1
                if note:
                    fixes.setdefault('notes', {})[name] = note
                continue
            if kind in NO_POINT:
                manual.setdefault('pending', {})[name] = {'kind': kind, **({'note': note} if note else {})}
                manual['places'].pop(name, None)
                stats['بلا نقطة'] += 1
                continue
            entry = manual['places'].get(name)
            entry = dict(entry) if isinstance(entry, dict) and 'alias' not in entry else {}
            if lat is not None and lon is not None:
                if not (29 < lat < 37 and 33 < lon < 39):
                    print(f'  ! إحداثيات خارج المنطقة، تُركت: {name} {lat}, {lon}')
                    continue
                entry.update({'lat': lat, 'lon': lon, 'precision': 'area' if kind in ('area', 'river') else 'town'})
                manual.get('pending', {}).pop(name, None)
                stats['إحداثيات'] += 1
            elif 'lat' not in entry:
                old = manual['places'].get(name)
                if isinstance(old, list):
                    entry.update({'lat': old[0], 'lon': old[1], 'precision': old[2]})
            if kind and kind != 'alias':
                entry['kind'] = kind
            if note:
                entry['note'] = note
                stats['ملاحظة'] += 1
            if 'lat' in entry:
                manual['places'][name] = entry
            elif note or kind:
                # بلا إحداثيات بعد: احفظ الوصف فقط
                manual.setdefault('pending', {})[name] = {k: v for k, v in entry.items()}
                stats['بانتظار إحداثيات'] += 1
    json.dump(manual, open(mp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(fixes, open(fp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('طُبّق:', dict(stats))


if __name__ == '__main__':
    if len(sys.argv) != 3 or sys.argv[1] not in ('export', 'apply'):
        print(__doc__)
        sys.exit(1)
    (export if sys.argv[1] == 'export' else apply)(sys.argv[2])
