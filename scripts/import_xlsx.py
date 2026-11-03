#!/usr/bin/env python3
"""
استيراد ملف Excel الخاص بغرفة الحرب إلى بيانات الموقع.

الاستخدام:
    python3 scripts/import_xlsx.py path/to/warroom.xlsx [--geomelon DIR]

--geomelon: مجلد يحوي حزم @geomelon/lebanon و @geomelon/israel (data.json)
            من npm (رخصة CC0، مصدرها Wikidata). اختياري: عند غيابه يُستعمل
            data/geo/places.json الموجود و data/geo/manual.json فقط.

المخرجات:
    data/events/YYYY-MM-DD.json   أحداث اليوم + الأثر المعلن لليوم
    data/index.json               فهرس الأيام والإحصاءات المجمّعة
    data/geo/places.json          قاموس الأماكن المستعمل (اسم ← إحداثيات)
    data/geo/unresolved.json      أماكن بلا إحداثيات بعد (للاستكمال اليدوي)
    data/geo/location-report.json ما عُدّل في عمود «الموقع» (لتصحيحه في ملف Excel أيضاً)
"""
import argparse
import collections
import datetime as dt
import json
import math
import os
import re
import sys

import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')

CATEGORY = {
    'عمليات المقاومة الإسلامية': 'resistance',
    'اعتداءات وعمليات العدو': 'enemy',
    'سياسي — لبنان': 'political',
}
VERIFY = {'بيان رسمي': 'official', 'متعدد المصادر': 'multi', 'مصدر واحد': 'single'}
LINK = {'مربوط': 'linked', 'مرشّح': 'candidate', 'غير مربوط': 'unlinked'}
FRONT = (33.3, 35.45)  # مرجع لاختيار الأقرب عند تكرار الاسم داخل لبنان


# ---------------------------------------------------------------- أسماء
def norm(s):
    s = re.sub(r'[ً-ْـ]', '', s)
    for a, b in (('أ', 'ا'), ('إ', 'ا'), ('آ', 'ا'), ('ة', 'ه'), ('ى', 'ي'), ('ؤ', 'و'), ('ئ', 'ي')):
        s = s.replace(a, b)
    return re.sub(r'[\s\-–_،,."\'()]+', ' ', s).strip()


def keys(s):
    n = norm(s)
    out = {n, n.replace(' ', '')}
    w = [x[2:] if x.startswith('ال') and len(x) > 3 else x for x in n.split()]
    out.add(' '.join(w))
    out.add(''.join(w))
    return out


def load_geomelon(d):
    idx = {}
    for country, pref in (('lebanon', 0), ('israel', 1)):
        p = os.path.join(d, country, 'package', 'data.json')
        if not os.path.exists(p):
            print(f'  ! لم يُعثر على {p}', file=sys.stderr)
            continue
        for c in json.load(open(p, encoding='utf-8'))['cities']:
            ar = (c.get('translations') or {}).get('ar')
            if not ar or c.get('latitude') is None:
                continue
            dist = math.hypot(c['latitude'] - FRONT[0], c['longitude'] - FRONT[1]) if pref == 0 else 0
            for k in keys(ar):
                idx.setdefault(k, []).append((pref, dist, round(c['latitude'], 4), round(c['longitude'], 4), c['name']))
    return idx


class Geocoder:
    def __init__(self, geomelon_dir):
        self.manual = json.load(open(os.path.join(DATA, 'geo', 'manual.json'), encoding='utf-8'))['places']
        pp = os.path.join(DATA, 'geo', 'places.json')
        self.cache = json.load(open(pp, encoding='utf-8')) if os.path.exists(pp) else {}
        self.gaz = load_geomelon(geomelon_dir) if geomelon_dir else {}
        self.used = {}
        self.unresolved = collections.Counter()
        # أماكن معروفة بلا نقطة: مناطق واسعة، مفاهيم عملياتية، أنهار
        self.nopoint = json.load(open(os.path.join(DATA, 'geo', 'manual.json'), encoding='utf-8')).get('pending', {})

    def _manual(self, name, depth=0):
        m = self.manual.get(name)
        if m is None or depth > 3:
            return None
        if isinstance(m, dict) and 'alias' in m:
            target = m['alias']
            return self._manual(target, depth + 1) or self._gaz(target) or self.cache.get(target)
        if isinstance(m, dict):
            r = {'lat': m['lat'], 'lon': m['lon'], 'precision': m['precision'], 'source': 'manual'}
            if m.get('kind') and m['kind'] != 'town':
                r['kind'] = m['kind']
            return r
        return {'lat': m[0], 'lon': m[1], 'precision': m[2], 'source': 'manual'}

    def _gaz(self, name):
        cands = []
        for k in keys(name):
            cands += self.gaz.get(k, [])
        if not cands:
            return None
        c = sorted(cands)[0]
        return {'lat': c[2], 'lon': c[3], 'precision': 'town', 'source': 'wikidata', 'en': c[4]}

    def known(self, name):
        """هل الاسم مكان معروف (يدوياً أو في القاموس)؟ بلا أثر جانبي."""
        if name in self.nopoint:
            return True
        if self.used.get(name):
            return self.used[name].get('source') != 'excel'
        return bool(self._manual(name) or self._gaz(name))

    def resolve(self, name, excel_lat=None, excel_lon=None):
        if not name:
            return None
        if name in self.used:
            if self.used[name] is None:
                self.unresolved[name] += 1
            return self.used[name]
        if name in self.nopoint:
            r = {'lat': None, 'lon': None, 'precision': None, 'source': 'manual', 'kind': self.nopoint[name].get('kind'), 'nopoint': True}
            self.used[name] = r
            return r
        r = self._manual(name) or self._gaz(name)
        if r is None and name in self.cache and self.cache[name].get('source') != 'excel':
            r = self.cache[name]
        if r is None and excel_lat is not None:
            r = {'lat': float(excel_lat), 'lon': float(excel_lon), 'precision': 'approx', 'source': 'excel'}
        if r is None:
            self.unresolved[name] += 1
        self.used[name] = r
        return r


class LocationCleaner:
    """ينظّف عمود «الموقع»: يحذف العبارات، يقصّ اللواحق، يصحّح الإملاء، ويقسّم الأماكن المتعددة."""

    def __init__(self, geo):
        f = json.load(open(os.path.join(DATA, 'geo', 'location-fixes.json'), encoding='utf-8'))
        self.geo = geo
        self.drop = set(f['drop'])
        self.rename = f['rename']
        self.keep = set(f['keep'])
        self.trailing = [re.compile(x) for x in f['trailing']]
        self.report = {}

    @staticmethod
    def basic(v):
        v = v.replace('ی', 'ي').replace('ک', 'ك')
        return re.sub(r'\s+', ' ', v).strip()

    def clean_one(self, v):
        v = self.rename.get(self.basic(v), self.basic(v))
        if v in self.keep:
            return v
        prev = None
        while prev != v:
            prev = v
            for t in self.trailing:
                v = t.sub('', v).strip()
        return self.rename.get(v, v)

    def parts(self, raw):
        if not raw:
            return []
        v = self.basic(raw)
        out = self._parts(v)
        if out != [raw]:
            rec = self.report.setdefault(raw, {'result': out, 'count': 0})
            rec['count'] += 1
        return out

    def _parts(self, v):
        if v in self.drop:
            return []
        v = self.clean_one(v)
        if not v or v in self.drop:
            return []
        if v in self.keep or ' و' not in v or self.geo.known(v):
            return [v]
        pieces = re.split(r'\s+و(?:في\s+(?:بلدة|مستوطنة)\s+|قاعدة\s+|ثكنة\s+)?', v)
        pieces = [self.clean_one(p) for p in pieces if p.strip()]
        pieces = [p for p in pieces if p and p not in self.drop]
        known = [p for p in pieces if self.geo.known(p)]
        if len(pieces) > 1 and known:
            return list(dict.fromkeys(pieces))
        return [v]


# ---------------------------------------------------------------- أدوات
def s(v):
    return str(v).strip() if v is not None and str(v).strip() else None


def split_refs(v):
    v = s(v)
    if not v:
        return []
    return [x.strip() for x in re.split(r'[،,]', v) if x.strip()]


def hhmm(v):
    v = s(v)
    if not v:
        return None
    m = re.match(r'(\d{1,2}):(\d{2})', v)
    return f'{int(m.group(1)):02d}:{m.group(2)}' if m else v


def minutes(t):
    h, m = t.split(':')
    return int(h) * 60 + int(m)


# ---------------------------------------------------------------- استيراد
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('xlsx')
    ap.add_argument('--geomelon')
    a = ap.parse_args()

    wb = openpyxl.load_workbook(a.xlsx, read_only=True)
    geo = Geocoder(a.geomelon)
    cleaner = LocationCleaner(geo)

    def locate(raw, excel_lat=None, excel_lon=None):
        names = cleaner.parts(raw)
        places = []
        for n in names:
            g = geo.resolve(n, excel_lat, excel_lon) if len(names) == 1 else geo.resolve(n)
            p = {'name': n}
            if g and g.get('lat') is not None:
                p.update({'lat': g['lat'], 'lon': g['lon'], 'geo': g['precision']})
            if g and g.get('kind'):
                p['kind'] = g['kind']
            places.append(p)
        first = next((p for p in places if 'lat' in p), places[0] if places else {})
        return {
            'location': places[0]['name'] if places else None,
            'lat': first.get('lat'), 'lon': first.get('lon'), 'geo': first.get('geo'),
            'kind': places[0].get('kind') if places else None,
            'places': places if len(places) > 1 else [],
        }

    events, impacts = [], []
    for r in list(wb['الأحداث'].iter_rows(values_only=True))[1:]:
        if not r[0]:
            continue
        cat = CATEGORY.get(s(r[3]))
        if not cat:
            print('  ! تصنيف غير معروف:', r[0], r[3], file=sys.stderr)
            continue
        L = locate(s(r[8]), r[9], r[10])
        events.append({
            'id': s(r[0]), 'date': str(r[1])[:10], 'time': hhmm(r[2]) or '00:00',
            'category': cat, 'subtype': s(r[4]) or 'أخرى', 'text': s(r[5]) or '',
            'target': s(r[6]), 'impact': s(r[7]), **L,
            'source': s(r[11]), 'url': s(r[12]), 'duplicates': split_refs(r[13]),
            'related': s(r[14]), 'verification': VERIFY.get(s(r[15]), 'single'),
        })

    for r in list(wb['الأثر المعلن'].iter_rows(values_only=True))[1:]:
        if not r[0]:
            continue
        L = locate(s(r[5]))
        link = LINK.get(s(r[9]), 'unlinked')
        impacts.append({
            'id': s(r[0]), 'date': str(r[1])[:10], 'time': hhmm(r[2]) or '00:00',
            'type': s(r[3]) or 'أخرى', 'text': s(r[4]) or '', **L,
            'source': s(r[6]), 'url': s(r[7]), 'duplicates': split_refs(r[8]),
            'link': link, 'linkedEvents': split_refs(r[10]) if link != 'unlinked' else [],
        })

    # ربط الأثر بالعمليات
    by_id = {e['id']: e for e in events}
    for im in impacts:
        if im['link'] != 'linked':
            continue
        for eid in im['linkedEvents']:
            e = by_id.get(eid)
            if not e:
                continue
            gap = (dt.date.fromisoformat(im['date']) - dt.date.fromisoformat(e['date'])).days * 1440 \
                + minutes(im['time']) - minutes(e['time'])
            e.setdefault('impacts', []).append({'id': im['id'], 'type': im['type'], 'gap': gap, 'date': im['date']})
            im.setdefault('events', []).append({'id': e['id'], 'date': e['date'], 'time': e['time'],
                                                'subtype': e['subtype'], 'gap': gap})

    # كتابة الملفات اليومية
    out_dir = os.path.join(DATA, 'events')
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        if f.endswith('.json'):
            os.remove(os.path.join(out_dir, f))
    days = collections.defaultdict(lambda: {'events': [], 'impact': []})
    for e in events:
        days[e['date']]['events'].append(e)
    for im in impacts:
        days[im['date']]['impact'].append(im)

    def clean(o):
        return {k: v for k, v in o.items() if v not in (None, [], '')}

    index_days = []
    for d in sorted(days):
        ev = sorted(days[d]['events'], key=lambda x: x['time'])
        im = sorted(days[d]['impact'], key=lambda x: x['time'])
        c = collections.Counter(x['category'] for x in ev)
        with open(os.path.join(out_dir, f'{d}.json'), 'w', encoding='utf-8') as fh:
            json.dump({'date': d, 'events': [clean(x) for x in ev], 'impact': [clean(x) for x in im]},
                      fh, ensure_ascii=False, separators=(',', ':'))
        index_days.append({'date': d, 'total': len(ev), 'resistance': c['resistance'],
                           'enemy': c['enemy'], 'political': c['political'], 'impact': len(im)})

    # فهرس وإحصاءات
    cat_sub = collections.defaultdict(collections.Counter)
    for e in events:
        cat_sub[e['category']][e['subtype']] += 1
    def all_places(o):
        return o['places'] or ([{'name': o['location'], 'lat': o['lat'], 'lon': o['lon'], 'geo': o['geo']}] if o['location'] else [])
    loc_count = collections.Counter(p['name'] for e in events for p in all_places(e) if p.get('geo') not in ('area', None))
    top_locations = []
    for name, n in loc_count.most_common(30):
        g = geo.used.get(name)
        top_locations.append({'name': name, 'count': n, 'lat': g['lat'], 'lon': g['lon']})
    impact_month = collections.defaultdict(collections.Counter)
    for im in impacts:
        impact_month[im['date'][:7]][im['type']] += 1
    index = {
        'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'),
        'sourceFile': os.path.basename(a.xlsx),
        'firstDate': index_days[0]['date'], 'lastDate': index_days[-1]['date'],
        'totals': {
            'events': len(events),
            **collections.Counter(e['category'] for e in events),
            'impact': len(impacts),
            'geolocated': sum(1 for e in events if e['lat'] is not None),
            'withLocation': sum(1 for e in events if e['location']),
        },
        'verification': dict(collections.Counter(e['verification'] for e in events)),
        'subtypes': {k: dict(v.most_common()) for k, v in cat_sub.items()},
        'impactTypes': dict(collections.Counter(im['type'] for im in impacts).most_common()),
        'impactLinks': dict(collections.Counter(im['link'] for im in impacts)),
        'impactByMonth': {k: dict(v) for k, v in sorted(impact_month.items())},
        'sources': dict(collections.Counter(e['source'] for e in events).most_common()),
        'topLocations': top_locations,
        'days': index_days,
    }
    with open(os.path.join(DATA, 'index.json'), 'w', encoding='utf-8') as fh:
        json.dump(index, fh, ensure_ascii=False, indent=1)

    # بيانات الخريطة الزمنية (مضغوطة) — public/data/map.json
    day_list = [d['date'] for d in index_days]
    day_pos = {d: i for i, d in enumerate(day_list)}
    subs_list, locs_list = [], []
    sub_pos, loc_pos = {}, {}
    def pos(table, lookup, v):
        if v not in lookup:
            lookup[v] = len(table)
            table.append(v)
        return lookup[v]
    CAT_N = {'enemy': 0, 'resistance': 1, 'political': 2}
    GEO_N = {'town': 0, 'approx': 1, 'area': 2}
    pts = []
    for e in sorted(events, key=lambda x: (x['date'], x['time'])):
        for p in all_places(e):
            if p.get('lat') is None:
                continue
            pts.append([day_pos[e['date']], CAT_N[e['category']], p['lat'], p['lon'],
                        pos(subs_list, sub_pos, e['subtype']), pos(locs_list, loc_pos, p['name']), GEO_N.get(p['geo'], 1)])
    for im in sorted(impacts, key=lambda x: (x['date'], x['time'])):
        for p in all_places(im):
            if p.get('lat') is None:
                continue
            pts.append([day_pos[im['date']], 3, p['lat'], p['lon'],
                        pos(subs_list, sub_pos, im['type']), pos(locs_list, loc_pos, p['name']), GEO_N.get(p['geo'], 1)])
    pub = os.path.join(ROOT, 'public', 'data')
    os.makedirs(pub, exist_ok=True)
    with open(os.path.join(pub, 'map.json'), 'w', encoding='utf-8') as fh:
        json.dump({'days': day_list, 'subtypes': subs_list, 'locations': locs_list, 'points': pts},
                  fh, ensure_ascii=False, separators=(',', ':'))

    places = {k: v for k, v in sorted(geo.used.items()) if v and v.get('lat') is not None}
    with open(os.path.join(DATA, 'geo', 'places.json'), 'w', encoding='utf-8') as fh:
        json.dump(places, fh, ensure_ascii=False, indent=0)
    with open(os.path.join(DATA, 'geo', 'location-report.json'), 'w', encoding='utf-8') as fh:
        json.dump(dict(sorted(cleaner.report.items(), key=lambda x: -x[1]['count'])), fh, ensure_ascii=False, indent=1)
    with open(os.path.join(DATA, 'geo', 'unresolved.json'), 'w', encoding='utf-8') as fh:
        json.dump(dict(geo.unresolved.most_common()), fh, ensure_ascii=False, indent=0)

    t = index['totals']
    print(f"أحداث: {t['events']} · أثر معلن: {t['impact']} · أيام: {len(index_days)}")
    print(f"أحداث بموقع: {t['withLocation']} · منها بإحداثيات: {t['geolocated']}")
    print(f"أماكن بلا إحداثيات: {len(geo.unresolved)} ({sum(geo.unresolved.values())} ذكر)")
    print(f"تصحيحات الموقع: {len(cleaner.report)} قيمة · {sum(r['count'] for r in cleaner.report.values())} ذكر"
          f" · محذوفة {sum(r['count'] for r in cleaner.report.values() if not r['result'])}"
          f" · مقسّمة {sum(r['count'] for r in cleaner.report.values() if len(r['result']) > 1)}")
    print('مصادر الإحداثيات:', dict(collections.Counter(v['source'] for v in places.values())))


if __name__ == '__main__':
    main()
