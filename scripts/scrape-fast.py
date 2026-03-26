#!/usr/bin/env python3
"""Fast scraper: jump in big steps (100 IDs), collect all unique messages."""
from bs4 import BeautifulSoup
from urllib.request import urlopen, Request
import json, re, sys, time

HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
CUTOFF = '2026-02-28'

def fetch(channel, before=None):
    url = f'https://t.me/s/{channel}'
    if before: url += f'?before={before}'
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=15) as r:
        return r.read().decode('utf-8')

def parse(html):
    soup = BeautifulSoup(html, 'html.parser')
    msgs = []
    for w in soup.find_all('div', class_='tgme_widget_message'):
        post = w.get('data-post','')
        if '/' not in post: continue
        ch, mid = post.split('/', 1)
        td = w.find('div', class_='tgme_widget_message_text')
        text = td.get_text(separator='\n').strip() if td else ''
        tt = w.find('time')
        ts = tt.get('datetime','') if tt else ''
        msgs.append({'id': mid, 'text': text, 'time': ts, 'post': post})
    return msgs

def scrape_channel_fast(channel, start_id, end_id, step=100):
    """Scrape by jumping in big ID steps from end_id backwards to start_id."""
    all_msgs = {}
    current = end_id
    while current > start_id:
        try:
            html = fetch(channel, str(current))
            msgs = parse(html)
            new = 0
            for m in msgs:
                if m['id'] not in all_msgs:
                    all_msgs[m['id']] = m
                    new += 1
            oldest_date = ''
            if msgs:
                for m in reversed(msgs):
                    if m['time']:
                        oldest_date = m['time'][:10]
                        break
            print(f'  before={current}: {len(msgs)} msgs, +{new} new, oldest={oldest_date}', file=sys.stderr)
            current -= step
            time.sleep(0.3)
        except Exception as e:
            print(f'  Error at {current}: {e}', file=sys.stderr)
            current -= step
    
    # Filter by date
    result = [m for m in all_msgs.values() if m['time'] and m['time'][:10] >= CUTOFF]
    result.sort(key=lambda x: x['time'])
    return result

# ============ SCRAPE @mmirleb ============
print('=== Scraping @mmirleb (ID 10200 to 13000) ===', file=sys.stderr)
mmirleb = scrape_channel_fast('mmirleb', 10200, 13000, step=80)
print(f'@mmirleb: {len(mmirleb)} messages total', file=sys.stderr)

# ============ SCRAPE @C_Military1 ============
# First find the ID range
print('\n=== Finding @C_Military1 ID range ===', file=sys.stderr)
html = fetch('C_Military1')
msgs = parse(html)
if msgs:
    latest_id = int(msgs[0]['id'])
    print(f'  Latest ID: {latest_id}, date: {msgs[0]["time"][:10] if msgs[0]["time"] else "?"}', file=sys.stderr)
    # Estimate start — try going back
    test_id = latest_id - 2000
    html2 = fetch('C_Military1', str(test_id))
    msgs2 = parse(html2)
    if msgs2:
        td = ''
        for m in msgs2:
            if m['time']:
                td = m['time'][:10]
                break
        print(f'  ID {test_id}: date={td}', file=sys.stderr)
    
    # Binary search for Feb 28 start
    lo, hi = max(1, latest_id - 10000), latest_id
    while hi - lo > 200:
        mid = (lo + hi) // 2
        html_t = fetch('C_Military1', str(mid))
        msgs_t = parse(html_t)
        td = ''
        for m in msgs_t:
            if m['time']:
                td = m['time'][:10]
                break
        if td and td >= CUTOFF:
            hi = mid
        else:
            lo = mid
        time.sleep(0.3)
    
    print(f'  Start ID for Feb 28: ~{lo}', file=sys.stderr)
    cmil = scrape_channel_fast('C_Military1', lo, latest_id + 100, step=80)
else:
    cmil = []
    print('  Could not access @C_Military1', file=sys.stderr)

print(f'@C_Military1: {len(cmil)} messages total', file=sys.stderr)

# ============ EXTRACT LOSSES ============
losses = []

# From @mmirleb
for msg in mmirleb:
    text = msg['text']
    date = msg['time'][:10]
    mid = msg['id']
    
    if 'دبّابة ميركافا' in text or 'دبابة ميركافا' in text:
        c = len(re.findall(r'دبّابة\s+ميركافا|دبابة\s+ميركافا', text))
        losses.append({'id':f'mm-tank-{mid}','date':date,'category':'tanks','subcategory':'Merkava','count':c,'description':text[:250].replace('\n',' '),'source':'@mmirleb','messageId':mid})
    
    if ('جرّافة' in text or 'جرافة' in text) and 'D9' in text:
        losses.append({'id':f'mm-d9-{mid}','date':date,'category':'tanks','subcategory':'D9 Bulldozer','count':1,'description':text[:250].replace('\n',' '),'source':'@mmirleb','messageId':mid})
    elif 'جرّافة' in text or 'جرافة D9' in text:
        losses.append({'id':f'mm-d9-{mid}','date':date,'category':'tanks','subcategory':'D9 Bulldozer','count':1,'description':text[:250].replace('\n',' '),'source':'@mmirleb','messageId':mid})
    
    if 'ناقلة جند' in text or 'ناقلة جنود' in text:
        losses.append({'id':f'mm-apc-{mid}','date':date,'category':'tanks','subcategory':'APC','count':1,'description':text[:250].replace('\n',' '),'source':'@mmirleb','messageId':mid})
    
    if re.search(r'إصابات?\s+مؤكّدة', text):
        losses.append({'id':f'mm-cas-{mid}','date':date,'category':'soldiers_wounded','subcategory':'','count':1,'description':text[:250].replace('\n',' '),'source':'@mmirleb','messageId':mid})
    
    if re.search(r'(قاعدة|ثكنة)\s+\S+', text) and ('استهدف' in text or 'قصف' in text):
        losses.append({'id':f'mm-base-{mid}','date':date,'category':'bases','subcategory':'','count':1,'description':text[:250].replace('\n',' '),'source':'@mmirleb','messageId':mid})
    
    if re.search(r'القبّة الحديديّة|منصّات القبّة', text):
        losses.append({'id':f'mm-dome-{mid}','date':date,'category':'infrastructure','subcategory':'Iron Dome','count':1,'description':text[:250].replace('\n',' '),'source':'@mmirleb','messageId':mid})

# From @C_Military1
for msg in cmil:
    text = msg['text']
    date = msg['time'][:10]
    mid = msg['id']
    
    km = re.search(r'مقتل\s+(\d+)\s*جند', text)
    if km:
        losses.append({'id':f'cm-sk-{mid}','date':date,'category':'soldiers_killed','subcategory':'','count':int(km.group(1)),'description':text[:250].replace('\n',' '),'source':'@C_Military1','messageId':mid})
    elif 'مقتل جندي' in text:
        losses.append({'id':f'cm-sk-{mid}','date':date,'category':'soldiers_killed','subcategory':'','count':1,'description':text[:250].replace('\n',' '),'source':'@C_Military1','messageId':mid})
    
    wm = re.search(r'إصابة\s+(\d+)\s*جند', text)
    if wm:
        losses.append({'id':f'cm-sw-{mid}','date':date,'category':'soldiers_wounded','subcategory':'','count':int(wm.group(1)),'description':text[:250].replace('\n',' '),'source':'@C_Military1','messageId':mid})
    
    skm = re.search(r'مقتل\s+(\d+)\s*مستوطن', text)
    if skm:
        losses.append({'id':f'cm-stk-{mid}','date':date,'category':'settlers_killed','subcategory':'','count':int(skm.group(1)),'description':text[:250].replace('\n',' '),'source':'@C_Military1','messageId':mid})
    
    if re.search(r'تدمير\s+(\d+)?\s*دب', text):
        tm = re.search(r'تدمير\s+(\d+)\s*دب', text)
        c = int(tm.group(1)) if tm else 1
        losses.append({'id':f'cm-tank-{mid}','date':date,'category':'tanks','subcategory':'Merkava','count':c,'description':text[:250].replace('\n',' '),'source':'@C_Military1','messageId':mid})

# Deduplicate
seen = set()
unique = []
for l in losses:
    if l['id'] not in seen:
        seen.add(l['id'])
        unique.append(l)

# Daily summary
summary = {}
for l in unique:
    d = l['date']
    if d not in summary: summary[d] = {}
    summary[d][l['category']] = summary[d].get(l['category'], 0) + l['count']

# Totals
totals = {}
for l in unique:
    totals[l['category']] = totals.get(l['category'], 0) + l['count']

result = {
    'lastUpdated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    'sources': ['@mmirleb', '@C_Military1'],
    'dateRange': {'from': CUTOFF, 'to': time.strftime('%Y-%m-%d')},
    'losses': unique,
    'dailySummary': summary,
    'totals': totals,
    'stats': {
        'mmirleb_messages': len(mmirleb),
        'cmilitary_messages': len(cmil),
        'total_loss_entries': len(unique),
    }
}

json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
print(f'\n\nDONE: {len(unique)} loss entries, totals: {totals}', file=sys.stderr)
